const URL = 'localhost';
const PORT = 7072;

(async function() {

    const ws = await connectToServer();    

    ws.onmessage = (webSocketMessage) => {
        const blob = webSocketMessage.data;
        (async () => {
            const arr = await blob.arrayBuffer()
            let floatArray = new Float32Array(arr)
            const i = floatArray[0]
            floatArray = floatArray.slice(1,floatArray.length)
            switch(i){
                case 0:
                    loadGamePacket(floatArray)
                    break;
                case 1:
                    loadScorePacket(floatArray)
                    console.log(getGameInfo())
                    break;
                case 2:
                    console.log(floatArray)
                    break;
            }
        })()
    };        
        
    async function connectToServer() {    
        const ws = new WebSocket(`ws://${URL}:${PORT}/ws`);
        return new Promise((resolve, reject) => {
            const timer = setInterval(() => {
                if(ws.readyState === 1) {
                    clearInterval(timer);
                    resolve(ws);
                }
            }, 10);
        });   
    }

})();

import {setCanvas, testPackage, runGame, loadGamePacket, loadScorePacket, setTicksPerFrame, setFramerate, setStreaming, setPhysicsCallbacks, setGraphicsEnabled, getGameInfo} from './node_modules/ai-arena/dist/index.js'

// let start = performance.now()
// let callback = function(){
//     console.log(performance.now() - start)
//     start = performance.now()
// }

console.log(testPackage())
setCanvas(document.getElementById("game-canvas"))
setTicksPerFrame(1)
// setPhysicsCallbacks((callback))
setFramerate(30)
setStreaming(true)
// setGraphicsEnabled(false)
runGame()