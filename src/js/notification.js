export default class Notification {
    constructor() {
        this.queue = [];
    }

    push(info) {
        this.queue.push(info);
    }

    pop() {
        if (this.queue.length > 0) {
            const info = this.queue[0];
            this.queue.splice(0, 1);
            return info;
        } else {
            return null;
        }
    }
}