import PropBase from './propbase';

export default class Chest extends PropBase {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.isOpened = false;
        this.rewards = tileData.rewards;
        this.rank = tileData.rank;
        this.direction = tileData.direction;
        console.log('chest : ', this.rewards, this.rank, this.direction);
    }

    touch(game) {
        if (!this.isOpened) {
            game.addItems(this.rewards);

            this.isOpened = true;
        } else {
            game.ui.showDialog([
                { text: "상자는 비어있다." }
            ], () => {});
        }
    }

    getName() {
        return "상자";
    }
}