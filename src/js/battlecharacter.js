import { BattleProgressBar } from "./battleui";
import { loadAniTexture, getDirectionName } from "./battleutils";
import { CHARACTER_CAMP, ACTIVE_TYPE, SKILL_STATUS } from "./battledeclare";
import Tweens from "./tweens";
import { DIRECTIONS } from "./define";
import { MeleeSkill, CrouchSkill, RunAwaySkill, HealSkill, DoubleMeleeSkill, ArrowHighShotingSkill, ArrowShotingSkill, FireRainSkill, ProjectileSkill } from "./battleskill";

// 캐릭터 로직
export class BattleCharacter extends PIXI.Container {
    constructor(character) {
        super();
        this.character = character;
        
        this.camp = CHARACTER_CAMP.ALLY;
        this.gridPosition = {
            x: 0,
            y: 0
        }

        this.tweens = new Tweens();

        this.container = new PIXI.Container();
        this.animation = new BattleAnimation(this.character);
        this.progressBar = new BattleProgressBar();
        this.progressBar.setPosition({
            x: this.animation.width / 2,
            y: this.progressBar.position.y
        });
        this.progressBar.position.y = -this.animation.height;

        this.container.addChild(this.animation);
        this.container.addChild(this.progressBar);
        this.addChild(this.container);

        this.skills = [];

        this.progressBar.setProgress(this.health / this.maxHealth);

        // 스킬을 가지는 것 우선 하드코딩..
        if (character.data.name == 'elid') {
            this.skills.push(new ProjectileSkill(this));
            this.skills.push(new FireRainSkill(this));
        } else if (character.data.name == 'miluda') {
            this.skills.push(new ArrowShotingSkill(this));
            this.skills.push(new ArrowHighShotingSkill(this));
        } else if (character.data.name == 'warrior') {
            this.skills.push(new MeleeSkill(this));
            this.skills.push(new DoubleMeleeSkill(this));
        } else if (character.data.name == 'healer') {
            this.skills.push(new MeleeSkill(this));
            this.skills.push(new HealSkill(this));
        } else {
            this.skills.push(new CrouchSkill(this));
            this.skills.push(new RunAwaySkill(this));
        }
        this.skills[1].currentDelay = 0;
        this.skills[1].activeType = ACTIVE_TYPE.ACTIVE;
    }

    setCamp(camp) {
        this.camp = camp;
    }

    setGridPosition(position) {
        this.gridPosition.x = position.x;
        this.gridPosition.y = position.y;
    }

    update(scene) {
        this.tweens.update();
        this.animation.update();

        this.updateSkills(scene);
        this.enqueueIdlePassiveSkill(scene);
    }

    enqueueIdlePassiveSkill(scene) {
        let selectedPassiveSkill = null;

        this.skills.forEach((skill) => {
            if(skill.isReady() && skill.activeType === ACTIVE_TYPE.PASSIVE && selectedPassiveSkill === null) {
                selectedPassiveSkill = skill;
            }
        });

        if (selectedPassiveSkill) {
            selectedPassiveSkill.setWait();
            scene.queue.enqueue(selectedPassiveSkill);
        }
    }

    updateSkills(scene) {
        this.skills.forEach((skill) => {
            if (skill.status === SKILL_STATUS.IDLE && !scene.queue.hasItem() && this.health > 0) {
                skill.delay();
            }
        });
    }

    onDamage(damage) {
        this.character.health -= damage;
        const healthRate = this.health / this.maxHealth;
        this.progressBar.setProgress(healthRate);

            this.animation.softRollBackTint(0xFF0000, 0.75);
            this.animation.vibration(6, 0.5);

        if (this.health <= 0) {
            this.tweens.addTween(this.container, 0.5, {alpha: 0}, 0, 'easeInOut', false, () => {
            });
        }
    }

    get health() {
        return this.character.health;
    }

    get maxHealth() {
        return this.character.maxHealth;
    }
}

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
        this.setAnimation(animationName.split('_')[0] + '_' + getDirectionName(direction));
    }
   
    setAnimation(name) {
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