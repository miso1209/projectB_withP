import { DIRECTIONS } from './define';
import MovieClip from './movieclip';
import { MeleeSkill, ProjectileSkill, ArrowShotingSkill, SKILL_STATUS, ACTIVE_TYPE, CrouchSkill, RunAwaySkill, DoubleMeleeSkill } from './skill';
import Tweens from './tweens';

function loadAniTexture(name, count) {
    const frames = [];  
    for (let i = 0; i < count; i++) {
        frames.push(PIXI.Texture.fromFrame(name + i + '.png'));
    }
    return frames;
}

export function getDirectionName(dir) {
    if (dir === DIRECTIONS.SE) {
        return 'se';
    } else if (dir === DIRECTIONS.NW) {
        return 'nw';
    } else if (dir === DIRECTIONS.NE) {
        return 'ne';
    } else if (dir === DIRECTIONS.SW) {
        return 'sw';
    }
}

export const STATUS = {
    IDLE: 1,
    ATTACK: 2,
    DIE: 3,
    WAIT: 4,
    BE_ATTACKED: 5
};

class StatusManager {
    constructor(opponent) {
        this.opponent = opponent;

        this.stat = Object.assign({}, this.opponent.stat);

        this.buffs = [];
        this.conditionErrors = [];
    }

    canAction() {
        let result = true;
        
        for (let i=0; i<this.conditionErrors.length;i++) {
            result = result && this.conditionErrors[i].canAction();
        }

        return result;
    }

    update() {
        let flag = false;
        let stat = Object.assign({}, this.stat);

        this.buffs.forEach((buff) => {
            stat = buff.update(stat);
            flag = true;
        });

        if(flag) {
            this.opponent.stat = Object.assign(this.opponent.stat, stat);
        }

        this.conditionErrors.forEach((conditionError) => {
            conditionError.update(this.opponent);
        });
    }

    addBuff(buff, overwrite, overlap) {
        let buffIndex = null;

        this.buffs.forEach((compareBuff, index) => {
            if (buff.constructor === compareBuff.constructor) {
                buffIndex = index;
            }
        });

        if (overwrite && buffIndex !== null) {
            this.buffs[buffIndex].overwrite(buff.options);
        } else if (overlap && buffIndex !== null) {
            this.buffs[buffIndex].overlap(buff.options);
        } else if (buffIndex === null) {
            this.buffs.push(buff);
        }
    }

    addConditionError(conditionError, overwrite, overlap) {
        let conditionIndex = null;

        this.conditionErrors.forEach((compareConditionError, index) => {
            if (conditionError.constructor === compareConditionError.constructor) {
                conditionIndex = index;
            }
        });

        if (overwrite && conditionIndex !== null) {
            this.conditionErrors[conditionIndex].overwrite(conditionError.options);
        } else if (overlap && conditionIndex !== null) {
            this.conditionErrors[conditionIndex].overlap(conditionError.options);
        } else if (conditionIndex === null) {
            this.conditionErrors.push(conditionError);
        }
    }
}

export class BaseBuff {
    constructor (options) {
        const basicOptions = {
            retensionFrames: 0,
            addBuffs: {},
            multiBuffs: {}
        }
        this.options = Object.assign(basicOptions, options);
        this.target = null;
    }

    update(stat) {
        let resultStat = {};
        if (this.options.retensionFrames > 0) {
            for (let buff in this.options.addBuffs) {
                resultStat[buff] = stat[buff] + this.options.addBuffs[buff];
            }

            for (let buff in this.options.multiBuffs) {
                resultStat[buff] = stat[buff] * this.options.multiBuffs[buff];
            }
            this.options.retensionFrames--;
            this.action(this.target);
        } else {
            for (let buff in this.options.addBuffs) {
                resultStat[buff] = stat[buff];
            }

            for (let buff in this.options.multiBuffs) {
                resultStat[buff] = stat[buff];
            }
        }

        return resultStat;
    }

    action() {
    }

    overwrite(options) {
        this.options = options;
    }

    overlap(options) {
        for (let key in options) {
            this.options[key] += options[key];
        }
    }
}

