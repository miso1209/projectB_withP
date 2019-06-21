import PropBase from './propbase';

export default class Recipe extends PropBase {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.isOpened = false;
    }

    touch(game) {
        if (!this.isOpened) {
            game.addItem(1001, 1);

            this.isOpened = true;
        } else {
            game.ui.showDialog([
                { text: "이미 획득한 레시피다." }
            ], () => {});
        }
    }

    getName() {
        return "레시피";
    }
}