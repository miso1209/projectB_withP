export default class CharacterSpec {
    constructor(data) {
        for(const key in data) {
            this[key] = data[key];
        }
    }
}