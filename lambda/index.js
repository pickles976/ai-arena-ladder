import { runGame, testPackage, stopGame, setUserCode, setConfig, setCallbacks} from "ai-arena"
import { sanitizeCode } from './sanitizeCode.js'
import { FRAMERATE, TICKS_PER_FRAME, USER_CODE_TIMEOUT } from "./globals.js"

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

    // let TICKS_PER_FRAME = event.TICKS_PER_FRAME
    // let FRAMERATE = event.FRAMERATE

    // Configure game
    setConfig({
        graphics: false,
        ticksPerFrame: TICKS_PER_FRAME,
        framerate: FRAMERATE,
        nodejs: true,
        userCodeTimeout: USER_CODE_TIMEOUT,
    })

    setUserCode({
        team0 : {
            BaseStartCode : sanitizeCode(event.TEAM_0.BaseStartCode),
            BaseUpdateCode : sanitizeCode(event.TEAM_0.BaseUpdateCode),
            ShipStartCode : sanitizeCode(event.TEAM_0.ShipStartCode),
            ShipUpdateCode : sanitizeCode(event.TEAM_0.ShipUpdateCode)
        }
    })

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
        status = 'incomplete'
        if (steps > 24) {
            stopGame()
            clearTimeout(id)
            status = 'success'
            console.log(`Ran ${steps} steps in: ${elapsed}ms`)

            // TODO: send off the code here

            callback(undefined, addData(response_success))
        }
    }

    stopGame()

    try {
        runGame()
    } catch (err) {
        console.log(err)
        status = 'user code error'
        callback(undefined, addData(response_error))
    }


    id = setTimeout((() => {
        stopGame()
        console.log(`Ran ${steps} steps in: ${elapsed}ms`)
        console.log(status)
        callback(undefined, addData(response_error))
    }),TIMEOUT)

}