import PropBase from './propbase';
import { loadAniTexture } from '../utils';

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
        game.ui.showConfirmModal("집으로 귀환하시겠습니까?", true, (result) => {
            if (result === 'ok') {
                const effect = new PIXI.extras.AnimatedSprite(loadAniTexture('portaleffect', 30));
                effect.animationSpeed = 0.3;
                effect.loop = false;
                effect.play();
                effect.scale.x = 1.5;
                effect.scale.y = 1.5;
                effect.anchor.x = 0.5;
                effect.anchor.y = 1;
                effect.position.x += 18;
                effect.position.y += 25;
                effect.blendMode = PIXI.BLEND_MODES.ADD;
                this.addChild(effect);
                game.stage.player.colorBlink(0x0000A0, 1);
                
                game.allRecoveryParty();
                game._playCutscene(5);
            }
        });
    }

    getName() {
        return "포탈";
    }
}