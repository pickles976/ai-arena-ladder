import { runGame, onGameEnd, setFramerate, setGraphicsEnabled, setTicksPerFrame, testPackage, setPhysicsCallbacks, setShipStartCode, setShipUpdateCode, setBaseStartCode, setBaseUpdateCode, setNode, stopGame, getGlobals} from "ai-arena"
import { sanitizeCode } from './sanitizeCode.js'

let status = 'failure'

global.alert = function(x){ 
    x === 'undefined' ? console.error('undefined') : console.error(x); return; 
}; 
  
var gameEndCallback = function(value){
    stopGame()
    runGame()
}

const response_success = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'ok'
    }),
};

const response_error = {
  statusCode: 400,
  body: JSON.stringify({
      message: 'error'
  }),
};

export const handler = (event, context, callback) => {

    context.callbackWaitsForEmptyEventLoop = false

    if (event.body){
        console.log(`Raw event: ${event}`)
        console.log(`Event body: ${event.body}`)
        event = JSON.parse(event.body)
    }

    console.log(`Received event: ${JSON.stringify(event)}`);

    console.log(testPackage())

    let TICKS_PER_FRAME = event.TICKS_PER_FRAME
    let FRAMERATE = event.FRAMERATE

    setNode(true)
    setGraphicsEnabled(false)

    setTicksPerFrame(TICKS_PER_FRAME)
    setFramerate(FRAMERATE)
    setShipStartCode(0,sanitizeCode(event.ShipStartCode0))
    setShipUpdateCode(0,sanitizeCode(event.ShipUpdateCode0))
    setBaseStartCode(0,sanitizeCode(event.BaseStartCode0))
    setBaseUpdateCode(0,sanitizeCode(event.BaseUpdateCode0))
    setShipStartCode(1,sanitizeCode(event.ShipStartCode1))
    setShipUpdateCode(1,sanitizeCode(event.ShipUpdateCode1))
    setBaseStartCode(1,sanitizeCode(event.BaseStartCode1))
    setBaseUpdateCode(1,sanitizeCode(event.BaseUpdateCode1))

    let i = 0
    let start = performance.now()
    let id = 0

    // send the game state back every second
    function physCallback(){
        i++
        if (i > 300){
            stopGame()
            clearTimeout(id)
            console.log('Success!!')
            console.log(`Ran ${i} steps in: ${performance.now() - start}ms`)
            callback(undefined, response_success)
        }
    }

    setPhysicsCallbacks(physCallback)
    onGameEnd(gameEndCallback)

    stopGame()
    runGame()

    id = setTimeout((() => {
        stopGame()
        console.log(`Ran ${i} steps in: ${performance.now() - start}ms`)
        console.log(status)
        callback(undefined, response_error)
    }),1000)

}