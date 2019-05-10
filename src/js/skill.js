import MovieClip from './movieclip';
import {Stun, Poison, BaseBuff, STATUS} from './battlecharacter';
import {DIRECTIONS} from './define';

function getDirectionName(dir) {
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

export const SKILL_STATUS = {
    IDLE: 1,
    WAIT: 2,
    ACTION: 3
};

export const ACTIVE_TYPE = {
    PASSIVE: 1,
    ACTIVE: 2
};

const TARGETING_TYPE = {
    ENEMY_FRONT_TANK: 1,
    ENEMY_BACK_CARRY: 2,
    ENEMY_FRONT_ALL: 3,
    ENEMY_BACK_ALL: 4,
    ENEMY_ALL: 5,
    ALLY_FRONT_TANK: 6,
    ALLY_BACK_CARRY: 7,
    ALLY_FRONT_ALL: 8,
    ALLY_BACK_ALL: 9,
    ALLY_ALL: 10,
    SELF: 11,
    ENEMY_MIN_HP: 12
}

// 스텟 계산 파둬야 하는데.. 이건 언제하지?.. 어렵다.. 스탯이랑, 에큅으로 능력치 계산 및 스킬에 적용.. 염두해두자.. 생각해두자.
// 기본적으로 배틀캐릭터가 Stat 을 가진 BaseCharacter공유할텐데.. 이것도 조금 머리아프네.. 주말간 생각해볼것.
// 스킬 클래스 엄청 더러움.. 깔끔하게 변경할 수 없을까?
class BaseSkill {
    constructor() {
        this.status = SKILL_STATUS.IDLE;
        this.activeType = ACTIVE_TYPE.PASSIVE;

        // JSON을 받아서 각각의 정보를 넣는다. (지금은 하드코딩)
        this.damage = 80 + Math.round(Math.random()*30);

        // beforeAttack : Attack 전까지의 frame, doneAttack : Attack 액션이 모두 수행될때 까지의 frame, afterAttack 다음 공격까지의 delay frame (쉽게말해 쿨타임)
        this._delay = {
            beforeAttack: 50,
            doneAttack: 78,
            afterAttack: 100
        };

        // 현재 남아있는 후딜을 계산하기 위함..
        this.currentDelay = Math.round(60 + this._delay.afterAttack * Math.random());

        // 타겟팅 만들어야 한다..
        this.targeting = null;
        this.target = null;
        this.movies = [];
    }

    // 스킬의 사용자를 셋한다.
    setProponent(proponent) {
        this.proponent = proponent;
    }

    isReady() {
        return (this.currentDelay <= 0 && this.status === SKILL_STATUS.IDLE);
    }

    setWait() {
        this.status = SKILL_STATUS.WAIT;
    }

    getDelay() {
        return this.currentDelay;
    }

    delay() {
        this.currentDelay--;
        if (this.currentDelay <= 0) {
            this.currentDelay = 0;
        }
    }

    // 타겟 선정알고리즘.. 지금은 우선 살아있는 랜덤 캐릭터 반환.
    getTarget(opponents,proponents, targeting) {
        let target = null;
        let enemies = [];

        switch(targeting) {
            case TARGETING_TYPE.ENEMY_FRONT_TANK:
                opponents.getFrontCharacters().forEach((opponent) => {
                    if (target === null && opponent.stat.hp> 0) {
                        enemies.push(opponent);
                    }
                });
                break;

            case TARGETING_TYPE.ENEMY_BACK_CARRY:
            opponents.getBackCharacters().forEach((opponent) => {
                if (target === null && opponent.stat.hp> 0) {
                    enemies.push(opponent);
                }
            });
                break;

            case TARGETING_TYPE.ENEMY_MIN_HP:
            opponents.getCharacters().forEach((opponent) => {
                if ((target === null && opponent.stat.hp > 0) || (target !== null && target.stat.hp > opponent.stat.hp && opponent.stat.hp > 0)) {
                    target = opponent;
                    enemies = [opponent];
                }
            });
                break;

            case TARGETING_TYPE.ALLY_ALL:
            proponents.getCharacters().forEach((proponent) => {
                enemies.push(proponent);
            });
                break;
        }

        if (enemies.length === 0) {
            opponents.getCharacters().forEach((opponent) => {
                if (opponent.stat.hp> 0) {
                    enemies.push(opponent);
                }
            });
        }

        if (enemies.length > 0) {
            target = enemies[Math.round((enemies.length-1) * Math.random())];
        }

        return target;
    }

    // 타겟 선정알고리즘.. 지금은 우선 살아있는 랜덤 캐릭터 반환.
    getTargets(opponents,proponents, targeting) {
        let target = null;
        let enemies = [];

        switch(targeting) {
            case TARGETING_TYPE.ENEMY_FRONT_TANK:
                opponents.getFrontCharacters().forEach((opponent) => {
                    if (target === null && opponent.stat.hp> 0) {
                        enemies.push(opponent);
                    }
                });
                break;

            case TARGETING_TYPE.ENEMY_BACK_CARRY:
            opponents.getBackCharacters().forEach((opponent) => {
                if (target === null && opponent.stat.hp> 0) {
                    enemies.push(opponent);
                }
            });
                break;

            case TARGETING_TYPE.ENEMY_MIN_HP:
            opponents.getCharacters().forEach((opponent) => {
                if ((target === null && opponent.stat.hp > 0) || (target !== null && target.stat.hp > opponent.stat.hp && opponent.stat.hp > 0)) {
                    target = opponent;
                    enemies = [opponent];
                }
            });
                break;

            case TARGETING_TYPE.ALLY_ALL:
            proponents.getCharacters().forEach((proponent) => {
                if(proponent.stat.hp > 0) {
                    enemies.push(proponent);
                }
            });
                break;

            case TARGETING_TYPE.ENEMY_ALL:
            opponents.getCharacters().forEach((opponent) => {
                if(opponent.stat.hp > 0) {
                    enemies.push(opponent);
                }
            });
                break;
        }

        if (enemies.length === 0) {
            opponents.getCharacters().forEach((opponent) => {
                if (opponent.stat.hp> 0) {
                    enemies.push(opponent);
                }
            });
        }

        return enemies;
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
}

export class RunAwaySkill extends BaseSkill {
    constructor() {
        super();
        this.currentDelay = 300;
    }

    init(battle) {
        this.currentFrame = 0;
        this.status = SKILL_STATUS.WAIT;
        
        // 스킬의 사용자를 비교하여, 적군파티, 아군파티를 셋팅한다.
        let proponents = battle.playerParty;
        let opponents = battle.enemyParty;
        if (opponents.isParty(this.proponent)) {
            [proponents, opponents] = [opponents, proponents];
        }
        this.target = this.getTarget(opponents, proponents, TARGETING_TYPE.ENEMY_FRONT_TANK);
        
        const movieClip = new MovieClip(
            MovieClip.Timeline(1, 1, null, () => {
                // battle.showChatBallon(this.proponent, "제가 조금 바빠서 이만..", 0.5);
                this.proponent.setAnimation('idle_' + getDirectionName(this.proponent.currentDir));
                this.proponent.anim.loop = true;
            }),
            MovieClip.Timeline(31, 61, null, () => {
                this.proponent.alpha -= 0.05;
                this.proponent.x += 1;
                this.proponent.y -= 0.5;
                this.proponent.setAnimation('walk_' + getDirectionName(this.proponent.currentDir));
                this.proponent.anim.loop = true;
            }),
            MovieClip.Timeline(62, 62, null, () => {
                this.proponent.stat.hp = 0;
                this.proponent.status = STATUS.DIE;
            })
        );

        this.movies.push(movieClip);
        movieClip.playAndStop();
    }

    action(battle) {
        if (this.proponent.stat.hp<= 0 || !this.proponent.statusManager.canAction()) {
            return null;
        }

        this.updateMovieclips();
        this.status = SKILL_STATUS.ACTION;
        
        if (this.currentFrame === 63) {
            this.currentFrame = 0;
            // 임시로 후딜을 랜덤으로 주어 공격 순서가 뒤죽박죽이 되게 만들어 본다.
            this.currentDelay = Math.round(60 + this._delay.afterAttack * Math.random());
            this.proponent.stat.hp = 0;
            this.status = SKILL_STATUS.IDLE;

            return null;
        }
        this.currentFrame++;
        
        return this;
    }
}

export class CrouchSkill extends BaseSkill {
    constructor() {
        super();
    }

    init(battle) {
        this.currentFrame = 0;
        this.status = SKILL_STATUS.WAIT;
        
        // 스킬의 사용자를 비교하여, 적군파티, 아군파티를 셋팅한다.
        let proponents = battle.playerParty;
        let opponents = battle.enemyParty;
        if (opponents.isParty(this.proponent)) {
            [proponents, opponents] = [opponents, proponents];
        }
        this.target = this.getTarget(opponents, proponents, TARGETING_TYPE.ENEMY_FRONT_TANK);
        
        const movieClip = new MovieClip(
            MovieClip.Timeline(1, 1, null, () => {
                this.proponent.setAnimation('idle_' + getDirectionName(this.proponent.currentDir));
                this.proponent.anim.loop = true;
            }),
            MovieClip.Timeline(30, 31, null, () => {
                this.proponent.statusManager.addBuff(new BaseBuff({ retensionFrames: 6000, addBuffs:{defense:0.4}, effect: new Shield(battle.effect, this.proponent)}), true, false);
                this.proponent.setAnimation('crouch_' + getDirectionName(this.proponent.currentDir));
                this.proponent.anim.loop = true;
            })
        );

        this.movies.push(movieClip);
        movieClip.playAndStop();
    }

    action(battle) {
        if (this.proponent.stat.hp<= 0 || !this.proponent.statusManager.canAction()) {
            return null;
        }

        this.updateMovieclips();
        this.status = SKILL_STATUS.ACTION;
        
        if (this.currentFrame === 50) {
            this.currentFrame = 0;
            // 임시로 후딜을 랜덤으로 주어 공격 순서가 뒤죽박죽이 되게 만들어 본다.
            this.currentDelay = Math.round(60 + this._delay.afterAttack * Math.random());
            this.status = SKILL_STATUS.IDLE;

            return null;
        }
        this.currentFrame++;
        
        return this;
    }
}

// MELEE SKILL
export class DoubleMeleeSkill extends BaseSkill {
    constructor() {
        super();
        this._delay = {
            beforeAttack: [50, 96],
            doneAttack: 137,
            afterAttack: 100
        };
    }

    init(battle) {
        this.currentFrame = 0;
        this.status = SKILL_STATUS.WAIT;
        this.damage = 80 + Math.round(Math.random()*15);
        
        // 스킬의 사용자를 비교하여, 적군파티, 아군파티를 셋팅한다.
        let proponents = battle.playerParty;
        let opponents = battle.enemyParty;
        if (opponents.isParty(this.proponent)) {
            [proponents, opponents] = [opponents, proponents];
        }
        this.target = this.getTarget(opponents, proponents, TARGETING_TYPE.ENEMY_FRONT_TANK);
        
        // Proponent 의 움직임, 애니메이션처리.
        const start = { x: this.proponent.x, y: this.proponent.y };
        const vector = this.proponent.currentDir === DIRECTIONS.SW? -1 : 1;
        const to = { x: this.proponent.x + 16 * vector, y: this.proponent.y - 8 * vector };

        const movieClip = new MovieClip(
            MovieClip.Timeline(1, 10, this.proponent, [
                ["x", start.x, to.x, "outCubic"],
                ["y", start.y, to.y, "outCubic"]
            ]),
            MovieClip.Timeline(11, 23, null, () => {
                this.proponent.setAnimation('attack2_' + getDirectionName(this.proponent.currentDir));
                this.proponent.anim.loop = false;
            }),
            MovieClip.Timeline(63, 64, null, () => {
                this.proponent.setAnimation('attack_' + getDirectionName(this.proponent.currentDir));
                this.proponent.anim.loop = false;
            }),
            MovieClip.Timeline(125, 126, null, () => {
                this.proponent.setAnimation('idle_' + getDirectionName(this.proponent.currentDir));
                this.proponent.anim.loop = true;
            }),
            MovieClip.Timeline(127, 136, this.proponent, [
                ["x", to.x, start.x, "outCubic"],
                ["y", to.y, start.y, "outCubic"]
            ]),
            MovieClip.Timeline(137, 137, null, () => {
                this.proponent.statusManager.addBuff(new BaseBuff({ retensionFrames: 900, multiBuffs:{defense:1.5}, effect: new Shield(battle.effect, this.proponent)}), true, false);
            }),
        );

        this.movies.push(movieClip);
        movieClip.playAndStop();
    }

    action(battle) {
        if (this.proponent.stat.hp<= 0 || !this.proponent.statusManager.canAction()) {
            return null;
        }

        this.updateMovieclips();
        this.status = SKILL_STATUS.ACTION;

        if (this.currentFrame === this._delay.beforeAttack[0]) {
            this.damage = 80 + Math.round(Math.random()*15);
            this.damage = Math.round((1 - this.target.stat.defense) * this.damage);

            battle.effect.addEffect(this.target, { name: 'slash', animationLength: 8, removeFrame: 60, speed: 0.5 });
            battle.effect.addDamageEffect(this.target, this.damage, "#ffffff");
            this.target.onDamage(this.damage);
        } else if (this.currentFrame === this._delay.beforeAttack[1]) {
            this.damage = 80 + Math.round(Math.random()*15);
            if (this.target) {
                this.damage = Math.round((1 - this.target.stat.defense) * this.damage);
    
                battle.effect.addEffect(this.target, { name: 'slash', animationLength: 8, removeFrame: 60, speed: 0.5 });
                battle.effect.addDamageEffect(this.target, this.damage, "#ffffff");
                battle.effect.flashScreen(0.2, 0.1);
                battle.stage.vibrationStage(8, 12);
                this.target.onDamage(this.damage);
            }
        } else if (this.currentFrame === this._delay.doneAttack) {
            this.currentFrame = 0;
            // 임시로 후딜을 랜덤으로 주어 공격 순서가 뒤죽박죽이 되게 만들어 본다.
            this.currentDelay = Math.round(60 + this._delay.afterAttack * Math.random());
            this.status = SKILL_STATUS.IDLE;

            return null;
        }
        this.currentFrame++;
        
        return this;
    }
}

// MELEE SKILL
export class MeleeSkill extends BaseSkill {
    constructor() {
        super();
        this._delay = {
            beforeAttack: 50,
            doneAttack: 92,
            afterAttack: 100
        };
    }

    init(battle) {
        this.currentFrame = 0;
        this.status = SKILL_STATUS.WAIT;
        this.damage = 80 + Math.round(Math.random()*15);
        
        // 스킬의 사용자를 비교하여, 적군파티, 아군파티를 셋팅한다.
        let proponents = battle.playerParty;
        let opponents = battle.enemyParty;
        if (opponents.isParty(this.proponent)) {
            [proponents, opponents] = [opponents, proponents];
        }
        this.target = this.getTarget(opponents, proponents, TARGETING_TYPE.ENEMY_FRONT_TANK);
        
        // Proponent 의 움직임, 애니메이션처리.
        const start = { x: this.proponent.x, y: this.proponent.y };
        const vector = this.proponent.currentDir === DIRECTIONS.SW? -1 : 1;
        const to = { x: this.proponent.x + 16 * vector, y: this.proponent.y - 8 * vector };

        const movieClip = new MovieClip(
            MovieClip.Timeline(1, 10, this.proponent, [
                ["x", start.x, to.x, "outCubic"],
                ["y", start.y, to.y, "outCubic"]
            ]),
            MovieClip.Timeline(11, 25, null, () => {
                this.proponent.setAnimation('attack_' + getDirectionName(this.proponent.currentDir));
                this.proponent.anim.loop = false;
            }),
            MovieClip.Timeline(78, 80, null, () => {
                this.proponent.setAnimation('idle_' + getDirectionName(this.proponent.currentDir));
                this.proponent.anim.loop = true;
            }),
            MovieClip.Timeline(81, 90, this.proponent, [
                ["x", to.x, start.x, "outCubic"],
                ["y", to.y, start.y, "outCubic"]
            ]),
            MovieClip.Timeline(91, 91, null, () => {
            }),
        );

        this.movies.push(movieClip);
        movieClip.playAndStop();
    }

    action(battle) {
        if (this.proponent.stat.hp<= 0 || !this.proponent.statusManager.canAction()) {
            return null;
        }

        this.updateMovieclips();
        this.status = SKILL_STATUS.ACTION;

        if (this.currentFrame === this._delay.beforeAttack) {
            this.damage = Math.round((1 - this.target.stat.defense) * this.damage);

            battle.effect.addEffect(this.target, { name: 'slash', animationLength: 8, removeFrame: 60, speed: 0.5 });
            battle.effect.addDamageEffect(this.target, this.damage, "#ffffff");
            this.target.onDamage(this.damage);
        } else if (this.currentFrame === this._delay.doneAttack) {
            this.currentFrame = 0;
            // 임시로 후딜을 랜덤으로 주어 공격 순서가 뒤죽박죽이 되게 만들어 본다.
            this.currentDelay = Math.round(60 + this._delay.afterAttack * Math.random());
            this.status = SKILL_STATUS.IDLE;

            return null;
        }
        this.currentFrame++;
        
        return this;
    }
}

// 투사채를 던지는 SKILL
export class ProjectileSkill extends BaseSkill {
    constructor() {
        super();

        // JSON을 받아서 각각의 정보를 넣는다. (지금은 하드코딩)
        this.damage = 90 + Math.round(Math.random()*30);
    }

    init(battle) {
        this.currentFrame = 0;
        this.status = SKILL_STATUS.WAIT;
        this.damage = 90 + Math.round(Math.random()*30);
        
        // 스킬의 사용자를 비교하여, 적군파티, 아군파티를 셋팅한다.
        let proponents = battle.playerParty;
        let opponents = battle.enemyParty;
        if (opponents.isParty(this.proponent)) {
            [proponents, opponents] = [opponents, proponents];
        }
        this.target = this.getTarget(opponents, proponents, TARGETING_TYPE.ENEMY_FRONT_TANK);

        const movieClip = new MovieClip(
            MovieClip.Timeline(11, 25, null, () => {
                this.proponent.setAnimation('attack_' + getDirectionName(this.proponent.currentDir));
                this.proponent.anim.loop = false;
            }),
            MovieClip.Timeline(63, 65, null, () => {
                this.proponent.setAnimation('idle_' + getDirectionName(this.proponent.currentDir));
                this.proponent.anim.loop = true;
            }),
            MovieClip.Timeline(78, 78, null, () => {
            }),
        );

        this.movies.push(movieClip);
        movieClip.playAndStop();
    }

    action(battle) {
        if (this.proponent.stat.hp<= 0) {
            return null;
        }

        this.updateMovieclips();
        this.status = SKILL_STATUS.ACTION;

        if (this.currentFrame === this._delay.beforeAttack) {
            // 투사체 설정 음.. 방향이 맞는지 모르겠다..
            const projectile = new PIXI.Sprite(PIXI.Texture.fromFrame("fireBall.png"));
            projectile.anchor.x = 0.5;
            projectile.anchor.y = 0.5;
            projectile.position.x = this.proponent.position.x + this.proponent.width / 2;
            projectile.position.y = this.proponent.position.y - this.proponent.height / 2;
            projectile.alpha = 0;
            projectile.blendMode = PIXI.BLEND_MODES.ADD;
            // 둘 사이의 좌표를 이용 atan 으로 rotation 돌려보자.
            projectile.rotation = Math.atan2((this.target.y - this.target.height / 2) - (projectile.y - projectile.height / 2), (this.target.x - this.target.width / 2) - (projectile.x - projectile.width / 2));
            battle.effect.addChild(projectile);

            const movieClip = new MovieClip(
                MovieClip.Timeline(1, this._delay.doneAttack - this.currentFrame -10, projectile, [["alpha", 0, 1, "outCubic"]]),
                MovieClip.Timeline(1, this._delay.doneAttack - this.currentFrame, projectile, [["x", projectile.position.x, this.target.position.x + this.target.width / 2, "outCubic"]]),
                MovieClip.Timeline(1, this._delay.doneAttack - this.currentFrame, projectile, [["y", projectile.position.y, this.target.position.y - this.target.height / 2, "outCubic"]]),
                MovieClip.Timeline(this._delay.doneAttack - this.currentFrame - 10, this._delay.doneAttack - this.currentFrame, projectile, [["alpha", 1, 0, "outCubic"]]),
                MovieClip.Timeline(this._delay.doneAttack - this.currentFrame, this._delay.doneAttack - this.currentFrame + 1, null, () => {
                    battle.effect.removeChild(projectile);
                }),
            );
    
            this.movies.push(movieClip);
            movieClip.playAndStop();
        } else if (this.currentFrame === this._delay.doneAttack) {
            this.damage = Math.round((1 - this.target.stat.defense) * this.damage);

            battle.effect.addEffect(this.target, { name: 'explosion', animationLength: 16, removeFrame: 60, speed: 0.5 });
            battle.effect.addDamageEffect(this.target, this.damage, "#ffffff");
            this.target.onDamage(this.damage);

            this.currentFrame = 0;
            this.currentDelay = Math.round(60 + this._delay.afterAttack * Math.random());
            this.status = SKILL_STATUS.IDLE;

            return null;
        }
        this.currentFrame++;
        
        return this;
    }
}

// 화살을 던지는 SKILL
export class ArrowShotingSkill extends BaseSkill {
    constructor() {
        super();
        this._delay = {
            beforeAttack: 50,
            doneAttack: 85,
            afterAttack: 100
        };

        // JSON을 받아서 각각의 정보를 넣는다. (지금은 하드코딩)
        this.damage = 130 + Math.round(Math.random()*30);
    }

    init(battle) {
        this.currentFrame = 0;
        this.status = SKILL_STATUS.WAIT;
        this.damage = 130 + Math.round(Math.random()*30);
        
        // 스킬의 사용자를 비교하여, 적군파티, 아군파티를 셋팅한다.
        let proponents = battle.playerParty;
        let opponents = battle.enemyParty;
        if (opponents.isParty(this.proponent)) {
            [proponents, opponents] = [opponents, proponents];
        }
        this.target = this.getTarget(opponents, proponents, TARGETING_TYPE.ENEMY_BACK_CARRY);

        const movieClip = new MovieClip(
            MovieClip.Timeline(11, 25, null, () => {
                this.proponent.setAnimation('attack_' + getDirectionName(this.proponent.currentDir));
                this.proponent.anim.loop = false;
            }),
            MovieClip.Timeline(63, 65, null, () => {
                this.proponent.setAnimation('idle_' + getDirectionName(this.proponent.currentDir));
                this.proponent.anim.loop = true;
            }),
            MovieClip.Timeline(78, 78, null, () => {
            }),
        );

        this.movies.push(movieClip);
        movieClip.playAndStop();
    }

    action(battle) {
        if (this.proponent.stat.hp<= 0) {
            return null;
        }

        this.updateMovieclips();
        this.status = SKILL_STATUS.ACTION;

        if (this.currentFrame === this._delay.beforeAttack) {
            // 투사체 설정 음.. 방향이 맞는지 모르겠다..
            const projectile = new PIXI.Sprite(PIXI.Texture.fromFrame("arrow.png"));
            projectile.anchor.x = 0.5;
            projectile.anchor.y = 0.5;
            projectile.position.x = this.proponent.position.x + this.proponent.width / 2;
            projectile.position.y = this.proponent.position.y - this.proponent.height / 2;
            projectile.alpha = 0;
            projectile.blendMode = PIXI.BLEND_MODES.ADD;
            battle.effect.addChild(projectile);

            const totalFrame = this._delay.doneAttack - this.currentFrame;
            let vecY = -6;
            const gravity = -2 * vecY / (totalFrame + 1);
            const sx = ((this.target.position.x + this.target.width / 2) - projectile.position.x) / totalFrame;
            let sy = ((this.target.position.y - this.target.height / 2) - projectile.position.y) / totalFrame + vecY;

            const movieClip = new MovieClip(
                MovieClip.Timeline(1, this._delay.doneAttack - this.currentFrame - 10, projectile, [["alpha", 0, 1, "outCubic"]]),
                MovieClip.Timeline(1, this._delay.doneAttack - this.currentFrame, null, () => {
                    sy += gravity;
                    projectile.position.x += sx;
                    projectile.position.y += sy;
                    projectile.rotation = Math.atan2(sy, sx);
                }),
                // MovieClip.Timeline(this._delay.doneAttack - this.currentFrame - 5, this._delay.doneAttack - this.currentFrame, projectile, [["alpha", 1, 0, "outCubic"]]),
                MovieClip.Timeline(this._delay.doneAttack - this.currentFrame, this._delay.doneAttack - this.currentFrame + 1, null, () => {
                    battle.effect.removeChild(projectile);
                }),
            );
    
            this.movies.push(movieClip);
            movieClip.playAndStop();
        } else if (this.currentFrame === this._delay.doneAttack) {
            this.damage = Math.round((1 - this.target.stat.defense) * this.damage);

            battle.effect.addEffect(this.target, { name: 'shoted', animationLength: 18, removeFrame: 60, speed: 0.5 });
            battle.effect.addDamageEffect(this.target, this.damage, "#ffffff");
            battle.effect.flashScreen(0.2, 0.1);
            battle.stage.vibrationStage(8, 12);
            this.target.onDamage(this.damage);
            
            // 임시로 독화살 구현
            // this.target.statusManager.addConditionError(new Poison({ retensionTime: 300 }), true, false);

            this.currentFrame = 0;
            this.currentDelay = Math.round(60 + this._delay.afterAttack * Math.random());
            this.status = SKILL_STATUS.IDLE;

            return null;
        }
        this.currentFrame++;
        
        return this;
    }
}

// 화살을 던지는 SKILL
export class ArrowHighShotingSkill extends BaseSkill {
    constructor() {
        super();
        this._delay = {
            beforeAttack: 50,
            doneAttack: 130,
            afterAttack: 100
        };

        // JSON을 받아서 각각의 정보를 넣는다. (지금은 하드코딩)
        this.damage = 180 + Math.round(Math.random()*30);
    }

    init(battle) {
        this.currentFrame = 0;
        this.status = SKILL_STATUS.WAIT;
        this.damage = 180 + Math.round(Math.random()*30);
        
        // 스킬의 사용자를 비교하여, 적군파티, 아군파티를 셋팅한다.
        let proponents = battle.playerParty;
        let opponents = battle.enemyParty;
        if (opponents.isParty(this.proponent)) {
            [proponents, opponents] = [opponents, proponents];
        }
        this.target = this.getTarget(opponents, proponents, TARGETING_TYPE.ENEMY_MIN_HP);

        const movieClip = new MovieClip(
            MovieClip.Timeline(11, 25, null, () => {
                this.proponent.setAnimation('attack_' + getDirectionName(this.proponent.currentDir));
                this.proponent.anim.loop = false;
            }),
            MovieClip.Timeline(63, 65, null, () => {
                this.proponent.setAnimation('idle_' + getDirectionName(this.proponent.currentDir));
                this.proponent.anim.loop = true;
            }),
            MovieClip.Timeline(78, 78, null, () => {
            }),
        );

        this.movies.push(movieClip);
        movieClip.playAndStop();
    }

    action(battle) {
        if (this.proponent.stat.hp<= 0) {
            return null;
        }

        this.updateMovieclips();
        this.status = SKILL_STATUS.ACTION;

        if (this.currentFrame === this._delay.beforeAttack) {
            // 투사체 설정 음.. 방향이 맞는지 모르겠다..
            const direnction = getDirectionName(this.proponent.currentDir) === 'sw' ? -1 : 1;
            const effect = battle.effect.addEffect(this.proponent, { name: 'shotingeffect', animationLength: 5, removeFrame: 60, speed: 0.2, flipX: direnction === 1, rotation: -30 });

            if (direnction === 1) {
                effect.position.x -= 2;
                effect.position.y -= 12;
            } else {
                effect.position.x -= 5;
                effect.position.y += 22;
            }

            const projectile = new PIXI.Sprite(PIXI.Texture.fromFrame("arrow.png"));
            projectile.anchor.x = 0.5;
            projectile.anchor.y = 0.5;
            projectile.position.x = this.proponent.position.x + this.proponent.width / 2;
            projectile.position.y = this.proponent.position.y - this.proponent.height / 2;
            projectile.alpha = 0;
            projectile.blendMode = PIXI.BLEND_MODES.ADD;
            battle.effect.addChild(projectile);

            const totalFrame = this._delay.doneAttack - this.currentFrame;
            let vecY = -15;
            const gravity = -2 * vecY / (totalFrame + 1);
            const sx = ((this.target.position.x + this.target.width / 2) - projectile.position.x) / totalFrame;
            let sy = ((this.target.position.y - this.target.height / 2) - projectile.position.y) / totalFrame + vecY;

            const movieClip = new MovieClip(
                MovieClip.Timeline(1, 10, projectile, [["alpha", 0, 1, "outCubic"]]),
                MovieClip.Timeline(1, this._delay.doneAttack - this.currentFrame, null, () => {
                    sy += gravity;
                    projectile.position.x += sx;
                    projectile.position.y += sy;
                    projectile.rotation = Math.atan2(sy, sx);
                }),
                // MovieClip.Timeline(this._delay.doneAttack - this.currentFrame - 5, this._delay.doneAttack - this.currentFrame, projectile, [["alpha", 1, 0, "outCubic"]]),
                MovieClip.Timeline(this._delay.doneAttack - this.currentFrame, this._delay.doneAttack - this.currentFrame + 1, null, () => {
                    battle.effect.removeChild(projectile);
                }),
            );
    
            this.movies.push(movieClip);
            movieClip.playAndStop();
        } else if (this.currentFrame === this._delay.doneAttack) {
            this.damage = Math.round((1 - this.target.stat.defense) * this.damage);

            battle.effect.addEffect(this.target, { name: 'shoted', animationLength: 18, removeFrame: 60, speed: 0.5 });
            battle.effect.addDamageEffect(this.target, this.damage, "#ffffff");
            battle.effect.flashScreen(0.2, 0.1);
            battle.stage.vibrationStage(8, 12);
            this.target.onDamage(this.damage);
            
            // 임시로 독화살 구현
            // this.target.statusManager.addConditionError(new Poison({ retensionTime: 300 }), true, false);

            this.currentFrame = 0;
            this.currentDelay = Math.round(60 + this._delay.afterAttack * Math.random());
            this.status = SKILL_STATUS.IDLE;

            return null;
        }
        this.currentFrame++;
        
        return this;
    }
}

export class FireRainSkill extends BaseSkill {
    constructor() {
        super();
        this._delay = {
            beforeAttack: 50,
            doneAttack: 252,
            afterAttack: 100
        };
    }

    init(battle) {
        this.currentFrame = 0;
        this.status = SKILL_STATUS.WAIT;
        this.damage = 50 + Math.round(Math.random()*30);
        
        // 스킬의 사용자를 비교하여, 적군파티, 아군파티를 셋팅한다.
        let proponents = battle.playerParty;
        let opponents = battle.enemyParty;
        if (opponents.isParty(this.proponent)) {
            [proponents, opponents] = [opponents, proponents];
        }
        this.targets = this.getTargets(opponents, proponents, TARGETING_TYPE.ENEMY_ALL);
        
        // Proponent 의 움직임, 애니메이션처리.
        const start = { x: this.proponent.x, y: this.proponent.y };
        const vector = this.proponent.currentDir === DIRECTIONS.SW? -1 : 1;
        const to = { x: this.proponent.x + 16 * vector, y: this.proponent.y - 8 * vector };

        const movieClip = new MovieClip(
            MovieClip.Timeline(1, 10, this.proponent, [
                ["x", start.x, to.x, "outCubic"],
                ["y", start.y, to.y, "outCubic"]
            ]),
            MovieClip.Timeline(11, 25, null, () => {
                this.proponent.setAnimation('attack_' + getDirectionName(this.proponent.currentDir));
                this.proponent.anim.loop = false;
            }),
            MovieClip.Timeline(50, 50, null, () => {
                battle.effect.addEffect(this.proponent, { name: 'firerainprop', animationLength: 7, removeFrame: 30, speed: 0.5 });
            }),
            MovieClip.Timeline(55, 55, null, () => {

                this.targets.forEach((target) => {
                    const startTime = Math.round(Math.random() * 40);
                    const endTime = startTime + Math.round(Math.random() * 40) + 40;

                    const projectile = new PIXI.Sprite(PIXI.Texture.fromFrame("fireBall.png"));
                    projectile.anchor.x = 0.5;
                    projectile.anchor.y = 0.5;
                    projectile.position.x = target.position.x + Math.round(Math.random() * 150) - Math.round(Math.random() * 150);
                    projectile.position.y = target.position.y - 350;
                    projectile.alpha = 1;
                    projectile.blendMode = PIXI.BLEND_MODES.ADD;
                    projectile.rotation = Math.atan2((target.y - target.height / 2) - (projectile.y - projectile.height / 2), (target.x - target.width / 2) - (projectile.x - projectile.width / 2));
                    battle.effect.addChild(projectile);

                    const fireRainMovie = new MovieClip(
                        MovieClip.Timeline(startTime, endTime, projectile, [["x", projectile.position.x, target.position.x + target.width / 2, "inCubic"]]),
                        MovieClip.Timeline(startTime, endTime, projectile, [["y", projectile.position.y, target.position.y - target.height / 2, "inCubic"]]),
                        MovieClip.Timeline(endTime + 1, endTime + 1, null, () => {
                            this.damage = 50 + Math.round(Math.random()*30);
                            this.damage = Math.round((1 - target.stat.defense) * this.damage);
                
                            battle.effect.addEffect(target, { name: 'explosion', animationLength: 16, removeFrame: 60, speed: 0.5 });
                            battle.effect.addDamageEffect(target, this.damage, "#ffffff");
                            target.onDamage(this.damage);

                            battle.effect.removeChild(projectile);
                        }),
                    );
    
                    this.movies.push(fireRainMovie);
                    fireRainMovie.playAndStop();
                });

            }),
            MovieClip.Timeline(78, 80, null, () => {
                this.proponent.setAnimation('idle_' + getDirectionName(this.proponent.currentDir));
                this.proponent.anim.loop = true;
            }),
            MovieClip.Timeline(81, 90, this.proponent, [
                ["x", to.x, start.x, "outCubic"],
                ["y", to.y, start.y, "outCubic"]
            ]),
            MovieClip.Timeline(91, 91, null, () => {
            }),
        );

        this.movies.push(movieClip);
        movieClip.playAndStop();
    }

    action(battle) {
        if (this.proponent.stat.hp<= 0 || !this.proponent.statusManager.canAction()) {
            return null;
        }

        this.updateMovieclips();
        this.status = SKILL_STATUS.ACTION;

        if (this.currentFrame === this._delay.beforeAttack) {
        } else if (this.currentFrame === this._delay.doneAttack) {
            this.currentFrame = 0;
            // 임시로 후딜을 랜덤으로 주어 공격 순서가 뒤죽박죽이 되게 만들어 본다.
            this.currentDelay = Math.round(60 + this._delay.afterAttack * Math.random());
            this.status = SKILL_STATUS.IDLE;

            return null;
        }
        this.currentFrame++;
        
        return this;
    }
}

export class HealSkill extends BaseSkill {
    constructor() {
        super();
        this._delay = {
            beforeAttack: 50,
            doneAttack: 92,
            afterAttack: 100
        };
    }

    init(battle) {
        this.currentFrame = 0;
        this.status = SKILL_STATUS.WAIT;
        this.damage = 80 + Math.round(Math.random()*15);
        
        // 스킬의 사용자를 비교하여, 적군파티, 아군파티를 셋팅한다.
        let proponents = battle.playerParty;
        let opponents = battle.enemyParty;
        if (opponents.isParty(this.proponent)) {
            [proponents, opponents] = [opponents, proponents];
        }
        this.targets = this.getTargets(opponents, proponents, TARGETING_TYPE.ALLY_ALL);
        
        // Proponent 의 움직임, 애니메이션처리.
        const start = { x: this.proponent.x, y: this.proponent.y };
        const vector = this.proponent.currentDir === DIRECTIONS.SW? -1 : 1;
        const to = { x: this.proponent.x + 16 * vector, y: this.proponent.y - 8 * vector };

        const movieClip = new MovieClip(
            MovieClip.Timeline(1, 10, this.proponent, [
                ["x", start.x, to.x, "outCubic"],
                ["y", start.y, to.y, "outCubic"]
            ]),
            MovieClip.Timeline(11, 25, null, () => {
                this.proponent.setAnimation('magic_' + getDirectionName(this.proponent.currentDir));
                this.proponent.anim.loop = false;
            }),
            MovieClip.Timeline(78, 80, null, () => {
                this.proponent.setAnimation('idle_' + getDirectionName(this.proponent.currentDir));
                this.proponent.anim.loop = true;
            }),
            MovieClip.Timeline(81, 90, this.proponent, [
                ["x", to.x, start.x, "outCubic"],
                ["y", to.y, start.y, "outCubic"]
            ]),
            MovieClip.Timeline(91, 91, null, () => {
            }),
        );

        this.movies.push(movieClip);
        movieClip.playAndStop();
    }

    action(battle) {
        if (this.proponent.stat.hp<= 0 || !this.proponent.statusManager.canAction()) {
            return null;
        }

        this.updateMovieclips();
        this.status = SKILL_STATUS.ACTION;

        if (this.currentFrame === this._delay.beforeAttack) {
            this.targets.forEach((target) => {
                // 이펙트 추가한다.
                if (target.stat.hp + 30 <= target.stat.maxHp && target.stat.hp > 0) {
                    target.stat.hp += 30;
                    battle.effect.addEffect(target, { name: 'healeffect', animationLength: 25, removeFrame: 120, speed: 0.5 });
                } else if (target.stat.hp > 0) {
                    target.stat.hp = target.stat.maxHp;
                    battle.effect.addEffect(target, { name: 'healeffect', animationLength: 25, removeFrame: 120, speed: 0.5 });
                }
                target.refreshProgressBar();
            });
        } else if (this.currentFrame === this._delay.doneAttack) {
            this.currentFrame = 0;
            // 임시로 후딜을 랜덤으로 주어 공격 순서가 뒤죽박죽이 되게 만들어 본다.
            this.currentDelay = Math.round(60 + this._delay.afterAttack * Math.random());
            this.status = SKILL_STATUS.IDLE;

            return null;
        }
        this.currentFrame++;
        
        return this;
    }
}

class Shield {
    constructor(container, proponent) {
        // 투사체 설정 음.. 방향이 맞는지 모르겠다..
        this.proponent = proponent;
        this.container = container;
        this.shieldEffect = new PIXI.Sprite(PIXI.Texture.fromFrame("shield.png"));
        this.shieldEffect.position.x = proponent.position.x - this.shieldEffect.width / 2 + 14;
        this.shieldEffect.position.y = proponent.position.y - this.shieldEffect.height / 2 - 24;
        this.shieldEffect.blendMode = PIXI.BLEND_MODES.ADD;
        this.shieldEffect.alpha = 0.4;
        this.container.addChild(this.shieldEffect);

        this.alphaFlag = false;
    }

    update() {
        if (this.proponent.stat.hp <= 0) {
            this.removeSelf();
        }

        if (this.alphaFlag) {
            if (this.shieldEffect.alpha < 0.39) {
                this.shieldEffect.alpha += 0.01;
            } else {
                this.shieldEffect.alpha = 0.4;
                this.alphaFlag = !this.alphaFlag;
            }
        } else {
            if (this.shieldEffect.alpha > 0.11) {
                this.shieldEffect.alpha -= 0.01;
            } else {
                this.shieldEffect.alpha = 0.1;
                this.alphaFlag = !this.alphaFlag;
            }
        }
        this.shieldEffect.position.x = this.proponent.position.x - this.shieldEffect.width / 2 + 14;
        this.shieldEffect.position.y = this.proponent.position.y - this.shieldEffect.height / 2 - 24;
    }

    removeSelf() {
        this.container.removeChild(this.shieldEffect);
    }
}