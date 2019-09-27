import PortalBase from './portal_base';

export default class PortalWizard extends PortalBase {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.alreadyParty = false;

        this.hasEmitter = true;

        this.nameTagOffset = {
            x: 0,
            y: -(this.tileTexture.height / 2)
        };

        this.displayName = 'Lv.99 공간 마법사';
        this.showName();
    }

    hideName() {

    }

    getName() {
        return this.displayName;
    }
}