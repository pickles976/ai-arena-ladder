import { data } from './json.js';
import { v4 as uuidv4 } from 'uuid';
import {WebSocketServer, WebSocket} from "ws"

let gameQueue = [data, data, data, data, data]
const QUEUE_SIZE = 25

// WS CLIENT
const URL = 'game-server'
const GAME_PORT = 7071
const ws = await connectToServer();   

// WS SERVER
const SERVER_PORT = 7072
const wss = new WebSocketServer({ port: SERVER_PORT })
const clients = new Map()

// CLIENT
ws.onmessage = (webSocketMessage) => {

    const blob = webSocketMessage.data;

    // // pass this blob back to the clients
    forwardPackets(blob);

    // check if the game is over
    // send another game to the game server
    (async () => {
        let i = blob.readFloatLE(0) // check packet type
        if (i == 2){
            saveGame(blob.readFloatLE(4)) // add more game data to this
            startNewGame()
        }
    })()

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

// SERVER
wss.on('connection', (ws) => {
    const id = uuidv4();
    const metadata = { id };
    clients.set(ws, metadata);
    console.log('Client connected!')

    ws.on('message', (messageAsString) => {
        // console.log(messageAsString)
    });
});

wss.on("close", () => {
    clients.delete(ws);
});

function forwardPackets(payload){
    [...clients.keys()].forEach((client) => {
        client.send(payload);
    });
    // console.log(`Forwarding packets to ${clients.size} clients`)
}

// OTHER

function startNewGame(){
    console.log(`New game starting!`)
    console.log(`${gameQueue.length} games left in queue`)

    if(gameQueue.length < QUEUE_SIZE){
        console.log(`Fetching matches from server...`)
        fetchGames().then((games) => {
            gameQueue = gameQueue.concat(games)
        })
    }

    let newGame = gameQueue.shift()

    if(newGame){
        ws.send(JSON.stringify(newGame))
    }
}

// Get new games for queue
async function fetchGames(){
    // API call
    return [data, data, data, data, data]
}

async function saveGame(winner){
    //do something
}

console.log('Ladder server is up.')
startNewGame()