import { Client, BeanstalkJobState} from 'node-beanstalk';
import { data } from './json.js';
import { Galaxy, GALAXY_PARAMS } from 'ai-arena-map'

const MAX_QUEUE = 5
let currentBattle = null

let galaxy = null
let championsList = []
let users = []

let options = {
    host: "localhost",
    port: "11300"
}

function initializeGame() {

    // Create Galaxy
    galaxy = new Galaxy(GALAXY_PARAMS)

    // Get champions

    // Get users

    // Add users to Galaxy
    galaxy.setUsers(users)

    // Save Galaxy + Stars off to db

}

async function gameStep() {

    // For each star in the galaxy

    // Make some decision
    // TODO: stuff

    // Get the battle if it exists
    currentBattle = data
    currentBattle.id = (Math.random() * 1000).toString()

    // Try to enqeue the battle
    await enqueueBattle()

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

        if (job.winner) {
            // Do something with the winner
        } else {
            // Declare the higher k/d as the winner
        }

        c.delete(job.id)
    }
}

// connect to beasntalkd server
const c = new Client(options);
await c.connect();

gameStep()

// c.disconnect();