import PropBase from './propbase';
import { EventEmitter } from 'events';

export default class Wizard extends PropBase {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.isOpened = false;
        this.alreadyParty = false;

        this.emitter = new EventEmitter();
        this.hasEmitter = true;

        // name tag의 offset을 설정할 수 있도록 한다.
        this.nameTagOffset = {
            x: 0,
            y: -(this.tileTexture.height / 2)
        };
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
            game.ui.showConfirmModal("Lv.1 Elid를 파티로 영입 하시겠습니까?", (confirmed) => {
                if (confirmed === "ok") {
                    const t = async () => {
                        game.addCharacter(5, { level: 1, exp: 0, equips: {}});
                        game.addTag("haswizard");
                        game.exploreMode.interactive = false;
                        await game.$fadeOut(1);
                        this.delete();
                        await game.$fadeIn(1);
                        game.exploreMode.interactive = true;
                    };

                    t();
                }
            });
        }
    }

    emit(...arg) {
        this.emitter.emit(...arg);
    }

    on(...arg) {
        this.emitter.on(...arg);
    }

    hideName() {

    }

    getName() {
        return "Lv1. Elid";
    }
}