import { runGame,testPackage,stopGame, setConfig, setCallbacks, getScore, setUserCode  } from "ai-arena"

global.alert = function(x){ 
    x === 'undefined' ? console.error('undefined') : console.error(x); return; 
}; 

console.log(testPackage())

let TICKS_PER_FRAME = 64
export const USER_CODE_TIMEOUT = 1.0
const MAX_GAME_TICKS = 9000 // 5-min realtime

setConfig({
  graphics: false,
  ticksPerFrame: TICKS_PER_FRAME,
  framerate: 30,
  nodejs: true,
  userCodeTimeout: USER_CODE_TIMEOUT,
})

let i = 1
let start = 0
let elapsed = 0
let resultCallback = null;

// send the game state back every second
let physCallback = function(){
    i++
    if(i > MAX_GAME_TICKS){
      gameEndCallback()
    }
}

function gameEndCallback(team){

  elapsed = performance.now() - start

  console.log(`Ran ${i} timesteps in ${elapsed}ms`)
  console.log(`Player ${1 - team} lost!`)
  console.log(`Player ${team} won!`)

  stopGame()

  resultCallback({ "winner" : team, "score" : JSON.stringify(getScore()) })

}

function startGameWithParams(data){

  console.log(`Starting game with params: ${JSON.stringify(data)}`)
//   console.log("Starting new game.")
  start = performance.now()
  i = 1

  setUserCode(data)

  setCallbacks({
    'physics': physCallback,
    'gameEnd': gameEndCallback
  })

  runGame()
}

export async function createGame(data, callback) {
    resultCallback = callback    
    startGameWithParams(data)
}