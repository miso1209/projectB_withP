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
    constructor(base) {
        super();
        this.baseStat = {};
        this.battleUi = {};
        this.camp = CHARACTER_CAMP.ALLY;
        this.gridPosition = {
            x: 0,
            y: 0
        }

        this.tweens = new Tweens();
        this.movies = new Movies();

        this.loadBase(base);
        this.container = new PIXI.Container();
        this.animation = new BattleAnimation(base);
        this.progressBar = new BattleProgressBar();
        this.buffEffecter = new BuffEffecter(this);
        this.progressBar.position.y = -this.animation.height;

        this.container.addChild(this.animation);
        this.container.addChild(this.buffEffecter);
        this.container.addChild(this.progressBar);
        this.addChild(this.container);

        this.skills = [];
        this.state = new State();
        this.stat = new StatManager(this.baseStat);

        const stateSuccess = this.state.change('idle');
        if (stateSuccess) {
            this.setAnimation('idle');
        }

        // 스킬을 가지는 것 우선 하드코딩..
        if (base.name == 'Elid') {
            this.skills.push(new ProjectileSkill(this));
            this.skills.push(new FireRainSkill(this));
        } else if (base.name == 'Miluda') {
            this.skills.push(new ArrowShotingSkill(this));
            this.skills.push(new ArrowHighShotingSkill(this));
        } else if (base.name == 'Warrior') {
            this.skills.push(new MeleeSkill(this));
            this.skills.push(new DoubleMeleeSkill(this));
        } else if (base.name == 'Healer') {
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
        this.movies.update();
        this.tweens.update();
        this.stat.update();
        this.animation.update();
        this.progressBar.update();
        this.buffEffecter.update();

        this.updateSkills(scene);
        this.enqueueIdlePassiveSkill(scene);
    }

    // 이 아랫단의 스킬 updateSkill관련 , skill관련은 전부 다시짜자..
    enqueueIdlePassiveSkill(scene) {
        // 이 부분에 스킬 여러개가 레디상태 인 경우, 어떤 스킬을 Enqueue할지 정하는 로직 필요할듯 하다.
        let selectedPassiveSkill = null;

        // 음.. 지금은 후딜을 공유하지 않게 작성하긴 했는데.. 후딜을 공유하지 않고 패시브 스킬을 여러개 가진다면? 연속적으로 enqueue로 공격한 후 딜레이를 할 것 같다.
        // 맞기도하고 아닌것 같기도하고.. 정책적으로 정해야 할듯.
        this.skills.forEach((skill) => {
            if(skill.isReady() && skill.activeType === ACTIVE_TYPE.PASSIVE && selectedPassiveSkill === null) {
                selectedPassiveSkill = skill;
            }
        });

        if (selectedPassiveSkill) {
            selectedPassiveSkill.setWait();
            selectedPassiveSkill.init(scene.battle);
            scene.queue.enqueue(selectedPassiveSkill);
        }
    }

    updateSkills(scene) {
        this.skills.forEach((skill) => {
            if (skill.status === SKILL_STATUS.IDLE && !scene.queue.hasItem() && this.baseStat.hp > 0) {
                skill.delay();
            }
        });
    }

    loadBase(base) {
        this.name = base.name;

        this.baseStat = {};
        for(let key in base.stat) {
            this.baseStat[key] = base.stat[key];
        }

        this.battleUi = {};
        for(let key in base.battleUi) {
            this.battleUi[key] = base.battleUi[key];
        }
    }

    onDamage(damage) {
        this.baseStat.hp -= damage;
        const hpWidth = (this.baseStat.hp< 0 ? 0 : this.baseStat.hp) / this.baseStat.maxHp * 34;
        this.progressBar.setWidth(hpWidth);

        const stateSuccess = this.state.change('damaged');
        if (stateSuccess) {
            this.animation.softRollBackTint(0xFF0000, 45);
            this.animation.vibration(6, 12, () => {
                this.state.rollback();
            });
        }

        if (this.baseStat.hp <= 0) {
            this.state.change('die');
            this.tweens.addTween(this.container, 0.5, {alpha: 0}, 0, 'easeInOut', false, () => {
            });
        }
    }
}

// Battle Character의 Animation Sprite 처리를 하는 클래스.
class BattleAnimation extends PIXI.Container {
    constructor(base) {
        super();
        this.tweens = new Tweens();
        this.movies = new Movies();

        this.shadow = new PIXI.Sprite(PIXI.Texture.fromFrame("shadow.png"));
        this.shadow.position.y = -this.shadow.height;

        this.animations = {};
        for(let key in base.animations) {
            this.animations[key + '_nw'] = { textures: loadAniTexture(base.animations[key].texture + "_nw", base.animations[key].length), flipX: false };
            this.animations[key + '_ne'] = { textures: this.animations[key + '_nw'].textures, flipX: true };
            this.animations[key + '_sw'] = { textures: loadAniTexture(base.animations[key].texture + "_sw", base.animations[key].length), flipX: false };
            this.animations[key + '_se'] = { textures: this.animations[key + '_sw'].textures, flipX: true };
        }

        this.offset = base.offset;
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
                vibrationScale = vibrationScale / 6 * -5;
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