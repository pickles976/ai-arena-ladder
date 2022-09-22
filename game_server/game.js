import { runGame, onGameEnd, setFramerate, setGraphicsEnabled, setTicksPerFrame, testPackage, setPhysicsCallbacks,getGamePacket, getScorePacket, setShipStartCode, setShipUpdateCode, setBaseStartCode, setBaseUpdateCode, setNode, stopGame, getGameInfo, getGameInfoString, getGameState} from "ai-arena"
import { BaseStart, BaseUpdate, ShipStart, ShipUpdate } from "../aiControls.js";
import { sanitizeCode } from "../sanitizeCode.js";
import { v4 as uuidv4 } from 'uuid';

global.alert = function(x){ 
    x === 'undefined' ? console.error('undefined') : console.error(x); return; 
}; 

console.log(testPackage())
let TICKS_PER_FRAME = 32
setTicksPerFrame(TICKS_PER_FRAME)
setFramerate(30)
setNode(true)
setGraphicsEnabled(false)

let i = 1
let winner = 2

import {WebSocketServer} from "ws"

const wss = new WebSocketServer({ port: 7071 });
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

console.log("Game Server is up");
console.log("Waiting for connection...")

let start = performance.now()

// send the game state back every second
var callback = function(){

    i++
    // console.log(i)
    // console.log(performance.now() - start)
    start = performance.now()

    if (i % (TICKS_PER_FRAME * 2) === 0){
      sendPackets(0)
    }
    
    if (i % (TICKS_PER_FRAME * 10) === 1){
      console.log("Sending game score to client")
      sendPackets(1)
    }
}

var gameEndCallback = function(team){
  console.log(getGameInfo())
  let winner = 2

  if (team != 2){
    winner = +!team // cast to inverse boolean, then cast to int
  }

  console.log(`Player ${team} lost!`)
  console.log(`Player ${winner} won!`)
  sendPackets(2)
  stopGame()
}

var startGameWithParams = function(data){

  console.log(`Starting game with params: ${JSON.stringify(data)}`)

  const team0 = data.TEAM0
  const team1 = data.TEAM1

  setShipStartCode(0,sanitizeCode(team0.ShipStartCode))
  setShipUpdateCode(0,sanitizeCode(team0.ShipUpdateCode))
  setBaseStartCode(0,sanitizeCode(team0.BaseStartCode))
  setBaseUpdateCode(0,sanitizeCode(team0.BaseUpdateCode))

  setShipStartCode(1,sanitizeCode(team1.ShipStartCode))
  setShipUpdateCode(1,sanitizeCode(team1.ShipUpdateCode))
  setBaseStartCode(1,sanitizeCode(team1.BaseStartCode))
  setBaseUpdateCode(1,sanitizeCode(team1.BaseUpdateCode))

  setPhysicsCallbacks(callback)
  onGameEnd(gameEndCallback)
  runGame()
}