import PropBase from './propbase';

export default class PortalStone extends PropBase {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.isOpened = false;
        this.nameTagOffset = {
            x: -16,
            y: 0
        };
    }

    touch(game) {
        game.ui.showDialog([
            { text: "집으로 귀환하시겠습니까?" }
        ], () => {});
    }

    getName() {
        return "포탈";
    }
}