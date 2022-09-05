import { runGame, setFramerate, setGraphicsEnabled, setTicksPerFrame, testPackage, setPhysicsCallbacks, getGameStateString, setShipStartCode, setShipUpdateCode, setBaseStartCode, setBaseUpdateCode} from "ai-arena"
import { BaseStart, BaseUpdate, ShipStart, ShipUpdate } from "./aiControls.js";

global.alert = function(x){ 
    x === 'undefined' ? console.error('undefined') : console.error(x); return; 
}; 

let TICKS_PER_FRAME = 32

console.log(testPackage())
setTicksPerFrame(TICKS_PER_FRAME)
setFramerate(30)
setShipStartCode(0,ShipStart)
setShipUpdateCode(0,ShipUpdate)
setBaseStartCode(0,BaseStart)
setBaseUpdateCode(0,BaseUpdate)
setGraphicsEnabled(false)
let i = 1

// const WebSocket = require('ws');

import {WebSocketServer} from "ws"

const wss = new WebSocketServer({ port: 7071 });
const clients = new Map();

wss.on('connection', (ws) => {
    
    const id = uuidv4();
    const metadata = { id };

    clients.set(ws, metadata);

    // ws.on('message', (messageAsString) => {
    //   const message = JSON.parse(messageAsString);
    //   const metadata = clients.get(ws);

    //   message.sender = metadata.id;
    //   message.color = metadata.color;
});

wss.on("close", () => {
  clients.delete(ws);
});

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function sendGameState(){

    const gameState = getGameStateString();

    [...clients.keys()].forEach((client) => {
        client.send(gameState);
    });
}

console.log("wss up");

let start = performance.now()

// send the game state back every second
var callback = function(){

    i++
    // console.log(i)
    console.log(performance.now() - start)
    start = performance.now()

    if (i % (TICKS_PER_FRAME) === 0){
        console.log("Sending game state to client")
        sendGameState()
    }
}

setPhysicsCallbacks(callback)
runGame()