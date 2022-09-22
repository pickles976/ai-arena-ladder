import { data } from './json.js';
import { v4 as uuidv4 } from 'uuid';

const URL = 'localhost'
const GAME_PORT = 7071

import {WebSocketServer, WebSocket} from "ws"

const ws = await connectToServer();    

ws.onmessage = (webSocketMessage) => {
    const blob = webSocketMessage.data;
    console.log(blob)
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
                resolve(ws);
            }
        }, 10);
    });   
}

console.log('Ladder server is up.')
ws.send(JSON.stringify(data))
