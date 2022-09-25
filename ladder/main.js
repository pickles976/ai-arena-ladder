import { data } from './json.js';
import { v4 as uuidv4 } from 'uuid';
import {WebSocketServer, WebSocket} from "ws"

let gameQueue = [data, data, data, data, data]

// ws client
const URL = 'localhost'
const GAME_PORT = 7071
const ws = await connectToServer();   

// ws server
const SERVER_PORT = 7072
const wss = new WebSocketServer({ port: SERVER_PORT })
const clients = new Map()

// Client stuff
ws.onmessage = (webSocketMessage) => {

    const blob = webSocketMessage.data;
    // console.log(blob)

    // pass this blob back to the clients
    forwardPackets(blob)

    // check if the game is over

    // send another game to the game server
    startNewGame()

    // (async () => {
    //     const arr = await blob.arrayBuffer()
    //     let floatArray = new Float32Array(arr)
    //     const i = floatArray[0]
    //     floatArray = floatArray.slice(1,floatArray.length)
    //     switch(i){
    //         case 0:
    //             loadGamePacket(floatArray)
    //             break;
    //         case 1:
    //             loadScorePacket(floatArray)
    //             console.log(getGameInfo())
    //             break;
    //         case 2:
    //             console.log(floatArray)
    //             break;
    //     }
    // })()
};        
    
async function connectToServer() {    
    const ws = new WebSocket(`ws://${URL}:${GAME_PORT}/ws`);
    return new Promise((resolve, reject) => {
        const timer = setInterval(() => {
            if(ws.readyState === 1) {
                clearInterval(timer);
                console.log('Connected to game server')
                resolve(ws);
            }
        }, 10);
    });   
}

// Server stuff
wss.on('connection', (ws) => {
    const id = uuidv4();
    const metadata = { id };
    clients.set(ws, metadata);
    console.log('Client connected!')

    ws.on('message', (messageAsString) => {
        console.log(messageAsString)
    });
});

wss.on("close", () => {
    clients.delete(ws);
});

function forwardPackets(payload){
    [...clients.keys()].forEach((client) => {
        client.send(payload);
    });
    console.log(`Forwarding packets to ${clients.size} clients`)
}

// OTHER

function startNewGame(){
    let newGame = gameQueue.shift()

    if(newGame){
        ws.send(JSON.stringify(newGame))
    }
}

console.log('Ladder server is up.')
startNewGame()