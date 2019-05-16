import { State } from "./battlecharacterstate";
import { StatManager } from "./battlecharacterstat";
import { BattleProgressBar } from "./battleui";
import { Movies, loadAniTexture, getDirectionName } from "./battleutils";
import { CHARACTER_CAMP, ACTIVE_TYPE, SKILL_STATUS } from "./battledeclare";
import Tweens from "./tweens";
import { DIRECTIONS } from "./define";
import MovieClip from "./movieclip";
import { MeleeSkill, CrouchSkill, RunAwaySkill, HealSkill, DoubleMeleeSkill, ArrowHighShotingSkill, ArrowShotingSkill, FireRainSkill, ProjectileSkill } from "./battleskill";
import { BuffEffecter } from "./battleeffecter";

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
        this.movies = new Movies();

        this.container = new PIXI.Container();
        this.animation = new BattleAnimation(this.character);
        this.progressBar = new BattleProgressBar();
        this.buffEffecter = new BuffEffecter(this);
        this.progressBar.position.y = -this.animation.height;

        this.container.addChild(this.animation);
        this.container.addChild(this.buffEffecter);
        this.container.addChild(this.progressBar);
        this.addChild(this.container);

        this.skills = [];
        this.state = new State();
        this.stat = new StatManager(this.character);

        this.progressBar.setWidth(this.health / this.maxHealth * 34);

        this.stateInit();

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
    
    stateInit() {
        if (this.health > 0) {
            const stateSuccess = this.state.change('idle');
            if (stateSuccess) {
                this.setAnimation('idle');
            }
        } else {
            this.state.change('die');
        }
    }

    setCamp(camp) {
        this.camp = camp;
    }

    setGridPosition(position) {
        this.gridPosition.x = position.x;
        this.gridPosition.y = position.y;
    }

    update(scene) {
        this.movies.update();
        this.tweens.update();
        this.stat.update();
        this.animation.update();
        this.progressBar.update();
        this.buffEffecter.update();

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
        const hpWidth = (this.health< 0 ? 0 : this.health) / this.maxHealth * 34;
        this.progressBar.setWidth(hpWidth);

        const stateSuccess = this.state.change('damaged');
        if (stateSuccess) {
            this.animation.softRollBackTint(0xFF0000, 45);
            this.animation.vibration(6, 12, () => {
                this.state.rollback();
            });
        }

        if (this.health <= 0) {
            this.state.change('die');
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
        this.movies = new Movies();

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
        this.movies.update();
        this.tweens.update();
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
        const startTint = tint? tint: 0xFFFFFF;
        let [sR, sG, sB] = [(startTint & 0xFF0000) >>> 16, (startTint & 0x00FF00) >>> 8, startTint & 0x0000FF];
        const [addR, addG, addB] = [(255 - sR) / duration, (255 - sG) / duration, (255 - sB) / duration];
        this.anim.tint = Math.round(sR) << 16 | Math.round(sG) << 8 | Math.round(sB);

        const movieClip = new MovieClip(
            MovieClip.Timeline(1, duration, null, () => {
                sR += addR;
                sG += addG;
                sB += addB;
                this.anim.tint = (Math.round(sR) << 16 | Math.round(sG) << 8 | Math.round(sB));
            }),
            MovieClip.Timeline(duration + 1, duration + 1, null, () => {
                this.anim.tint = 0xFFFFFF;
            })
        );

        this.movies.push(movieClip);
        movieClip.playAndStop();
    }

    // 캐릭터 anim의 position 건드리는데.. anim x 건드리는 애랑 같이 사용할 경우 문제될 수 있다.
    vibration(scale, duration, callback) {
        const x = this.anim.position.x;
        const y = this.anim.position.y;
        let vibrationScale = scale;

        const movieClip = new MovieClip(
            MovieClip.Timeline(1, duration, null, () => {
                this.anim.position.x = x + vibrationScale;
                this.anim.position.y = y + vibrationScale;
                vibrationScale = vibrationScale / 8 * -7;
            }),
            MovieClip.Timeline(duration + 1, duration + 1, null, () => {
                this.anim.position.x = x;
                this.anim.position.y = y;
            }),
            MovieClip.Timeline(duration + 2, duration + 2, null, () => {
                if (callback) {
                    callback();
                }
            })
        );

        this.movies.push(movieClip);
        movieClip.playAndStop();
    }
}