import Prop from './prop';

export default class Stove extends Prop {
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
