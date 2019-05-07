import Tweens from './tweens';
import MovieClip from './movieclip';

function loadAniTexture(name, count) {
    const frames = [];  
    for (let i = 0; i < count; i++) {
        frames.push(PIXI.Texture.fromFrame(name + i + '.png'));
    }
    return frames;
}

// Screen Effect는 항상 위치가 고정이기 때문에 따로 분리해서 만들도록 해본다.
export class BattleScreenEffect extends PIXI.Container {
    constructor() {
        super();
    }
}

export default class BattleEffect extends PIXI.Container {
    constructor() {
        super();
        this.tweens = new Tweens();
        this.detailEffectContainer = new PIXI.Container();
        this.screenEffectContainer = new PIXI.Container();
        this.screenEffectContainer.visible = false;

        const graphics = new PIXI.Graphics();
        graphics.beginFill(0xFFFFFF);
        graphics.drawRect(0, 0, 980, 500);
        graphics.endFill();
        this.screenEffect = graphics;
        this.screenEffectContainer.addChild(graphics);

        this.addChild(this.detailEffectContainer);
        this.addChild(this.screenEffectContainer);

        this.movies = [];
    }

    flashScreen(alpha, duration) {
        this.screenEffect.tint = 0xFFFFFF;
        this.screenEffectContainer.visible = true;
        this.screenEffectContainer.alpha = alpha;
        this.tweens.addTween(this.screenEffectContainer, duration, { alpha: 0 }, 0, "linear", true, () => {
            this.screenEffectContainer.visible = false;
        });
    }

    showDefeatScreenEffect() {
        this.screenEffect.tint = 0xFF0000;
        this.screenEffectContainer.visible = true;
        this.screenEffectContainer.alpha = 0;
        this.tweens.addTween(this.screenEffectContainer, 0.5, { alpha: 0.3 }, 0.5, "linear", true, () => {
        });
    }

    hideDefeatScreenEffect() {
        this.screenEffectContainer.visible = true;
        this.tweens.addTween(this.screenEffectContainer, 0.5, { alpha: 0 }, 0.5, "linear", true, () => {
            this.screenEffectContainer.visible = false;
            this.screenEffect.tint = 0xFFFFFF;
        });
    }

    addEffect(target, options) {
        const that = this;
        const slash = { textures: loadAniTexture(`${options.name}_`, options.animationLength), flipX: false };
        const anim = new PIXI.extras.AnimatedSprite(slash.textures);
        anim.animationSpeed = options.speed;
        anim.loop = false;
        anim.blendMode = PIXI.BLEND_MODES.ADD;
        anim.position.x = target.position.x - anim.width / 4;
        anim.position.y = target.position.y - target.height / 2 - anim.height / 2;
        this.detailEffectContainer.addChild(anim);
        anim.play();

        const movieClip = new MovieClip(
            MovieClip.Timeline(options.removeFrame, options.removeFrame + 1, null, () => {
                that.detailEffectContainer.removeChild(anim);
            }),
        );

        this.movies.push(movieClip);
        movieClip.playAndDestroy();
    }

    addDamageEffect(target, damage, color) {
        const that = this;
        const style = new PIXI.TextStyle();
        style.dropShadow = true;
        style.dropShadowDistance = 3;
        style.fontStyle = 'italic';
        style.fontWeight = 'bold';
        style.fontSize = 20;
        style.fill = color ? color : "#ffffff";

        const text = new PIXI.Text('-' + damage, style);
        text.anchor.x = 0.5;
        text.position.x = target.position.x + target.width / 2 - 5;
        text.position.y = target.position.y - target.height / 2 - 3;
        text.alpha = 0;
        this.detailEffectContainer.addChild(text);

        const movieClip = new MovieClip(
            MovieClip.Timeline(1, 30, text, [["alpha", 0, 1, "outCubic"]]),
            MovieClip.Timeline(1, 30, text, [["y", text.position.y, text.position.y - 10, "outCubic"]]),
            MovieClip.Timeline(61, 91, text, [["alpha", 1, 0, "outCubic"]]),
            MovieClip.Timeline(91, 92, null, () => {
                that.detailEffectContainer.removeChild(text);
            }),
        );
        this.movies.push(movieClip);
        movieClip.playAndStop();
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

    addFontEffect(target, outputText, color, callback) {
        const that = this;
        const style = new PIXI.TextStyle();
        style.dropShadow = true;
        style.dropShadowDistance = 3;
        style.fontStyle = 'italic';
        style.fontWeight = 'bold';
        style.fontSize = 18;
        style.fill = color ? color : "#ffffff";

        const text = new PIXI.Text(outputText, style);
        text.anchor.x = 0.5;
        text.position.x = target.position.x + target.width / 2 - 5;
        text.position.y = target.position.y - target.height / 4 * 3 - 3;
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
        movieClip.playAndStop();
    }

    update() {
        this.tweens.update();

        let len = this.movies.length;
        for (let i = 0; i < len; i++) {
            const movie = this.movies[i];
            movie.update();
            if (!movie._playing) {
                this.movies.splice(i, 1);
                i--; len--;
            }
        }
    }

}