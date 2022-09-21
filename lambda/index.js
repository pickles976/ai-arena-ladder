import { runGame, onGameEnd, setFramerate, setGraphicsEnabled, setTicksPerFrame, testPackage, setPhysicsCallbacks,getGamePacket, getScorePacket, setShipStartCode, setShipUpdateCode, setBaseStartCode, setBaseUpdateCode, setNode, stopGame, getGameInfo} from "ai-arena"
import { data } from './json.js'
import { sanitizeCode } from '../sanitizeCode.js'

function success(){
    return 'success'
}

function failure(){
    return 'failed'
}

exports.handler = async function(event,context,callback) {

    console.log(testPackage())
    console.log(data)

    global.alert = function(x){ 
        x === 'undefined' ? console.error('undefined') : console.error(x); return; 
    }; 

    let TICKS_PER_FRAME = data.TICKS_PER_FRAME
    let FRAMERATE = data.FRAMERATE

    setNode(true)
    setTicksPerFrame(TICKS_PER_FRAME)
    setFramerate(FRAMERATE)
    console.log(sanitizeCode(data.team0.ShipStartCode))
    setShipStartCode(0,sanitizeCode(data.team0.ShipStartCode))
    setShipUpdateCode(0,sanitizeCode(data.team0.ShipUpdateCode))
    setBaseStartCode(0,sanitizeCode(data.team0.BaseStartCode))
    setBaseUpdateCode(0,sanitizeCode(data.team0.BaseUpdateCode))
    setShipStartCode(1,sanitizeCode(data.team1.ShipStartCode))
    setShipUpdateCode(1,sanitizeCode(data.team1.ShipUpdateCode))
    setBaseStartCode(1,sanitizeCode(data.team1.BaseStartCode))
    setBaseUpdateCode(1,sanitizeCode(data.team1.BaseUpdateCode))
    setGraphicsEnabled(false)
    let i = 1
    let start = performance.now()

    // send the game state back every second
    var physCallback = function(){
        i++
        if (i > 1500){
            console.log('success')
            console.log(performance.now() - start)
            console.log(getGameInfo())
            stopGame()
            success()
        }
    }

    var gameEndCallback = function(value){
        stopGame()
        runGame()
    }

    setPhysicsCallbacks(physCallback)
    onGameEnd(gameEndCallback)
    runGame()

    setTimeout(failure,5000)

}