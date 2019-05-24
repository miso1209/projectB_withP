import PropBase from './propbase';

export default class Stove extends PropBase {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.isOpened = false;
    }

    touch(game) {
       console.log('open stove')
    }

    getName() {
        return "스토브";
    }
}
