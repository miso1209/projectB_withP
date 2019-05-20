export default class Storage {
    constructor() {
        if (localStorage.data) {
            this.data = JSON.parse(localStorage.data);
        } else {
            this.resetData();
        }
    }

    resetData() {
        this.data = {};
    }

    save() {
        localStorage.data = JSON.stringify(this.data);
    }

    clear() {
        localStorage.data = "";
        this.resetData();
    }

    hasAlreadyPlayed() {
        return this.data.player ? true : false;
    }
    
}