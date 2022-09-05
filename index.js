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

import {setCanvas, testPackage, runGame, loadGameStateFromString, setTicksPerFrame, setFramerate} from './node_modules/ai-arena/dist/index.js'

console.log(testPackage())
setCanvas(document.getElementById("game-canvas"))
setTicksPerFrame(1)
setFramerate(30)
runGame()