import SkillBase from "./skillbase";
import { CHARACTER_CAMP, TARGETING_TYPE } from "../battledeclare";

export default class WandAttack extends SkillBase {
    constructor() {
        super(TARGETING_TYPE.ENEMY_FRONT_TANK);

        this.tweens = new Tweens();
    }

    onFrame(frame) {
        
        // 프레임별로 실행해야 할 내용을 여기에 기록
        switch(frame) {
            case 1: {
                const vector = (this.owner.camp === CHARACTER_CAMP.ALLY)?  1 : - 1;
                const toX = this.owner.position.x + 16 * vector;
                const toY = this.owner.position.y - 8 * vector;

                this.originX = this.owner.position.x;
                this.originY = this.owner.position.y;

                this.tweens.addTween(this.owner.position, 0.15, { x: toX, y: toY }, 0, "easeOut", true );
                break;
            }
            case 11: {
                this.owner.animation_attack();
                break;
            } 
            case 45: {
                // TODO : 데미지 계산 공식을 어디서 가져와야 할까??
                // 완드 공격 이펙트로 변경하면 될 것 같다.
                this.addEffect(this.target, { name: 'slash', animation: true, animationLength: 8, removeFrame: 60, speed: 0.5 });
                this.hit(this.owner, this.target);
                break;
            }
            case 78: {
                this.owner.animation_idle();
                break;
            }
            case 81: {
                this.tweens.addTween(this.owner.position, 0.15, { x: this.originX, y: this.originY }, 0, "easeOut", true );
                break;
            }
            case 91: {
                this.done();
                break;
            }
        }

        this.tweens.update();
    }
}