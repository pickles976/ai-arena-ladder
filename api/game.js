import {runGame, setFramerate, setGraphicsEnabled, setTicksPerFrame, testPackage, setPhysicsCallbacks, getGameState} from "ai-arena"

global.alert = function(x){ 
    x === 'undefined' ? console.error('undefined') : console.error(x); return; 
}; 

console.log(testPackage())
setTicksPerFrame(1)
setFramerate(30)
setGraphicsEnabled(false)
let i = 0

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

    const gameState = JSON.stringify(getGameState());

    [...clients.keys()].forEach((client) => {
        client.send(gameState);
    });
}

console.log("wss up");

// send the game state back every second
var callback = function(){

    i++
    console.log(i)

    if (i % 30 === 0){
        console.log("Sending game state to client")
        sendGameState()
    }
}

setPhysicsCallbacks(callback)
runGame()