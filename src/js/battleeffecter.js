import Tweens from "./tweens";
import { Movies, loadAniTexture } from "./battleutils";
import MovieClip from "./movieclip";

// battle에 사용되는 이펙트 관련된 클래스 작성한다.

export class BuffEffect extends PIXI.Container {
    constructor(buff) {
        super();
        this.buff = buff.options;

        this.effect = new PIXI.Sprite(PIXI.Texture.fromFrame(this.buff.buffEffect.graphic));
        this.effect.position.x = - this.effect.width / 2 + this.buff.buffEffect.offset.x;
        this.effect.position.y = - this.effect.height + this.buff.buffEffect.offset.y;
        this.effect.blendMode = this.buff.buffEffect.blendMode;

        this.addChild(this.effect);
    }

    name() {
        return this.buff.name;
    }

    update() {
        this.effect.position.x = - this.effect.width / 2 + this.buff.buffEffect.offset.x;
        this.effect.position.y = - this.effect.height + this.buff.buffEffect.offset.y;
    }
}

// 캐릭터 버프 이펙트 담당.
export class BuffEffecter extends PIXI.Container {
    constructor(character) {
        super();
        
        this.tweens = new Tweens();
        this.movies = new Movies();
        this.character = character;
        this.buffEffects = {};
    }

    addBuffEffect(buff) {
        const newBuffEffect = new BuffEffect(buff);
        this.addChild(newBuffEffect);
        
        if (this.buffEffects[buff.name]) {
            this.removeChild(this.buffEffects[buff.name]);
        }

        this.buffEffects[buff.name] = newBuffEffect;
    }

    update() {
        this.tweens.update();
        this.movies.update();

        for (let key in this.buffEffects) {
            const buffEffect = this.buffEffects[key];
            if (!this.character.stat.buffs[key]) {
                this.removeChild(buffEffect);
                delete this.buffEffects[key];
            } else {
                buffEffect.update();
            }
        }
    }
}


// Damage Graphic, Font Graphic 처리.
export class BattleEffecter extends PIXI.Container {
    constructor() {
        super();
        this.tweens = new Tweens();
        this.movies = new Movies();
        this.detailEffectContainer = new PIXI.Container();
        this.addChild(this.detailEffectContainer);
    }

    update() {
        this.tweens.update();
        this.movies.update();
    }

    addEffect(target, options) {
        const that = this;
        const slash = { textures: loadAniTexture(`${options.name}_`, options.animationLength), flipX: false };
        const anim = new PIXI.extras.AnimatedSprite(slash.textures);
        anim.animationSpeed = options.speed;
        anim.loop = false;
        anim.blendMode = PIXI.BLEND_MODES.ADD;
        anim.position.x = target.position.x - anim.width / 4;
        anim.position.y = target.position.y - target.animation.height / 2 - anim.height / 2;

        if (options.flipX) {
            anim.scale.x = options.flipX ? -1 : 1;
            anim.position.x += anim.width;
        }
        if (options.flipY) {
            anim.scale.y = options.flipY ? -1 : 1;
            anim.position.x += anim.height;
        }
        if (options.rotation) {
            anim.rotation = Math.PI * options.rotation / 180;
        }
        this.detailEffectContainer.addChild(anim);
        anim.play();

        const movieClip = new MovieClip(
            MovieClip.Timeline(options.removeFrame, options.removeFrame + 1, null, () => {
                that.detailEffectContainer.removeChild(anim);
            }),
        );

        this.movies.push(movieClip);
        movieClip.playAndDestroy();

        return anim;
    }

    addFontEffect(options, callback) {
        const that = this;
        const style = new PIXI.TextStyle();
        style.dropShadow = true;
        style.dropShadowDistance = 3;
        style.fontStyle = 'italic';
        style.fontWeight = 'bold';
        style.fontSize = 18;
        style.fill = options.color ? options.color : "#ffffff";

        const text = new PIXI.Text(options.outputText, style);
        text.anchor.x = 0.5;
        text.position.x = options.target.position.x + options.target.animation.width / 2 - 3;
        text.position.y = options.target.position.y - options.target.animation.height / 2 - 3;
        text.alpha = 0;
        this.detailEffectContainer.addChild(text);

        const movieClip = new MovieClip(
            MovieClip.Timeline(1, 30, text, [["alpha", 0, 1, "outCubic"]]),
            MovieClip.Timeline(1, 30, text, [["y", text.position.y, text.position.y - 15, "outCubic"]]),
            MovieClip.Timeline(61, 91, text, [["alpha", 1, 0, "outCubic"]]),
            MovieClip.Timeline(91, 92, null, () => {
                that.detailEffectContainer.removeChild(text);
                if (callback) {
                    callback();
                }
            }),
        );
        this.movies.push(movieClip);
        movieClip.playAndDestroy();
    }
}

// Scene, Screen Effect관련 처리.
export class BattleScreenEffecter extends PIXI.Container {
    constructor() {
        super();
        this.tweens = new Tweens();
        this.screenEffectContainer = new PIXI.Container();
        this.screenEffectContainer.visible = false;

        const graphics = new PIXI.Graphics();
        graphics.beginFill(0xFFFFFF);
        // 크기 하드코딩?
        graphics.drawRect(0, 0, 980, 500);
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

    sceneIn(callback) {
        this.screenEffectContainer.visible = true;
        this.screenEffectContainer.alpha = 1;
        this.screenEffect.tint = 0x0F0F0F;
        this.tweens.addTween(this.screenEffectContainer, 1, { alpha: 0 }, 0, "linear", true, () => {
            this.tint = 0xFFFFFF;
            this.screenEffectContainer.visible = false;
            if (callback) {
                callback();
            }
        });
    }

    sceneOut(callback) {
        this.screenEffectContainer.visible = true;
        this.screenEffectContainer.alpha = 0;
        this.screenEffect.tint = 0x0F0F0F;
        this.tweens.addTween(this.screenEffectContainer, 2, { alpha: 1 }, 0, "linear", true, () => {
            this.tint = 0xFFFFFF;
            if (callback) {
                callback();
            }
        });
    }
}