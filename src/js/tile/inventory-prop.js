import Prop from './prop';

export default class InventoryProp extends Prop {
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
