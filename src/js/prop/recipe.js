import PropBase from './propbase';

export default class Recipe extends PropBase {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.isOpened = false;
        this.recipe = tileData.recipe;
        this.direction = tileData.direction;
        this.rank = tileData.rank;
        console.log('recipe : ', this.recipe, this.rank, this.direction);
    }

    touch(game) {
        if (!this.isOpened) {
            console.log('addItem',this.recipe);
            game.addItem(this.recipe, 1);

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