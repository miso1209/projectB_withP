import PropBase from './propbase';
import { EventEmitter } from 'events';

export default class Wizard extends PropBase {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.isOpened = false;
        this.alreadyParty = false;

        this.hasEmitter = true;

        // name tag의 offset을 설정할 수 있도록 한다.
        this.nameTagOffset = {
            x: 0,
            y: -(this.tileTexture.height / 2)
        };

        this.displayName = 'Lv.1 ???';
        // 초기에 이름을 보이고, hideName을 오버라이딩 하여, hide 하지 않도록 한다.
        this.showName();
    }

    applyTag(tag) {
        if (tag === "haswizard") {
            this.delete();
        }
    }

    delete() {
        this.alreadyParty = true;
        this.emit('delete');
    }

    touch(game) {
        if (!this.alreadyParty) {
            game.ui.showConfirmModal("Lv.1 마법사를 파티로 영입 하시겠습니까?", true, (confirmed) => {
                if (confirmed === "ok") {
                    const t = async () => {
                        game.addCharacter(5, { level: 1, exp: 0, equips: {}});
                        game.addTag("haswizard");
                        game.exploreMode.interactive = false;
                        game.ui.hideMenu();
                        await game.$fadeOut(1);
                        this.delete();
                        await game.$fadeIn(1);
                        game.ui.showMenu();
                        game.exploreMode.interactive = true;
                    };

                    t();
                }
            });
        }
    }

    hideName() {

    }

    getName() {
        return this.displayName;
    }
}