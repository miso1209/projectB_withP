import PropBase from './propbase';
import { EventEmitter } from 'events';

export default class Warrior extends PropBase {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.isOpened = false;
        this.alreadyParty = false;

        this.emitter = new EventEmitter();
        this.hasEmitter = true;

        // name tag의 offset을 설정할 수 있도록 한다.
        this.nameTagOffset = {
            x: -10,
            y: -(this.tileTexture.height / 3)
        };
        // 초기에 이름을 보이고, hideName을 오버라이딩 하여, hide 하지 않도록 한다.
        this.showName();
    }

    applyTag(tag) {
        if (tag === "haswarrior") {
            this.delete();
        }
        // 퀘스트로 처리해야 할 것 같은데.. 우선 tag로 처리해둔다..
        if (tag === "") {

        }
    }

    delete() {
        this.alreadyParty = true;
        this.emit('delete');
    }

    touch(game) {
        if (!this.alreadyParty) {
            const potionCount = game.player.inventory.getCount(1001);

            if (potionCount < 1) {
                game.ui.showDialog([
                    { speaker: 1, text: "저기요 괜찮으세요?" },
                    { speaker: 0, text: "..." },
                    { speaker: 1, text: "아무래도 포션을 만들어서 회복시켜줘야겠어!." },
                    { speaker: 1, text: "집으로 돌아가서 포션을 만들자!." }
                ], () => {});
            } else {
            }
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
        return "Lv1. ???";
    }
}