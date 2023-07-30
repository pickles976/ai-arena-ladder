import { runGame,testPackage,stopGame, setEngineConfig, setCallbacks, getScore, setUserCode  } from "ai-arena"

let TICKS_PER_FRAME = 64
export const USER_CODE_TIMEOUT = 1.0
const MAX_GAME_TICKS = 9000 // 5-min realtime

setEngineConfig({
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

let errorCallback = function(e){
  console.error(e)
}

function gameEndCallback(team){

  elapsed = performance.now() - start

  console.log(`Ran ${i} timesteps in ${elapsed}ms`)
  console.log(`Player ${1 - team} lost!`)
  console.log(`Player ${team} won!`)

  let score = {}
  try {
    score = getScore()
  } catch (err) {
    console.log(`Failed to get score: ${err}`)
  }

  stopGame()

  resultCallback({ "winner" : team, "score" : JSON.stringify(score) })

}

function startGameWithParams(data){

  console.log(`Starting game with params:`)
  console.log(data)
  
  start = performance.now()
  i = 1

  setUserCode(data)

  setCallbacks({
    'physics': physCallback,
    'gameEnd': gameEndCallback,
    'error' : errorCallback
  })

  try {
    runGame()
  }
  catch (e) {
    console.error("Game crashed")
    console.error(e)
    gameEndCallback()
  }
}

export async function createGame(data, callback) {
    resultCallback = callback    
    startGameWithParams(data)
}