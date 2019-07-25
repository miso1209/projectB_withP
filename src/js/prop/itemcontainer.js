import PropBase from './propbase';

export default class ItemContainer extends PropBase {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.isOpened = false;
    }

    touch(game) {
        const inputs = game.getInvenotryData();
        const inven_gold = game.player.inventory.gold;
        
        game.ui.showInventory(inputs, inven_gold);
        Sound.playSound('chest_open_1.wav', { singleInstance: true });
    }

    getName() {
        return "보관함";
    }
}