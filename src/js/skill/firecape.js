
import SkillBase from "./skillbase";
import { TARGETING_TYPE, CHARACTER_CAMP } from "../battledeclare";
import BaseBuff from "../buff/basebuff";

export default class FireCape extends SkillBase {
    constructor(data) {
        super(TARGETING_TYPE.SELF);
        this.setSkillData(data);

        this.tweens = new Tweens();
    }

    onFrame(frame) {
        // 프레임별로 실행해야 할 내용을 여기에 기록
        switch(frame) {
            case 1: {
                const vector = (this.owner.camp === CHARACTER_CAMP.ALLY)?  1 : - 1;
                const toX = this.owner.position.x + 8 * vector;
                const toY = this.owner.position.y - 4 * vector;

                this.originX = this.owner.position.x;
                this.originY = this.owner.position.y;

                this.tweens.addTween(this.owner.position, 0.15, { x: toX, y: toY }, 0, "easeOut", true );
                break;
            }
            case 11: {
                this.owner.animation_attack();
                break;
            }
            case 51: {
                this.owner.removeBuff("fireCape");
                const fireCape = this.calcSkillExpressions(this.owner, this.skillExpressions[0]);

                this.owner.addBuff("fireCape", 10, new BaseBuff({
                    options: [`armor(${fireCape})`],
                    isAnimation: true,
                    sprite: 'firecape',
                    animationLength: 58,
                    loop: true,
                    speed: 0.5,
                    offset: {
                        x: this.owner.animation.width / 2,
                        y: -this.owner.animation.height / 2
                    }
                }));

                this.addFontEffect({target: this.owner, outputText: `Armor ▲`, fontSize: 7});
                this.addEffect(this.owner, { name: 'firerainprop', animation: true, animationLength: 7, removeFrame: 15, speed: 0.5 });
                break;
            }
            case 75: {
                this.owner.animation_idle();
                break;
            }
            case 76: {
                this.tweens.addTween(this.owner.position, 0.15, { x: this.originX, y: this.originY }, 0, "easeOut", true );
                break;
            }
            case 86: {
                this.done();
                break;
            }
        }

        this.tweens.update();
    }
}