class BaseConditionError {
    constructor(options) {
        this.options = options;
    }

    overwrite(options) {
        this.options = options;
    }

    overlap(options) {
        for (let key in options) {
            this.options[key] += options[key];
        }
    }
}

export class Poison extends BaseConditionError {
    constructor(options) {
        super(options);
    }

    update(opponent) {
        if (this.options.retensionTime > 0) {
            opponent.anim.tint = 0x00FF00;
            if(this.options.retensionTime % 120 === 0) {
                opponent.onDamage(5);
            }
            this.options.retensionTime--;
        } else if(opponent.anim.tint === 0x00FF00) {
            opponent.anim.tint = 0xFFFFFF;
        }
    }

    canAction() {
        return true;
    }
}

export class Stun extends BaseConditionError {
    constructor(options) {
        super(options);
    }

    update(opponent) {
        if (this.options.retensionTime > 0) {
            opponent.anim.tint = 0x999999;
            this.options.retensionTime--;
        } else if(opponent.anim.tint === 0x999999) {
            opponent.anim.tint = 0xFFFFFF;
        }
    }

    canAction() {
        if (this.options.retensionTime > 0) {
            return false;
        } else {
            return true;
        }
    }
}

export default class BattleCharacter extends PIXI.Container {
    constructor(spec) {
        super();
        this.container = new PIXI.Container();
        this.tweens = new Tweens();
        this.movies = [];

        this.status = STATUS.IDLE;
        this.skills = [];

        // 스킬을 가지는 것 우선 하드코딩..
        if (spec.name == 'Elid') {
            this.skills.push(new ProjectileSkill());
        } else if (spec.name == 'Miluda') {
            this.skills.push(new ArrowShotingSkill());
        } else if (spec.name == 'Warrior') {
            this.skills.push(new MeleeSkill());
            this.skills.push(new DoubleMeleeSkill());
            this.skills[1].currentDelay = 0;
            this.skills[1].activeType = ACTIVE_TYPE.ACTIVE;
        } else {
            this.skills.push(new CrouchSkill());
            this.skills.push(new RunAwaySkill());
            this.skills[1].currentDelay = 0;
            this.skills[1].activeType = ACTIVE_TYPE.ACTIVE;
        }

        this.skills.forEach((skill) => {
            skill.setProponent(this);
        });

        const shadow = new PIXI.Sprite(PIXI.Texture.fromFrame("shadow.png"));
        shadow.position.y = -shadow.height;
        this.container.addChild(shadow);

        this.battle = null;

        this.loadSpec(spec);
        this.statusManager = new StatusManager(this);
        this.makeProgressBar();
        this.addChild(this.container);

        // 임시로 캐릭터를 누르면 Active Queue에 본인의 스킬을 넣는다. 제거할 것.
        this.container.interactive = true;
        this.container.on('mouseup', (event) => {
            if (this.skills[1].isReady()) {
                this.skills[1].setWait();
                this.battle.activeQueue.enqueue(this.skills[1]);
            }
        });
    }

    makeProgressBar() {
        const hpHolder = new PIXI.Sprite(PIXI.Texture.fromFrame("pbar.png"));
        const hpBar = new PIXI.Sprite(PIXI.Texture.fromFrame("pbar_r.png"));
        this.hpHolder = hpHolder;
        this.hpBar = hpBar;
        this.hpHolder.position.y = -this.anim.height - 3;
        this.hpHolder.position.x = 16 - this.hpHolder.width / 2;
        this.hpBar.position.y = -this.anim.height - 2;
        this.hpBar.position.x = 16 - this.hpHolder.width / 2 + 1;
        this.container.addChild(hpHolder);
        this.container.addChild(hpBar);
    }

