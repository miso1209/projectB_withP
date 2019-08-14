import PropBase from './propbase';

export default class Stove extends PropBase {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.isOpened = false;
    }

    touch(game) {
        game.exploreMode.setInteractive(false);
        game.ui.showDialog([
            { text: "차갑게 식어있다.. 추후 제련할 수 있을것만 같다." }
        ], () => {
            game.exploreMode.setInteractive(true);
        });
    }

    getName() {
        return "스토브";
    }
}
