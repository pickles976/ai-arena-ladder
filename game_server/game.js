import { runGame,testPackage,getGamePacket, getScorePacket, stopGame, setConfig, setCallbacks, getScore, setUserCode  } from "ai-arena"
import { v4 as uuidv4 } from 'uuid';
import {WebSocketServer} from "ws"

global.alert = function(x){ 
    x === 'undefined' ? console.error('undefined') : console.error(x); return; 
}; 

console.log(testPackage())
let TICKS_PER_FRAME = 32
export const USER_CODE_TIMEOUT = 1.0

setConfig({
  graphics: false,
  ticksPerFrame: TICKS_PER_FRAME,
  framerate: 30,
  nodejs: true,
  userCodeTimeout: USER_CODE_TIMEOUT,
})

let i = 1
let winner = 2
let start = 0
let elapsed = 0

const PORT = 7071
const MAX_GAME_TICKS = 54000 // 30-min realtime

const wss = new WebSocketServer({ port: PORT });
const clients = new Map();

wss.on('connection', (ws) => {
    
    const id = uuidv4();
    const metadata = { id };

    clients.set(ws, metadata);

    console.log('client connected!')

    ws.on('message', (messageAsString) => {
      const data = JSON.parse(messageAsString);
      startGameWithParams(data)
    });
});

wss.on("close", () => {
  clients.delete(ws);
});

// kind of hacky
function sendPackets(num){

  let packet = null

  switch(num){
    case 0:
      packet = getGamePacket
      break;
    case 1:
      packet = getScorePacket
      break;
    case 2: 
      packet = (() => [winner])
      break;
  }

  const payload = Float32Array.from([num, ...packet()]);

  [...clients.keys()].forEach((client) => {
      client.send(payload);
  });
}

console.log(`Game Server is up at ${PORT}`);
console.log("Waiting for connection...")

// send the game state back every second
var callback = function(){

    i++
    // console.log(i)
    // console.log(performance.now() - start)
    // start = performance.now()

    if(i > MAX_GAME_TICKS){
      // console.log('Sending game end data to client.')
      gameEndCallback()
    }else{
      if (i % (TICKS_PER_FRAME * 1) === 0){
        sendPackets(0)
      }
      
      if (i % (TICKS_PER_FRAME * 10) === 1){
        console.log("Sending game score to client")
        sendPackets(1)
      }
    }
}

var gameEndCallback = function(team=2){
  elapsed = performance.now() - start

  console.log(getScore())
  let winner = 2

  if (team != 2){
    winner = +!team // cast to inverse boolean, then cast to int
  }

  console.log(`Ran ${i} timesteps in ${elapsed}ms`)
  console.log(`Player ${team} lost!`)
  console.log(`Player ${winner} won!`)
  sendPackets(2)
  stopGame()
}

var startGameWithParams = function(data){

  console.log(`Starting game with params: ${JSON.stringify(data)}`)
  start = performance.now()
  i = 1
  winner = 2

  setUserCode(data)

  setCallbacks({
    'physics': callback,
    'gameEnd': gameEndCallback
  })

  runGame()
  // setTimeout(gameEndCallback,5000)
}