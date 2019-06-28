import { loadAniTexture } from "./utils";
import { FRAME_PER_SEC } from "./battledeclare";

// Damage Graphic, Font Graphic 처리.
export class BattleEffecter extends PIXI.Container {
    constructor() {
        super();
        this.tweens = new Tweens();
        this.detailEffectContainer = new PIXI.Container();
        this.addChild(this.detailEffectContainer);
    }

    update() {
        this.tweens.update();
    }

    addEffect(target, options) {
        const that = this;
        
        let anim = null;
        if (options.animation) {
            anim = new PIXI.extras.AnimatedSprite(loadAniTexture(`${options.name}_`, options.animationLength));
            anim.animationSpeed = options.speed;
            anim.loop = false;
            anim.play();
        } else {
            anim = new PIXI.Sprite(PIXI.Texture.fromFrame(options.name));
        }

        anim.anchor.x = 0.5;
        anim.anchor.y = 0.5;
        anim.blendMode = PIXI.BLEND_MODES.ADD;
        anim.position.x = target.position.x + target.animation.width / 2;
        anim.position.y = target.position.y - target.animation.height - 24;
        anim.position.x += (target.animation.offset && target.animation.offset.x)?target.animation.offset.x:0;
        anim.position.y -= (target.animation.offset && target.animation.offset.y)?(target.animation.offset.y):0;

        this.detailEffectContainer.addChild(anim);

        // n Frame이후 실행될 함수에 대해 어떻게 처리해야 하나.. 새로 빼서 작업해야할듯 하다..
        this.tweens.addTween(this, options.removeFrame / FRAME_PER_SEC, {alpha: 1}, 0, "linear", false, () => {
            that.detailEffectContainer.removeChild(anim);
        });

        return anim;
    }

    addFontEffect(options) {
        const style = new PIXI.TextStyle();
        style.dropShadow = true;
        style.dropShadowDistance = 3;
        style.fontStyle = 'italic';
        style.fontWeight = 'bold';
        style.fontSize = options.fontSize?options.fontSize:18;
        style.fill = options.color ? options.color : "#ffffff";

        const offset = {
            x: options.offset?options.offset.x:0,
            y: options.offset?options.offset.y:0
        };

        const text = new PIXI.Text(options.outputText, style);
        text.anchor.x = 0.5;
        text.alpha = 0;
        text.position.x = (options.target.position.x + options.target.animation.width / 2) + offset.x;
        text.position.y = (options.target.position.y - options.target.animation.height) + offset.y - 24;
        text.position.x += (options.target.animation.offset && options.target.animation.offset.x)?options.target.animation.offset.x:0;
        text.position.y -= (options.target.animation.offset && options.target.animation.offset.y)?(options.target.animation.offset.y):0;
        this.detailEffectContainer.addChild(text);

        this.tweens.addTween(text.position, 0.5, {y: text.position.y - 15}, 0, "easeOut", true, null);
        this.tweens.addTween(text, 0.5, {alpha: 1}, 0, "easeOut", true, () => {
            this.tweens.addTween(text, 0.5, {alpha: 0}, 0.5, "easeOut", true, () => {
                this.detailEffectContainer.removeChild(text);
            });
        });

        return text;
    }
}

// Scene, Screen Effect관련 처리.
export class BattleScreenEffecter extends PIXI.Container {
    constructor(screenSize) {
        super();
        this.tweens = new Tweens();
        this.screenEffectContainer = new PIXI.Container();
        this.screenEffectContainer.visible = false;

        const graphics = new PIXI.Graphics();
        graphics.beginFill(0xFFFFFF);
        // 크기 하드코딩?
        graphics.drawRect(0, 0, screenSize.width, screenSize.height);
        graphics.endFill();
        this.screenEffect = graphics;
        this.screenEffectContainer.addChild(graphics);

        this.addChild(this.screenEffectContainer);
    }

    update() {
        this.tweens.update();
    }

    flashScreen(alpha, duration) {
        this.screenEffect.tint = 0xFFFFFF;
        this.screenEffectContainer.visible = true;
        this.screenEffectContainer.alpha = alpha;
        this.tweens.addTween(this.screenEffectContainer, duration, { alpha: 0 }, 0, "linear", true, () => {
            this.screenEffectContainer.visible = false;
        });
    }

    sceneIn() {
        this.screenEffectContainer.visible = true;
        this.screenEffectContainer.alpha = 1;
        this.screenEffect.tint = 0x000000;
        this.tweens.addTween(this.screenEffectContainer, 1, { alpha: 0 }, 0, "linear", true, () => {
            this.tint = 0xFFFFFF;
            this.screenEffectContainer.visible = false;
        });
    }

    sceneOut() {
        this.screenEffectContainer.visible = true;
        this.screenEffectContainer.alpha = 0;
        this.screenEffect.tint = 0x000000;
        this.tweens.addTween(this.screenEffectContainer, 2, { alpha: 1 }, 0, "linear", true, () => {
            this.tint = 0xFFFFFF;
        });
    }
}