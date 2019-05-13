export default class CharacterTable {
    constructor() {

    }

    init(data) {
        this.data = data;
    }

    getData(id) {
        return this.data[id];
    }
}