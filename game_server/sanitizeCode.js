import { v4 as uuidv4 } from 'uuid';
import { BaseStart, BaseUpdate, ShipUpdate } from './aiControls.js';
import * as esprima from 'esprima';

function isLoop(node){
  console.log(node.type)
  return (node.type === "ForStatement" ||
        node.type === "ForInStatement" ||
        node.type === "WhileStatement" ||
        node.type === "DoWhileStatement")
}

// Set the Start() and Callback() bindings to be random values
const startID = '_' + uuidv4().replaceAll('-','_')
const callbackID = '_' + uuidv4().replaceAll('-','_')
const start = `const ${startID} = performance.now(); \n`
// const callback = `const ${callbackID} = function(base.team){ ${callBackCode} }`
const timeCheck = `\nif (performance.now() - ${startID} > 0.5){ ${ callbackID }(); break; } \n`

let code = start + BaseStart

// Turn the code into AST, make note of every location where there is a loop
const entries = []
esprima.parseScript(code, {}, function (node, meta) {
  if(isLoop(node)){
    entries.push({
      end: meta.end.offset
    })
  }
})

// inject our timeout code into the end of every loop
entries.sort((a,b) => {return b.end - a.end}).forEach(n => {
  code = code.slice(0,n.end - 1) + timeCheck + code.slice(n.end - 1)
})

console.log(code)