import PropBase from './propbase';

const DIR_TO_FRAME = {
    ne: 0,
    nw: 2,
    sw: 4,
    se: 6
};

export default class Recipe extends PropBase {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.isOpened = false;
        this.recipe = tileData.recipe;
        this.direction = tileData.direction;
        this.rank = tileData.rank;
        this.animationIndex = DIR_TO_FRAME[this.direction] + (this.rank * 8);
        this.tileTexture.gotoAndStop(this.animationIndex);
    }

    touch(game) {
        if (!this.isOpened) {
            if (game.player.inventory.getCount(this.recipe) > 0) {
                this.recipe = 4041;
            }
            game.addItem(this.recipe, 1);
            this.tileTexture.gotoAndStop(this.animationIndex + 1);
            this.isOpened = true;
            Sound.playSound('recipe_open_1.mp3', { singleInstance: true });
        } else {
            game.exploreMode.setInteractive(false);
            game.ui.showDialog([
                { text: "이미 획득한 레시피다." }
            ], () => {
                game.exploreMode.setInteractive(true);
            });
        }
    }
    showOutline() {
        
    }

    getName() {
        return "레시피";
    }
}