import { Client, BeanstalkJobState} from 'node-beanstalk';
import { createGame } from './game.js';

// Monkey patch calls
global.alert = function(x){ 
  x === 'undefined' ? console.error('undefined') : console.error(x); return; 
}; 

console.log("Monkey patching console. console.log will not print.")
console.print = console.log
console.log = (x) => {}

let jobData = null

let campaign_ip = process.env.DROPLET_IP

let options = {
    host: campaign_ip ? campaign_ip : "host.docker.internal",
    // host: "157.230.2.211",
    port: "11300"
}

const c = new Client(options);

// connect to beasntalkd server
await c.connect();

// Acquire a game and run it if possible
async function tryAcquireGame() {

  // use our own tube
  await c.use('games');

  let stats = await c.statsTube('games')
  // console.log(`${stats['total-jobs']} jobs in queue!`)
  console.log(stats)

  // watch our tube to be able to reserve from it
  await c.watch('games')

  // acquire new job
  const job = await c.reserveWithTimeout(5);

  if (job) {

    console.print(`Running job ${job.id} ${new Date()}`)

    jobData = job.payload

    let data = {
      'team0': job.payload["champion1"]["code"],
      'team1': job.payload["champion2"]["code"]
    }

    /*
      ...Run the game with callbacks
    */
    try {
      await createGame(data, async (res) => {
        let results = jobData
        results.winner = res.winner
        results.score = res.score
        await c.delete(job.id);
        await sendResult(results) // send result to Campaign queue
        setTimeout(tryAcquireGame, 0)
      })
    } catch(e) {
      console.log(e)
      setTimeout(tryAcquireGame, 0)
    }
  } else {
    setTimeout(tryAcquireGame, 0)
  }
}

// If any valid game results exist, send those to the results tube
async function sendResult(result) {

    await c.use('results')

    // put our very important job
    const putJob = await c.put(result, 40);

    if (putJob.state !== BeanstalkJobState.ready) {
      // as a result of put command job can done in `buried` state,
      // or `delayed` in case delay or client's default delay been specified
      throw new Error('job is not in ready state');
    }
}

//
await tryAcquireGame()