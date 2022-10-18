import { runGame, onGameEnd, setFramerate, setGraphicsEnabled, setTicksPerFrame, testPackage, setPhysicsCallbacks, setShipStartCode, setShipUpdateCode, setBaseStartCode, setBaseUpdateCode, setNode, stopGame, getGlobals, userCodeTimeoutSet, setUserCode, setConfig, setCallbacks} from "ai-arena"
import { sanitizeCode } from './sanitizeCode.js'

const USER_CODE_TIMEOUT = 3
const TIMEOUT = 1500
let status = 'failure'
let steps = 0
let elapsed = 0

global.alert = function(x){ 
    x === 'undefined' ? console.error('undefined') : console.error(x); return; 
}; 
  
var gameEndCallback = function(value){
    stopGame()
    runGame()
}

var addData = function(response){
    response.body = JSON.stringify({
      message: {
        status,
        elapsed,
        steps
      }
    })
    return response
}

const response_success = {
    statusCode: 200,
    body: ''
};

const response_error = {
  statusCode: 400,
  body: ''
};

export const handler = (event, context, callback) => {

    context.callbackWaitsForEmptyEventLoop = false // ???

    if (event.body){
        console.log(`Raw event: ${event}`)
        console.log(`Event body: ${event.body}`)
        event = JSON.parse(event.body)
    }

    console.log(`Received event: ${JSON.stringify(event)}`);

    console.log(testPackage())

    let TICKS_PER_FRAME = event.TICKS_PER_FRAME
    let FRAMERATE = event.FRAMERATE

    // Configure game
    setConfig({
        graphics: false,
        ticksPerFrame: TICKS_PER_FRAME,
        framerate: FRAMERATE,
        nodejs: true,
        userCodeTimeout: USER_CODE_TIMEOUT,
    })

    setUserCode(event.CODE)

    setCallbacks({
        'physics': physCallback,
        'gameEnd': gameEndCallback,
    })

    let start = performance.now()
    let id = 0
    steps = 0
    elapsed = 0
    status = 'failure'

    // send the game state back every second
    function physCallback(){
        steps++
        elapsed = performance.now() - start
        status = 'success'
        if (steps > 24){
            stopGame()
            clearTimeout(id)
            console.log('Success!!')
            console.log(`Ran ${steps} steps in: ${elapsed}ms`)
            callback(undefined, addData(response_success))
        }
    }

    stopGame()

    try {
        runGame()
    }catch(e){
        console.log(e)
    }

    id = setTimeout((() => {
        stopGame()
        console.log(`Ran ${steps} steps in: ${elapsed}ms`)
        console.log(status)
        callback(undefined, addData(response_error))
    }),TIMEOUT)

}