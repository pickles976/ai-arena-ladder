import { runGame, onGameEnd, setFramerate, setGraphicsEnabled, setTicksPerFrame, testPackage, setPhysicsCallbacks, setShipStartCode, setShipUpdateCode, setBaseStartCode, setBaseUpdateCode, setNode, stopGame, getGlobals, userCodeTimeoutSet} from "ai-arena"
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
    let TEAM_0 = event.TEAM_0
    let TEAM_1 = event.TEAM_1

    setNode(true)
    setGraphicsEnabled(false)
    userCodeTimeoutSet(5) // player code speed will be affected by Lambda. Avoiding timeouts avoids time-intensive restarts.

    setTicksPerFrame(TICKS_PER_FRAME)
    setFramerate(FRAMERATE)
    setShipStartCode(0,sanitizeCode(TEAM_0.ShipStartCode))
    setShipUpdateCode(0,sanitizeCode(TEAM_0.ShipUpdateCode))
    setBaseStartCode(0,sanitizeCode(TEAM_0.BaseStartCode))
    setBaseUpdateCode(0,sanitizeCode(TEAM_0.BaseUpdateCode))
    setShipStartCode(1,sanitizeCode(TEAM_1.ShipStartCode))
    setShipUpdateCode(1,sanitizeCode(TEAM_1.ShipUpdateCode))
    setBaseStartCode(1,sanitizeCode(TEAM_1.BaseStartCode))
    setBaseUpdateCode(1,sanitizeCode(TEAM_1.BaseUpdateCode))

    let i = 0
    let start = performance.now()
    let id = 0

    // send the game state back every second
    function physCallback(){
        i++
        if (i > 30){
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

    try {
        runGame()
    }catch(e){
        console.log(e)
    }

    id = setTimeout((() => {
        stopGame()
        console.log(`Ran ${i} steps in: ${performance.now() - start}ms`)
        console.log(status)
        callback(undefined, response_error)
    }),1500)

}