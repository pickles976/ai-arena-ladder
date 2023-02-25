import { Client, BeanstalkJobState} from 'node-beanstalk';
import { data } from './json.js';
import { GalaxyData, GALAXY_PARAMS, UserData } from "ai-arena-map-headless"
import { createWar, createStars, getAllChampions, getAllCode, getAllUsers, updateChampions, updateStars, updateGalaxy, deleteAllStars } from './supabaseClient.js';
import seedrandom from 'seedrandom';
import { shuffle } from './utils.js';

const EMPTY_TURN_DURATION = 1000

const NUM_STARS = 20
const SEED = 1234

const MAX_QUEUE = 5
let currentBattle = null
let battleCount = 0

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

let userStrength = {}

let starKeyDict = {}

let options = {
    host: "localhost",
    port: "11300"
}

// https://app.supabase.com/project/kbnorlxawefgklyeofdm/api

async function initializeGame() {

    // Make all Math.random() deterministic
    seedrandom(SEED, { global: true });

    // Create Galaxy
    galaxy = new GalaxyData(NUM_STARS, GALAXY_PARAMS)

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
    codeList.forEach((code) => codeDict[code.id] = prepareCode(code.code))

    // Inject code strings into champion objects
    Object.values(championDict).forEach((champion) => champion.code = codeDict[champion.code])

    // Add users to Galaxy
    // User(id, name, color)
    galaxy.setUsers(userList)

    // DB CRAP

    // Save Galaxy off to DB
    console.log('Saving Galaxy to DB')
    let war = await createWar(NUM_STARS, SEED, champions.map((champ) => champ.id))
    galaxy.id = war[0].id


    // Save stars off to DB
    console.log('Saving Stars to DB')
    let starData = galaxy.stars.map((star) => { return {
        'galactic_war': galaxy.id, 
        'champion' : championDict[star.owner?.uuid]?.id, 
        'relative_id' : star.uuid
    }})

    starData = await createStars(starData)
    
    // Store star DB ids for upsert later on
    starData.forEach((star) => starKeyDict[star.relative_id] = star.id)

    console.log(`Starting game`)

    await gameStep()

}

async function updateStarOwner(star, champion) {
    let starDbData = {
        'id' : starKeyDict[star.uuid], 'champion' : champion.id
    }

    await updateStars([starDbData])
}

async function gameStep() {

    if (galaxyTurnCount < 999) {

        if (starTurnCount < galaxy.stars.length) {
            let star = galaxy.stars[starTurnCount]
            starTurnCount++
            starTurn(star)
        } else {

            console.log(`${galaxyTurnCount},000 years of warfare have passed...`)

            starTurnCount = 0
            galaxyTurnCount++

            // Tally up the people
            userStrength = {}

            galaxy.stars.forEach((star) => {
                if (star.owner) {
                    if (star.owner.uuid in userStrength) {
                        userStrength[star.owner.uuid] = userStrength[star.owner.uuid] + 1
                    } else {
                        userStrength[star.owner.uuid] = 1
                    }
                }
            })

            console.log(userStrength)

            // End game if one user is left
            if (Object.keys(userStrength).length <= 1) {
                await gameOver(Object.keys(userStrength)[0])

                // TODO: Clear out state and restart game?
                return
            } 

            // shuffle stars 
            galaxy.stars = shuffle(galaxy.stars)

            return gameStep()
        }

    } else {
        console.log('Game could not conclude')
        // console.log(galaxy.stars)
    }

}

async function starTurn(star) {

    if (star.owner) {

        console.log(`Turn for star ${star.name} owned by ${star.owner.name}`)

        star.update()

        let enemyStars = galaxy.getEnemyStarsInRange(star.uuid)
        let emptyStars = galaxy.getUnownedStarsInRange(star.uuid)
        let target

        if (emptyStars.length > 0) {
            console.log(`${star.owner.name} has conquered ${emptyStars[0].name}`)
            return setTimeout(() => conquerStar(star, emptyStars[0]), EMPTY_TURN_DURATION)
        }
        else if (enemyStars.length > 0 && Math.random() < 0.1) {

            // Battle if an enemy is within range
            target = enemyStars[0]
            console.log(`${star.owner.name} is attacking ${target.owner.name} at: ${target.name}`)
            currentBattle = createBattleMessage(target.uuid, star.owner.uuid, target.owner.uuid)
            await enqueueBattle()
            star.energy -= star.position.distance(target.position)

        }
        else {
            console.log(`No nearby stars to invade!`)
            return gameStep()
        }

    } else {
        console.log(`Turn Skip`)
        return gameStep()
    }

}

async function gameOver(winner) {

    console.log(`${userDict[winner]} has won the galactic war!`)

    let championObjects = Object.values(championDict).map((champ) => {return {'id' : champ.id, 'wins' : champ.wins, 'losses' : champ.losses}})
    console.log(championObjects)
    updateChampions(championObjects)

    // Update Galaxy
    await updateGalaxy({ 'id' : galaxy.id, 'winner' : userDict[winner].id, 'completed_at' : ((new Date()).toISOString()).toLocaleString('zh-TW')})

    // Delete all stars with galaxy ID
    await deleteAllStars(galaxy.id)

}

async function conquerStar(star, target) {
    target.updateOwner(star.owner)
    star.energy -= star.position.distance(target.position)
    await updateStarOwner(target, championDict[star.owner.uuid])
    return gameStep()
}

function prepareCode(code) {

    return {
        'BaseStartCode' : code.baseStart,
        'BaseUpdateCode' : code.baseUpdate,
        'ShipStartCode' : code.shipStart,
        'ShipUpdateCode' : code.shipUpdate
    }

}

function createBattleMessage(star, attacker, defender) {
    battleCount++
    return {
        'id' : `${battleCount}`,
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
        return gameStep()
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

    console.log(`Queue full. Battles in queue: ${stats['current-jobs-ready']}`)
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

        let winner
        let loser 

        if (job.winner) {

            // Do something with the winner
            if (job.winner == 1) {
                winner = payload.champion1
                loser = payload.champion2
            } else {
                winner = payload.champion2
                loser = payload.champion1
            }

        } else {
            let score = JSON.parse(payload.score)
            // Declare the least deaths as winner
            if (score['team 0'].deaths < score['team 1'].deaths) {
                winner = payload.champion1
                loser = payload.champion2
            } else {
                winner = payload.champion2
                loser = payload.champion1
            }
        }
        c.delete(job.id)

        if (winner) {

            // update star locally
            console.log(`${userDict[winner.owner].name} defeated ${userDict[loser.owner].name} at ${star.name}`)
            star.updateOwner(userDict[winner.owner])

            // update star in db
            await updateStarOwner(star, winner)

            // update scores
            Object.values(championDict).find((c) => c.id == winner.id).wins += 1
            Object.values(championDict).find((c) => c.id == loser.id).losses += 1
        }
    }
}

// connect to beasntalkd server
const c = new Client(options);
await c.connect();

// gameStep()

await initializeGame()

// c.disconnect()