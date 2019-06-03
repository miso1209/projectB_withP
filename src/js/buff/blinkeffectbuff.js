import BaseBuff from "./basebuff";

export default class BlinkEffectBuff extends BaseBuff {
    constructor(options) {
        super(options);

        this.tweens = new Tweens();
        this.flag = true;
        this.alphaBlink();
    }

    alphaBlink() {
        if (this.flag) {
            this.tweens.addTween(this, 0.5, {alpha: 0.5}, 0, 'easeOut', false, () => {
                this.flag = !this.flag;
                this.alphaBlink();
            });
        } else {
            this.tweens.addTween(this, 0.5, {alpha: 1}, 0, 'easeIn', false, () => {
                this.flag = !this.flag;
                this.alphaBlink();
            });
        }
    }

    update() {
        this.tweens.update();
    }
}