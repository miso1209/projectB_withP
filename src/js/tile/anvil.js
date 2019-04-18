import Tile from './tile';

export default class Anvil extends Tile {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.firstTouch = true;
    }

    touch(game) {
        if (this.firstTouch) {
            this.firstTouch = false;
            game.ui.showDialog("모루를 발견하였다\n\n새로운 아이템을 조합할 수 있게 되었다", () => {
                game.ui.showCombine();
            });
        } else {
            game.ui.showCombine();
        }
    }
}
