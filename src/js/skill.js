import MovieClip from './movieclip';
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
        this.currentDelay = this._delay.afterAttack * Math.random();

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
    getTarget(opponents) {
        let target = null;
        let enemies = [];
        
        opponents.forEach((opponent) => {
            if (target === null && opponent.hp > 0) {
                enemies.push(opponent);
            }
        });

        if (enemies.length > 0) {
            target = enemies[Math.round((enemies.length-1) * Math.random())];
        }

        return target;
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

// MELEE SKILL
export class MeleeSkill extends BaseSkill {
    constructor() {
        super();
    }

    init(battle) {
        this.currentFrame = 0;
        this.status = SKILL_STATUS.WAIT;
        this.damage = 80 + Math.round(Math.random()*30);
        
        // 스킬의 사용자를 비교하여, 적군파티, 아군파티를 셋팅한다.
        let proponents = battle.players;
        let opponents = battle.enemies;
        if (proponents.indexOf(this.proponent) < 0) {
            [proponents, opponents] = [opponents, proponents];
        }
        this.target = this.getTarget(opponents);
        
        // Proponent 의 움직임, 애니메이션처리.
        const start = { x: this.proponent.x, y: this.proponent.y };
        const vector = this.proponent.currentDir === DIRECTIONS.SW? -1 : 1;
        const to = { x: this.proponent.x + 32 * vector, y: this.proponent.y - 16 * vector };

        const movieClip = new MovieClip(
            MovieClip.Timeline(1, 10, this.proponent, [
                ["x", start.x, to.x, "outCubic"],
                ["y", start.y, to.y, "outCubic"]
            ]),
            MovieClip.Timeline(11, 25, null, () => {
                this.proponent.setAnimation('attack_' + getDirectionName(this.proponent.currentDir));
                this.proponent.anim.loop = false;
            }),
            MovieClip.Timeline(63, 65, null, () => {
                this.proponent.setAnimation('idle_' + getDirectionName(this.proponent.currentDir));
                this.proponent.anim.loop = true;
            }),
            MovieClip.Timeline(68, 77, this.proponent, [
                ["x", to.x, start.x, "outCubic"],
                ["y", to.y, start.y, "outCubic"]
            ]),
            MovieClip.Timeline(78, 78, null, () => {
            }),
        );

        this.movies.push(movieClip);
        movieClip.playAndStop();
    }

    action(battle) {
        if (this.proponent.hp <= 0) {
            return null;
        }

        this.updateMovieclips();
        this.status = SKILL_STATUS.ACTION;

        if (this.currentFrame === this._delay.beforeAttack) {
            battle.effect.addEffect(this.target, { name: 'slash', animationLength: 8, removeFrame: 60, speed: 0.5 });
            battle.effect.addDamageEffect(this.target, this.damage, "#ffffff");
            this.target.onDamage(this.damage);
        } else if (this.currentFrame === this._delay.doneAttack) {
            this.currentFrame = 0;
            // 임시로 후딜을 랜덤으로 주어 공격 순서가 뒤죽박죽이 되게 만들어 본다.
            this.currentDelay = this._delay.afterAttack * Math.random();
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
        this.damage = 80 + Math.round(Math.random()*30);
    }

    init(battle) {
        this.currentFrame = 0;
        this.status = SKILL_STATUS.WAIT;
        this.damage = 80 + Math.round(Math.random()*30);
        
        // 스킬의 사용자를 비교하여, 적군파티, 아군파티를 셋팅한다.
        let proponents = battle.players;
        let opponents = battle.enemies;
        if (proponents.indexOf(this.proponent) < 0) {
            [proponents, opponents] = [opponents, proponents];
        }
        this.target = this.getTarget(opponents);

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
        if (this.proponent.hp <= 0) {
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
            battle.effect.addEffect(this.target, { name: 'explosion', animationLength: 16, removeFrame: 60, speed: 0.5 });
            battle.effect.addDamageEffect(this.target, this.damage, "#ffffff");
            this.target.onDamage(this.damage);

            this.currentFrame = 0;
            this.currentDelay = this._delay.afterAttack * Math.random();
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
        this.damage = 80 + Math.round(Math.random()*30);
    }

    init(battle) {
        this.currentFrame = 0;
        this.status = SKILL_STATUS.WAIT;
        this.damage = 80 + Math.round(Math.random()*30);
        
        // 스킬의 사용자를 비교하여, 적군파티, 아군파티를 셋팅한다.
        let proponents = battle.players;
        let opponents = battle.enemies;
        if (proponents.indexOf(this.proponent) < 0) {
            [proponents, opponents] = [opponents, proponents];
        }
        this.target = this.getTarget(opponents);

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
        if (this.proponent.hp <= 0) {
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
            battle.effect.addEffect(this.target, { name: 'shoted', animationLength: 18, removeFrame: 60, speed: 0.5 });
            battle.effect.addDamageEffect(this.target, this.damage, "#ffffff");
            battle.effect.flashScreen(0.2, 0.1);
            battle.stage.vibrationStage(8, 12);
            this.target.onDamage(this.damage);

            this.currentFrame = 0;
            this.currentDelay = this._delay.afterAttack * Math.random();
            this.status = SKILL_STATUS.IDLE;

            return null;
        }
        this.currentFrame++;
        
        return this;
    }
}