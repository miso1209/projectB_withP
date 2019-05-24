export default class Updater {
    constructor() {
        this.funcList = [];
    }

    add(duration, func) {
        this.funcList.push({
            duration: duration,
            update: func
        });
    }

    update() {
        for (let i=0; i<this.funcList.length; i++) {
            const func = this.funcList[i];

            if (func.duration > 0) {
                func.update();
                func.duration--;
            } else {
                this.funcList.splice(i, 1);
                i--;
            }
        }
    }
}