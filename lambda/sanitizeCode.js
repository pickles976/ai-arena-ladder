import { v4 as uuidv4 } from 'uuid';
import * as esprima from 'esprima';
import { getUserCodeTimeout } from 'ai-arena'

function isLoop(node){
  return (node.type === "ForStatement" ||
        node.type === "ForInStatement" ||
        node.type === "WhileStatement" ||
        node.type === "DoWhileStatement")
}

export function sanitizeCode(code){

  // Set the Start() and Callback() bindings to be random values
  const startID = '_' + uuidv4().replaceAll('-','_')
  const start = `const ${startID} = performance.now(); \n`
  const timeCheck = `\nif (performance.now() - ${startID} > ${getUserCodeTimeout() * 2}){ break; } \n`

  let safeCode = start + code

  // Turn the code into AST, make note of every location where there is a loop
  const entries = []
  esprima.parseScript(safeCode, {}, function (node, meta) {
    if(isLoop(node)){
      entries.push({
        end: meta.end.offset
      })
    }
  })
  
  // inject our timeout code into the end of every loop
  entries.sort((a,b) => {return b.end - a.end}).forEach(n => {
    safeCode = safeCode.slice(0,n.end - 1) + timeCheck + safeCode.slice(n.end - 1)
  })
  
  return safeCode

}