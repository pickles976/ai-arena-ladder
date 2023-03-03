import { GALAXY_PARAMS, GalaxyData, UserData } from 'ai-arena-map-headless';
import { createWar, createStars, getAllChampions, getAllCode, getAllUsers, updateChampions, updateStars, updateGalaxy, deleteAllStars } from './supabaseClient.js';
import seedrandom from 'seedrandom';
import { sanitizeCode } from './sanitizeCode.js';
import { shuffle } from './utils.js';

const NUM_STARS = 5000

export class War {

    galaxy = null
    userDict = {}
    codeDict = {}
    
    // map user id's to champion objects
    championDict = {}
    userList = []
    codeList = []
    
    starKeyDict = {}

    constructor() {
        this.galaxy = new GalaxyData(NUM_STARS, GALAXY_PARAMS)
    }

    async initialize() {

        // Tempoarary variables
        let userDict = {}
        let codeDict = {}
        let championDict = {}
        let userList = []
        let codeList = []
        let starKeyDict = {}

        // Get champions
        let champions = await getAllChampions()

        // Create dict of userids -> Champions
        champions.forEach((champion) => championDict[champion.owner] = champion)

        // Get user ids from champions, store in a dict
        userList = Object.keys(championDict)
        userList = await getAllUsers(userList)
        userList.forEach((user) => userDict[user.id] = new UserData(user.id, user.username, championDict[user.id].color))
        userList = Object.values(userDict)

        // Get code ids from champions, store in a dict
        champions.forEach((champion) => codeList.push(champion.code))
        codeList = await getAllCode(codeList)
        codeList.forEach((code) => codeDict[code.id] = prepareCode(code.code))

        // Inject code strings into champion objects
        Object.values(championDict).forEach((champion) => champion.code = codeDict[champion.code])

        // Add users to Galaxy
        // User(id, name, color)
        this.galaxy.setUsers(userList)

        // DB CRAP

        // // Save Galaxy off to DB
        // console.log('Saving Galaxy to DB')
        // let war = await createWar(NUM_STARS, SEED, champions.map((champ) => champ.id))
        // galaxy.id = war[0].id


        // // Save stars off to DB
        // console.log('Saving Stars to DB')
        // let starData = galaxy.stars.map((star) => { return {
        //     'galactic_war': galaxy.id, 
        //     'champion' : championDict[star.owner?.uuid]?.id, 
        //     'relative_id' : star.uuid
        // }})

        // starData = await createStars(starData)
        
        // // Store star DB ids for upsert later on
        // starData.forEach((star) => starKeyDict[star.relative_id] = star.id)
        
        this.userDict = userDict
        this.codeDict = codeDict
        this.championDict = championDict
        this.userList = userList
        this.codeList = codeList
        this.starKeyDict = starKeyDict
    
    }

    shuffleStars() {
        this.galaxy.stars = shuffle(this.galaxy.stars)
    }

    getOwnedStars() {
        return this.galaxy.stars.filter((star) => star.owner)
    }

    getPlayerStrength() {
        let userStrength = {}

        this.galaxy.stars.forEach((star) => {
            if (star.owner) {
                if (star.owner.uuid in userStrength) {
                    userStrength[star.owner.uuid] = userStrength[star.owner.uuid] + 1
                } else {
                    userStrength[star.owner.uuid] = 1
                }
            }
        })

        return userStrength
    }

    async updateStarOwner(star, champion) {
        let starDbData = {
            'id' : this.starKeyDict[star.uuid], 'champion' : champion.id
        }
        await updateStars([starDbData])
    }

    async gameOver(winner) {

        console.log(`${this.userDict[winner]} has won the galactic war!`)
    
        let championObjects = Object.values(this.championDict).map((champ) => {return {'id' : champ.id, 'wins' : champ.wins, 'losses' : champ.losses}})
        console.log(championObjects)
        updateChampions(championObjects)
    
        // Update Galaxy
        await updateGalaxy({ 'id' : this.galaxy.id, 'winner' : this.userDict[winner].id, 'completed_at' : ((new Date()).toISOString()).toLocaleString('zh-TW')})
    
        // Delete all stars with galaxy ID
        await deleteAllStars(this.galaxy.id)
    
    }

}

function prepareCode(code) {

    return {
        baseStart : sanitizeCode(code.baseStart),
        baseUpdate : sanitizeCode(code.baseUpdate),
        shipStart : sanitizeCode(code.shipStart),
        shipUpdate : sanitizeCode(code.shipUpdate)
    }

}