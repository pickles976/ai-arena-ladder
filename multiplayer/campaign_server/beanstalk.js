import { Client, BeanstalkJobState} from 'node-beanstalk';

let options = {
    host: "localhost",
    port: "11300"
}

class BeanstalkClient {

    async constructor() {
        this.c = new Client(options)
        c.connect();
    }

    async enqueueBattle(battleData) {
            // Use the Games tube
    await c.use('games')

    // put our very important job
    const putJob = await c.put(battleData, 40);

    if (putJob.state !== BeanstalkJobState.ready) {
        // as a result of put command job can done in `buried` state,
        // or `delayed` in case delay or client's default delay been specified
        throw new Error('job is not in ready state');
    }
    }

}
