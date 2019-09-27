import PortalBase from './portal_base';

export default class PortalStone extends PortalBase {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.isOpened = false;
        this.nameTagOffset = {
            x: -16,
            y: 0
        };
    }

    getName() {
        return "포탈";
    }
}