    loadSpec(spec) {
        this.name = spec.name;
        
        for(let key in spec.battleUi) {
            this[key] = new PIXI.Sprite(PIXI.Texture.fromFrame(spec.battleUi[key]));
        }

        this.stat = {};
        for(let key in spec.stat) {
            this.stat[key] = spec.stat[key];
        }

        this.animations = {};
        for(let key in spec.animations) {
            this.animations[key + '_nw'] = { textures: loadAniTexture(spec.animations[key].texture + "_nw", spec.animations[key].length), flipX: false };
            this.animations[key + '_ne'] = { textures: this.animations[key + '_nw'].textures, flipX: true };

            this.animations[key + '_sw'] = { textures: loadAniTexture(spec.animations[key].texture + "_sw", spec.animations[key].length), flipX: false };
            this.animations[key + '_se'] = { textures: this.animations[key + '_sw'].textures, flipX: true };
        }
        this.offset = spec.offset;
        const anim = new PIXI.extras.AnimatedSprite(this.animations.idle_sw.textures);
        anim.animationSpeed = 0.1;
        anim.play();
        anim.position.x = this.offset.x;
        anim.position.y = this.offset.y;
        this.anim = anim;
        this.container.addChild(anim);
        this.currentDir = DIRECTIONS.SW;
    }

    update(battle) {
        // Active Skill Test를 위한 임시. 제거할 것.
        this.battle = battle; // 지우자 UI 생기면 어떻게 매핑할지도 생각하자.
        
        this.tweens.update();
        this.updateMovieclips();
        this.statusManager.update();

        this.updateSkills(battle);
        this.enqueueIdlePassiveSkill(battle);
    }

    enqueueIdlePassiveSkill(battle) {
        // 캐릭터가 사망하였거나, 전투가 끝났을 경우 캐릭터 액션로직(스킬 큐에 올리기, 스킬 딜레이 감소) 돌리지 않는다. (좋지않다..)
        if (this.status === STATUS.DIE || battle.isBattleEnd() || !this.statusManager.canAction()) {
            return;
        }

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
            battle.basicQueue.enqueue(selectedPassiveSkill);
        }
    }

    updateSkills(battle) {
        // 캐릭터가 사망하였거나, 전투가 끝났을 경우 캐릭터 액션로직(스킬 큐에 올리기, 스킬 딜레이 감소) 돌리지 않는다. 좋지않다..
        if (this.status === STATUS.DIE || battle.isBattleEnd() || !this.statusManager.canAction()) {
            return;
        }

        this.skills.forEach((skill) => {
            if (skill.status === SKILL_STATUS.IDLE && battle.currentAction === null) {
                skill.delay();
            }
        });
    }

    updateMovieclips() {
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

    showProgressBar() {
        this.hpHolder.visible = true;
        this.hpBar.visible = true;
        this.tweens.addTween(this.hpHolder, 0.5, { alpha: 1 }, 0, "easeInOut", true);
        this.tweens.addTween(this.hpBar, 0.5, { alpha: 1 }, 0, "easeInOut", true);
    }

    hideProgressBar() {
        this.tweens.addTween(this.hpHolder, 0.5, { alpha: 0 }, 0, "linear", true, () => {
            this.hpHolder.visible = false;
        });
        this.tweens.addTween(this.hpBar, 0.5, { alpha: 0 }, 0, "linear", true, () => {
            this.hpBar.visible = false;
        });
    }

    onDamage(damage) {
        this.stat.hp-= damage;
        const hpWidth = (this.stat.hp< 0 ? 0 : this.stat.hp) / this.stat.maxHp * 34;

        this.tweens.addTween(this.hpBar, 0.5, { width: hpWidth }, 0, "easeInOut", true);
        this.softRollBackTint(0xFF0000, 45);
        this.vibration(6, 12);

        this.checkDie();
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
    vibration(scale, duration) {
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
            })
        );

        this.movies.push(movieClip);
        movieClip.playAndStop();
    }

    checkDie() {
        if (this.stat.hp<= 0) {
            this.status = STATUS.DIE;
            this.tweens.addTween(this.container, 0.5, { alpha: 0 }, 0, "easeInOut", true);
        }
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

    changeVisualToDirection(direction) {
        this.currentDir = direction;
        if (this.isMoving) {
            // 이동 애니메이션
            this.setAnimation('walk_' + getDirectionName(direction));
        } else {
            this.setAnimation('idle_' + getDirectionName(direction));
        }
    }
}