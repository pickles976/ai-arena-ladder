import { runGame, onGameEnd, setFramerate, setGraphicsEnabled, setTicksPerFrame, testPackage, setPhysicsCallbacks,getGamePacket, getScorePacket, setShipStartCode, setShipUpdateCode, setBaseStartCode, setBaseUpdateCode, setNode, stopGame, getGameInfo} from "ai-arena"
import { data } from './json.js'

global.alert = function(x){ 
    x === 'undefined' ? console.error('undefined') : console.error(x); return; 
}; 

let TICKS_PER_FRAME = data.TICKS_PER_FRAME
let FRAMERATE = data.FRAMERATE

console.log(testPackage())
console.log(data)

setNode(true)
setTicksPerFrame(TICKS_PER_FRAME)
setFramerate(FRAMERATE)
setShipStartCode(0,data.team0.ShipStartCode)
setShipUpdateCode(0,data.team0.ShipUpdateCode)
setBaseStartCode(0,data.team0.BaseStartCode)
setBaseUpdateCode(0,data.team0.BaseUpdateCode)
setShipStartCode(1,data.team1.ShipStartCode)
setShipUpdateCode(1,data.team1.ShipUpdateCode)
setBaseStartCode(1,data.team1.BaseStartCode)
setBaseUpdateCode(1,data.team1.BaseUpdateCode)
setGraphicsEnabled(false)
let i = 1
let start = performance.now()

// send the game state back every second
var callback = function(){
    i++
    if (i > 3000){
        console.log('success')
        console.log(performance.now() - start)
        console.log(getGameInfo())
        stopGame()
    }
}

var gameEndCallback = function(){
  stopGame()
  runGame()
}

setPhysicsCallbacks(callback)
onGameEnd(gameEndCallback)
runGame()