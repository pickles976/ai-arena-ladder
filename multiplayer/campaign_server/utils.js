import { sanitizeCode } from "./sanitizeCode"

export function shuffle(unshuffled) {
    return unshuffled
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}

export function prepareCode(code) {

    return {
        baseStart : sanitizeCode(code.baseStart),
        baseUpdate : sanitizeCode(code.baseUpdate),
        shipStart : sanitizeCode(code.shipStart),
        shipUpdate : sanitizeCode(code.shipUpdate)
    }

}