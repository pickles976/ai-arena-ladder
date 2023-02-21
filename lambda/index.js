import { runGame, testPackage, stopGame, setUserCode, setConfig, setCallbacks} from "ai-arena"
import { sanitizeCode } from './sanitizeCode.js'
import { FRAMERATE, TICKS_PER_FRAME, USER_CODE_TIMEOUT } from "./globals.js"
import axios from 'axios';

const TIMEOUT = 1500
let status = 'failure'
let steps = 0
let elapsed = 0

// TODO: move these to env, too lazy rn
let supabaseURL = "https://kbnorlxawefgklyeofdm.supabase.co/rest/v1/TacticalCode"
let supabaseAuth = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtibm9ybHhhd2VmZ2tseWVvZmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzY1Njg2MTUsImV4cCI6MTk5MjE0NDYxNX0.uzdXwAq2i5eL35cBdmHtqEywiKg-2IGBzcuq5gfYLVM"

let headers = {
    'Access-Control-Allow-Credentials': 'true',
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers" : "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
}

global.alert = function(x){ 
    x === 'undefined' ? console.error('undefined') : console.error(x); return; 
}; 
  
var gameEndCallback = function(value){
    stopGame()
    runGame()
}

var addData = function(response){
    response.body = JSON.stringify({
      message: {
        status,
        elapsed,
        steps
      }
    })
    return response
}

let saveCode = async function(event, finalCallback) {

    console.log("Sending code to server...")

    let headers = {
        'apikey' : supabaseAuth,
        'Authorization' : `Bearer ${event.userkey}`,
        'Content-Type': 'application/json',
        "Prefer" : "resolution=merge-duplicates"
    }

    let data = {
        id: event.id,
        owner: event.owner,
        code : event.code,
        name: event.code.name
    }

    axios
    .post(supabaseURL, JSON.stringify(data), { 'headers' : headers })
    .then(response => { console.log(JSON.stringify(response)); finalCallback() })
    .then(response => { console.log(JSON.stringify(response)); finalCallback() })
    .catch(err => console.log(err))

}

const response_success = {
    statusCode: 200,
    headers: headers,
    body: ''
};

const response_error = {
  statusCode: 400,
  headers: headers,
  body: ''
};

export const handler = (event, context, callback) => {

    context.callbackWaitsForEmptyEventLoop = false // ???

    if (event.body){
        // console.log(`Raw event: ${event}`)
        // console.log(`Event body: ${event.body}`)
        event = JSON.parse(event.body)
    }

    // console.log(`Received event: ${JSON.stringify(event)}`);

    console.log(testPackage())

    // Configure game
    setConfig({
        graphics: false,
        ticksPerFrame: TICKS_PER_FRAME,
        framerate: FRAMERATE,
        nodejs: true,
        userCodeTimeout: USER_CODE_TIMEOUT,
    })

    setUserCode({
        team0 : {
            BaseStartCode : sanitizeCode(event.code.baseStart),
            BaseUpdateCode : sanitizeCode(event.code.baseUpdate),
            ShipStartCode : sanitizeCode(event.code.shipStart),
            ShipUpdateCode : sanitizeCode(event.code.shipUpdate)
        }
    })

    setCallbacks({
        'physics': physCallback,
        'gameEnd': gameEndCallback,
    })

    let start = performance.now()
    let id = 0
    steps = 0
    elapsed = 0
    status = 'failure'

    // send the game state back every second
    function physCallback(){
        steps++
        elapsed = performance.now() - start
        status = 'incomplete'
        if (steps > 24) {
            stopGame()
            clearTimeout(id)
            status = 'success'
            console.log(status)
            console.log(`Ran ${steps} steps in: ${elapsed}ms`)

            // Save code off to db here
            saveCode(event, () => { callback(undefined, addData(response_success)) })
        }
    }

    stopGame()

    try {
        runGame()
    } catch (err) {
        console.log(err)
        status = err
        callback(undefined, addData(response_error))
    }


    id = setTimeout((() => {
        stopGame()
        console.log(status)
        console.log(`Ran ${steps} steps in: ${elapsed}ms`)
        callback(undefined, addData(response_error))
    }),TIMEOUT)

}