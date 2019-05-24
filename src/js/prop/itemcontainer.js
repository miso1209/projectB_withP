import PropBase from './propbase';

export default class ItemContainer extends PropBase {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.isOpened = false;
    }

    touch(game) {
       console.log('open inventory')
    }

    getName() {
        return "보관함";
    }
}