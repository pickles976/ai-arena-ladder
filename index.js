(async function() {

    const ws = await connectToServer();    

    ws.onmessage = (webSocketMessage) => {
        const messageBody = webSocketMessage.data;
        // console.log(messageBody)
        loadGameStateFromString(messageBody)
    };        
        
    async function connectToServer() {    
        const ws = new WebSocket('ws://localhost:7071/ws');
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

import {setCanvas, testPackage, runGame, loadGameStateFromString, setTicksPerFrame, setFramerate, setStreaming, setPhysicsCallbacks, setGraphicsEnabled} from './node_modules/ai-arena/dist/index.js'

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