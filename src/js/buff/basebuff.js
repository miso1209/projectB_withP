import { loadAniTexture } from "../utils";

export default class BaseBuff extends PIXI.Container{
    constructor(buffOption) {
        super();
        this.options = buffOption.options;

        if (buffOption.isAnimation) {
            this.setAnimationSprite(buffOption);
        } else if (buffOption.sprite) {
            this.setSprite(buffOption);
        }
    }

    setAnimationSprite(buffOption) {
        this.sprite = new PIXI.extras.AnimatedSprite(loadAniTexture(`${buffOption.sprite}_`, buffOption.animationLength));
        this.sprite.animationSpeed = buffOption.speed;
        this.sprite.loop = buffOption.loop;
        this.sprite.play();
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.sprite.position.x = buffOption.offset.x;
        this.sprite.position.y = buffOption.offset.y;
        this.sprite.blendMode = PIXI.BLEND_MODES.ADD;
        this.addChild(this.sprite);
    }

    setSprite(buffOption) {
        this.sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(buffOption.sprite));
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.sprite.position.x = buffOption.offset.x;
        this.sprite.position.y = buffOption.offset.y;
        this.sprite.blendMode = PIXI.BLEND_MODES.ADD;
        this.addChild(this.sprite);
    }

    update() {

    }
}