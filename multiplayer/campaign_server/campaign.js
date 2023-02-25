import { Client, BeanstalkJobState} from 'node-beanstalk';
import { data } from './json.js';
import { GalaxyData, GALAXY_PARAMS, UserData } from "ai-arena-map-headless"
import { getAllChampions, getAllCode, getAllUsers } from './supabaseClient.js';
import seedrandom from 'seedrandom';


let params = GALAXY_PARAMS
params.numStars = 20

const MAX_QUEUE = 5
let currentBattle = null

let starTurnCount = 0
let galaxyTurnCount = 0

let galaxy = null

// map user ids to UserData and code ids to code objects
let userDict = {}
let codeDict = {}

// map user id's to champion objects
let championDict = {}
let userList = []
let codeList = []

let options = {
    host: "localhost",
    port: "11300"
}

// https://app.supabase.com/project/kbnorlxawefgklyeofdm/api

async function initializeGame() {

    // Make all Math.random() deterministic
    seedrandom(1234, { global: true });

    // Create Galaxy
    galaxy = new GalaxyData(params)

    console.log(`Galaxy contains: ${galaxy.stars.length} star systems`)

    // Get champions
    let champions = await getAllChampions()

    // Create dict of userids -> Champions
    champions.forEach((champion) => championDict[champion.owner] = champion)

    // Get user ids from champions, store in a dict
    userList = Object.keys(championDict)
    userList = await getAllUsers(userList)
    userList.forEach((user) => userDict[user.id] = new UserData(user.id, user.username, championDict[user.id].color))
    userList = Object.values(userDict)

    // Get code ids from champions, store in a dict
    champions.forEach((champion) => codeList.push(champion.code))
    codeList = await getAllCode(codeList)
    codeList.forEach((code) => codeDict[code.id] = code.code)

    // Inject code strings into champion objects
    Object.values(championDict).forEach((champion) => champion.code = codeDict[champion.code])

    // Add users to Galaxy
    // User(id, name, color)
    galaxy.setUsers(userList)

    // TODO: Save Galaxy + Stars off to db

    console.log(`Starting game`)
    await gameStep()

}

async function gameStep() {

    if (galaxyTurnCount < 188) {

        if (starTurnCount < galaxy.stars.length) {
            let star = galaxy.stars[starTurnCount]
            starTurnCount++
            await starTurn(star)
        } else {
            starTurnCount = 0
            galaxyTurnCount++
            console.log(`${galaxyTurnCount},000 years of warfare have passed...`)
            // TODO: tally up the people
            gameStep()
        }

    } else {
        console.log(galaxy.stars)
    }

}

async function starTurn(star) {

    if (star.owner) {

        console.log(`Turn for star ${star.name} owned by ${star.owner.name}`)

        star.update()

        let enemyStars = galaxy.getEnemyStarsInRange(star.uuid)
        let emptyStars = galaxy.getUnownedStarsInRange(star.uuid)
        let target

        // TODO: set the winner and print it out

        if (enemyStars.length > 0) {

            // Battle if an enemy is within range
            target = enemyStars[0]
            console.log(`${star.owner.name} is attacking ${target.owner.name} at: ${target.name}`)
            currentBattle = createBattleMessage(target.uuid, star.owner.uuid, target.owner.uuid)
            await enqueueBattle()
            star.energy -= star.position.distance(target.position)

        } else if (emptyStars.length > 0) {

            // Just conquer the nearest star
            target = emptyStars[0]
            target.updateOwner(star.owner)
            console.log(`${star.owner.name} has conquered ${target.name}`)
            star.energy -= star.position.distance(target.position)
            gameStep()

        } else {
            console.log(`No nearby stars to invade!`)
            gameStep()
        }

    } else {
        console.log(`Star unowned`)
        gameStep()
    }

}

function createBattleMessage(star, attacker, defender) {
    return {
        'id' : '0',
        'star_id' : star,
        'champion1' : championDict[attacker],
        'champion2' : championDict[defender]
    }

}

async function enqueueBattle() {

    // Check if we were able to add the battle to the queue
    let didEnqueue = await tryEnqueueBattle(currentBattle)

    console.log(`Was able to enqueue battle: ${currentBattle.id}? ${didEnqueue}`)

    if (didEnqueue) {
        await checkQueue()
        gameStep()
    } else {
        // Trying again in 1s
        console.log("Trying again in 1s")
        await setTimeout(enqueueBattle, 1000)
    }

}

/**
 * Attempts to enqueue a battle if the queue isn't full. 
 * Returns true or false
 * @param {*} battleData 
 * @returns 
 */
async function tryEnqueueBattle(battleData) {

    // Use the Games tube
    await c.use('games')
    let stats = await c.statsTube('games')

    // If active queue is not full
    if (stats['current-jobs-ready'] < MAX_QUEUE) {

        // put our very important job
        const putJob = await c.put(battleData, 40);

        if (putJob.state !== BeanstalkJobState.ready) {
            // as a result of put command job can done in `buried` state,
            // or `delayed` in case delay or client's default delay been specified
            throw new Error('job is not in ready state');
        }

        return true
    }

    return false

}

/**
 * Check the queue for results objects and update if the exist
 */
async function checkQueue() {

    // use our own tube
    await c.use('results')

    // watch our tube to be able to reserve from it
    await c.watch('results')

    // acquire new job
    const job = await c.reserveWithTimeout(1);

    if (job) {

        // Determine who won
        console.log(job)

        let payload = job.payload
        let star = galaxy.starDict[payload.star_id]

        if (job.winner) {

            // Do something with the winner
            if (job.winner == 1) {
                star.owner.updateOwner(userDict[payload.champion1.owner])
            } else {
                star.owner.updateOwner(userDict[payload.champion2.owner])
            }

        } else {

            let score = JSON.parse(payload.score)

            // Declare the least deaths as winner
            if (score['team 0'].deaths < score['team 1'].deaths) {
                star.updateOwner(userDict[payload.champion1.owner])
            } else {
                star.updateOwner(userDict[payload.champion2.owner])
            }
        }

        c.delete(job.id)
    }
}

// connect to beasntalkd server
const c = new Client(options);
await c.connect();

// gameStep()

await initializeGame()

// c.disconnect();