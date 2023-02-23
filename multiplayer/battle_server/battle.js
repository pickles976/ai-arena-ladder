import { Client, BeanstalkJobState} from 'node-beanstalk';

let results = {
  winner: 2,
  stats: {
    joe : "momma"
  }
}

let options = {
    host: "localhost",
    port: "11300"
}

const c = new Client(options);

// connect to beasntalkd server
await c.connect();

async function tryAcquireGame() {

  // use our own tube
  await c.use('games');

  let stats = await c.statsTube('games')
  // console.log(`${stats['total-jobs']} jobs in queue!`)
  console.log(stats)

  // watch our tube to be able to reserve from it
  await c.watch('games')

  // acquire new job
  const job = await c.reserveWithTimeout(10);

  console.log(job)

  if (job) {

    /*
      ...do some important job
    */

    await c.delete(job.id);
  }

}

async function sendResult(result) {

  if (result) {

    await c.use('results')

    // put our very important job
    const putJob = await c.put(results, 40);

    if (putJob.state !== BeanstalkJobState.ready) {
      // as a result of put command job can done in `buried` state,
      // or `delayed` in case delay or client's default delay been specified
      throw new Error('job is not in ready state');
    }

  }
}

async function loop() {
  await tryAcquireGame()
  // await sendResult()
  loop()
}

await loop()

// c.disconnect();