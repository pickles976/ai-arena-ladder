import { Client, BeanstalkJobState} from 'node-beanstalk';
import { GalaxyData, GALAXY_PARAMS, UserData } from "ai-arena-map-headless"
import { createWar, createStars, getAllChampions, getAllCode, getAllUsers, updateChampions, updateStars, updateGalaxy, deleteAllStars } from './supabaseClient.js';
import seedrandom from 'seedrandom';
import { shuffle } from './utils.js';
import { sanitizeCode } from './sanitizeCode.js';
import { War } from './war.js';

const EMPTY_TURN_DURATION = 250

const NUM_STARS = 5000
const SEED = 1234

const MAX_QUEUE = 5
let currentBattle = null
let battleCount = 0

let userStrength = {}

let didEnqueue = true
let war = null

let options = {
    host: "localhost",
    port: "11300"
}

let turnQueue = []

async function initializeGame() {

    // Make all Math.random() deterministic
    seedrandom(SEED, { global: true });

    war = new War()
    await war.initialize()
    
    console.log(`Starting game`)
    newTurn()

}

async function newTurn() {

    // Queue up turns for all occupied stars
    war.shuffleStars()
    turnQueue = war.getOwnedStars()

    // Tally up remaining players
    userStrength = war.getPlayerStrength()
    console.log(userStrength)

    // End game if one user is left
    if (Object.keys(userStrength).length <= 1) {
        await gameOver(Object.keys(userStrength)[0])

        // Clear out state and restart game
        war = await new War()
        return
    } 

    queueConsumer()
}

async function gameOver(winner) {
    await war.gameOver(winner)
}

async function queueConsumer(){

    if (turnQueue.length <= 0) {
        newTurn()
        return
    }

    // If active queue is not full
    if (didEnqueue) { 
        await starTurn(turnQueue.pop())
    }

    setTimeout(queueConsumer, 0)
}

async function starTurn(star) {

    console.log(`Turn for star ${star.name} owned by ${star.owner.name}`)
    star.update()
    star.update()

    let enemyStars = war.galaxy.getEnemyStarsInRange(star.uuid)
    let emptyStars = war.galaxy.getUnownedStarsInRange(star.uuid)
    let target

    if (enemyStars.length > 0) {

        // Battle if an enemy is within range
        target = enemyStars[0]
        console.log(`${star.owner.name} is attacking ${target.owner.name} at: ${target.name}`)
        currentBattle = createBattleMessage(target.uuid, star.owner.uuid, target.owner.uuid)
        await enqueueBattle()
        star.energy -= star.position.distance(target.position)
    }
    else if (emptyStars.length > 0) {
        console.log(`${star.owner.name} has conquered ${emptyStars[0].name}`)
        return await setTimeout(() => conquerStar(star, emptyStars[0]), EMPTY_TURN_DURATION)
    }
    else {
        console.log(`No nearby stars to invade!`)
    }
}

async function conquerStar(star, target) {
    target.updateOwner(star.owner)
    star.energy -= star.position.distance(target.position)
    target.energy -= star.position.distance(target.position)
    await war.updateStarOwner(target, war.championDict[star.owner.uuid])
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
    didEnqueue = await tryEnqueueBattle(currentBattle)

    console.log(`Was able to enqueue battle: ${currentBattle.id}? ${didEnqueue}`)

    if (didEnqueue) {
        await checkQueue()
        return
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
        let star = war.galaxy.starDict[payload.star_id]

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
            console.log(`${war.userDict[winner.owner].name} defeated ${war.userDict[loser.owner].name} at ${star.name}`)
            star.updateOwner(war.userDict[winner.owner])

            // update star in db
            await updateStarOwner(star, winner)

            // update scores
            Object.values(war.championDict).find((c) => c.id == winner.id).wins += 1
            Object.values(war.championDict).find((c) => c.id == loser.id).losses += 1
        }
    }
}

// connect to beasntalkd server
const c = new Client(options);
await c.connect();

await initializeGame()