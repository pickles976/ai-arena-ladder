import { runGame, onGameEnd, setFramerate, setGraphicsEnabled, setTicksPerFrame, testPackage, setPhysicsCallbacks,getGamePacket, getScorePacket, setShipStartCode, setShipUpdateCode, setBaseStartCode, setBaseUpdateCode, setNode, stopGame, getGameInfo} from "ai-arena"
import { sanitizeCode } from './sanitizeCode.js'

let status = 'failure'

function sleep(ms) {
    return new Promise(
      resolve => setTimeout(resolve, ms)
    );
}
  
var gameEndCallback = function(value){
    stopGame()
    runGame()
}

export const handler = async (event, context) => {

    console.log('Received event:', JSON.stringify(event));
    console.log(testPackage())

    global.alert = function(x){ 
        x === 'undefined' ? console.error('undefined') : console.error(x); return; 
    }; 

    let TICKS_PER_FRAME = event.TICKS_PER_FRAME
    let FRAMERATE = event.FRAMERATE

    setNode(true)
    setTicksPerFrame(TICKS_PER_FRAME)
    setFramerate(FRAMERATE)
    setShipStartCode(0,sanitizeCode(event.team0.ShipStartCode))
    setShipUpdateCode(0,sanitizeCode(event.team0.ShipUpdateCode))
    setBaseStartCode(0,sanitizeCode(event.team0.BaseStartCode))
    setBaseUpdateCode(0,sanitizeCode(event.team0.BaseUpdateCode))
    setShipStartCode(1,sanitizeCode(event.team1.ShipStartCode))
    setShipUpdateCode(1,sanitizeCode(event.team1.ShipUpdateCode))
    setBaseStartCode(1,sanitizeCode(event.team1.BaseStartCode))
    setBaseUpdateCode(1,sanitizeCode(event.team1.BaseUpdateCode))
    setGraphicsEnabled(false)
    let i = 1
    let start = performance.now()

    // send the game state back every second
    function physCallback(){
        i++
        if (i > 300){
            console.log('Success!!')
            console.log(`Ran ${i} steps in: ${performance.now() - start}ms`)
            stopGame()
            status = "success"
        }
    }

    setPhysicsCallbacks(physCallback)
    onGameEnd(gameEndCallback)
    runGame()
    
    await sleep(1000)
    return status

}