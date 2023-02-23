import { Client, BeanstalkJobState} from 'node-beanstalk';
import { data } from './json.js';

const MAX_QUEUE = 5
let currentBattle = null

let options = {
    host: "localhost",
    port: "11300"
}

async function gameStep() {
    // Make some decision

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
        gameStep()
    } else {
        // Trying again in 1s
        console.log("Trying again in 1s")
        setTimeout(enqueueBattle, 1000)
    }

}

/**
 * 
 * @param {*} battleData 
 * @returns 
 */
async function tryEnqueueBattle(battleData) {

    // use our own tube
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
 * 
 */
async function checkQueue() {

    // use our own tube
    await c.use('results')

    // watch our tube to be able to reserve from it
    await c.watch('results')

    // acquire new job
    const job = await c.reserveWithTimeout(20);

    // Do something with this job
    console.log(job)

    c.delete(job.id)
}

// connect to beasntalkd server
const c = new Client(options);
await c.connect();

gameStep()

// c.disconnect();