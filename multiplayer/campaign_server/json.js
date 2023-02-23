import { BaseStart, BaseUpdate, ShipStart, ShipUpdate } from './aiControls.js'

export const data = {
    'uuid' : "12345678",
    'star_id' : "5t4r69",
    'champion1' : {
        id : "41ic3",
        name: "Alice",
        code : {
            'BaseStartCode' : BaseStart,
            'BaseUpdateCode' : BaseUpdate,
            'ShipStartCode' : ShipStart,
            'ShipUpdateCode' : ShipUpdate
        }
    },
    'champion2' : {
        id : "80b",
        name: "Bob",
        code : {
            'BaseStartCode' : BaseStart,
            'BaseUpdateCode' : BaseUpdate,
            'ShipStartCode' : ShipStart,
            'ShipUpdateCode' : ShipUpdate
        }
    }
}