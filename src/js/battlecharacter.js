import { DIRECTIONS } from "./define";
import { loadAniTexture, getDirectionName } from "./utils";
import { BattleProgressBar } from "./battleui";

// Battle Character의 Animation Sprite 처리를 하는 클래스.
class BattleAnimation extends PIXI.Container {
    constructor(character) {
        super();
        this.character = character;
        this.tweens = new Tweens();
        this.vibrationTween = new Tweens();

        this.shadow = new PIXI.Sprite(PIXI.Texture.fromFrame("shadow.png"));
        this.shadow.position.y = -this.shadow.height;

        this.animations = {};
        this.animationKeys = this.getAnimationKeys(character);
        
        for(let key of this.animationKeys) {
            const keyA = character.name + "_" + key + "_nw";
            this.animations[key + '_nw'] = { textures: loadAniTexture(keyA, character.data.animations[keyA].length), flipX: false };
            this.animations[key + '_ne'] = { textures: this.animations[key + '_nw'].textures, flipX: true };
            

            const keyB = character.name + "_" + key + "_sw";
            this.animations[key + '_sw'] = { textures: loadAniTexture(keyB, character.data.animations[keyB].length), flipX: false };
            this.animations[key + '_se'] = { textures: this.animations[key + '_sw'].textures, flipX: true };
        }

        this.offset = character.data.offset;
        const anim = new PIXI.extras.AnimatedSprite(this.animations.idle_sw.textures);
        anim.animationSpeed = 0.1;
        anim.play();
        anim.position.x = this.offset.x;
        anim.position.y = this.offset.y;
        this.anim = anim;
        this.currentDir = DIRECTIONS.SW;

        this.addChild(this.shadow);
        this.addChild(this.anim);
    }

    update() {
        this.tweens.update();
        this.vibrationTween.update();
    }

    getAnimationKeys(character) {
        const keys = [];

        for (const animationName in character.data.animations) {
            const key = animationName.replace(character.name + '_', '').replace('_nw', '').replace('_ne', '').replace('_sw', '').replace('_se', '');
            keys.push(key);
        }

        return keys;
    }

    changeVisualToDirection(direction) {
        const animationName = this.anim.name?this.anim.name:'idle';
        this.currentDir = direction;
        this._setAnimation(animationName.split('_')[0] + '_' + getDirectionName(direction));
    }
   
    _setAnimation(name) {
        const ani = this.animations[name];
        if (ani && this.anim.name !== name) {
            this.anim.name = name;
            this.anim.textures = ani.textures;
            this.anim.scale.x = ani.flipX ? -1 : 1;
            this.anim.position.x = ani.flipX ? this.anim.width : 0;
            this.anim.gotoAndPlay(0);
        }
    }


    // 여러 softRollBackTint와 겹치면 문제될 수 있다. 단독, 중복없이 실행되야할듯.. 문제될 수 있다.
    softRollBackTint (tint, duration) {
        this.tintR = (tint & 0xFF0000) >> 16;
        this.tintG = (tint & 0x00FF00) >> 8;
        this.tintB = (tint & 0x0000FF);
        
        this.tweens.addTween(this, duration, {tintR: 255, tintG: 255, tintB: 255}, 0, 'linear', false, null);
    }

    get tintR() {
        return (this.anim.tint & 0xFF0000) >> 16;
    }
    get tintG() {
        return (this.anim.tint & 0x00FF00) >> 8;
    }
    get tintB() {
        return this.anim.tint & 0x0000FF;
    }

    set tintR(r) {
        this.anim.tint = (this.anim.tint & 0x00FFFF) | (r << 16);
    }

    set tintG(g) {
        this.anim.tint = (this.anim.tint & 0xFF00FF) | (g << 8);
    }

    set tintB(b) {
        this.anim.tint = (this.anim.tint & 0xFFFF00) | (b);
    }

    // 캐릭터 anim의 position 건드리는데.. anim x 건드리는 애랑 같이 사용할 경우 문제될 수 있다.
    vibration(scale, duration) {
        if (this.vibrationTween.activeForTweens) {
            this.anim.position.x = this.tx;
            this.anim.position.y = this.ty;
            // TODO : tween 초기화할 함수가 필요하다.
            this.vibrationTween = new Tweens();
        }

        const tx = this.anim.position.x;
        this.tx = tx;
        const ty = this.anim.position.y;
        this.ty = ty;

        this.anim.position.x += scale;
        this.anim.position.y += scale;
        this.vibrationTween.addTween(this.anim.position, duration, {x: tx, y: ty}, 0, 'outBounce', true, null);
    }
}

// 캐릭터 로직
export default class BattleCharacter extends PIXI.Container {
    constructor(character) {
        super();
        this.character = character;
       
        this.tweens = new Tweens();

        this.animation = new BattleAnimation(character);
        this.progressBar = new BattleProgressBar();
        this.progressBar.setPosition({
            x: this.animation.width / 2,
            y: -this.animation.height,
        });

        this.addChild(this.animation);
        this.addChild(this.progressBar);

        this.progressBar.setProgress(this.health / this.maxHealth);
        // 캐릭터의 스피드대로 세팅한다
        this.actionScore = 0;
    }

    setCamp(camp) {
        this.camp = camp;
    }

    setGridPosition(x, y) {
        this.gridPosition = {};
        this.gridPosition.x = x;
        this.gridPosition.y = y;
    }

    update() {
        this.tweens.update();
        this.animation.update();
        // 액티브 스코어를 감소시킨다
        --this.actionScore;
    }

    onDamage(damage) {
        this.character.health -= damage;
        const healthRate = this.health / this.maxHealth;
        this.progressBar.setProgress(healthRate);

        this.animation.softRollBackTint(0xFF0000, 0.75);
        this.animation.vibration(6, 0.5);
    }


    animation_attack() {
        this.animation._setAnimation('atk_' + getDirectionName(this.animation.currentDir));
        this.animation.anim.isLoop = false;
    }

    animation_idle() {
        this.animation._setAnimation('idle_' + getDirectionName(this.animation.currentDir));
        this.animation.anim.isLoop = true;
    }

    animation_walk() {
        this.animation._setAnimation('walk_' + getDirectionName(this.animation.currentDir));
        this.animation.anim.isLoop = true;
    }

    get health() {
        return this.character.health;
    }

    get maxHealth() {
        return this.character.maxHealth;
    }

    get attack() {
        return this.character.attack;
    }

    get armor() {
        return this.character.armor;
    }

    get isAlive() {
        return this.character.health > 0;
    }

    get skills() {
        return this.character.skills;
    }
}