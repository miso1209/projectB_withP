import { loadAniTexture } from "../utils";

export default class BaseBuff extends PIXI.Container{
    constructor(options) {
        super();
        this.option = options.option;

        if (options.isAnimation) {
            this.setAnimationSprite(options);
        } else if (options.sprite) {
            this.setSprite(options);
        }
    }

    setAnimationSprite(options) {
        this.sprite = new PIXI.extras.AnimatedSprite(loadAniTexture(`${options.sprite}_`, options.animationLength));
        this.sprite.animationSpeed = options.speed;
        this.sprite.loop = options.loop;
        this.sprite.play();
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.sprite.position.x = options.offset.x;
        this.sprite.position.y = options.offset.y;
        this.sprite.blendMode = PIXI.BLEND_MODES.ADD;
        this.addChild(this.sprite);
    }

    setSprite(options) {
        this.sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(options.sprite));
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.sprite.position.x = options.offset.x;
        this.sprite.position.y = options.offset.y;
        this.sprite.blendMode = PIXI.BLEND_MODES.ADD;
        this.addChild(this.sprite);
    }

    update() {

    }
}