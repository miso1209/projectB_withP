import PropBase from './propbase';

const DIR_TO_FRAME = {
    ne: 0,
    nw: 2,
    sw: 4,
    se: 6
};

export default class Chest extends PropBase {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.isOpened = false;
        this.rewards = tileData.rewards;
        this.rank = tileData.rank;
        this.direction = tileData.direction;
        this.animationIndex = DIR_TO_FRAME[this.direction] + (this.rank * 8);
        this.tileTexture.gotoAndStop(this.animationIndex);
    }

    touch(game) {
        if (!this.isOpened) {
            game.addItems(this.rewards);
            this.tileTexture.gotoAndStop(this.animationIndex + 1);
            this.isOpened = true;
            Sound.playSound('chest_open_1.wav', { singleInstance: true });
        } else {
            game.exploreMode.setInteractive(false);
            game.ui.showDialog([
                { text: "상자는 비어있다." }
            ], () => {
                game.exploreMode.setInteractive(true);
            });
        }
    }
    showOutline() {

    }

    getName() {
        return "상자";
    }
}