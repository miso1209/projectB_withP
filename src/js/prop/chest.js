import PropBase from './propbase';

export default class Chest extends PropBase {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.isOpened = false;
    }

    touch(game) {
        if (!this.isOpened) {
            game.addItems([
                {
                    id: 1,
                    owned: 1
                },{
                    id: 1001,
                    owned: 1
                },{
                    id: 1002,
                    owned: 1
                }
            ]);

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