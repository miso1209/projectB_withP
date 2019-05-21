import MovieClip from './movieclip';
import {DIRECTIONS} from './define';
import { SKILL_STATUS, ACTIVE_TYPE, TARGETING_TYPE, EFFECT_TYPE } from './battledeclare';
import { getDirectionName, Movies } from './battleutils';

class BaseSkill {
    constructor(character) {
        this.status = SKILL_STATUS.IDLE;
        this.proponent = character;
        this.activeType = ACTIVE_TYPE.PASSIVE;
        this.coolTime = 150;
        this.currentDelay = Math.round(Math.random() * this.coolTime);
        this.targeting = null;
        this.target = null;
        this.movies = new Movies();
        this.result = this;
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

    done(battle) {
        this.result = null;
        this.status = SKILL_STATUS.IDLE;
        if (battle.scene.queue.peak() === this) {
            battle.scene.queue.dequeue();
            this.currentDelay = this.coolTime;
        }
    }

    init(battle, targeting) {
        this.result = this;
        this.status = SKILL_STATUS.ACTION;
        this.currentDelay = this.coolTime;
        this.target = this.getTarget(battle.characters, targeting);
    }


    action(battle) {
        if (this.proponent.character.health <= 0) {
            this.done(battle);
        }

        this.movies.update();

        const skillAction = this.getSkillAction(battle);
        
        if (this.status === SKILL_STATUS.WAIT) {
            this.movies.push(skillAction);
            skillAction.playAndDestroy();
        }

        return this.result;
    }

    getSkillAction(battle) {
        return null;
    }

    getTarget(characters, targeting) {
        let target = null;
        let enemies = [];

        switch(targeting) {
            case TARGETING_TYPE.ENEMY_FRONT_TANK:
                characters.forEach((opponent) => {
                    if (opponent.gridPosition.y < 1 && opponent.character.health > 0 && opponent.camp !== this.proponent.camp) {
                        enemies.push(opponent);
                    }
                });
                break;

            case TARGETING_TYPE.ENEMY_BACK_CARRY:
                characters.forEach((opponent) => {
                    if (opponent.gridPosition.y > 0 && opponent.character.health > 0 && opponent.camp !== this.proponent.camp) {
                        enemies.push(opponent);
                    }
                });
                break;

            case TARGETING_TYPE.ENEMY_MIN_HP:
                characters.forEach((opponent) => {
                    if ((target === null && opponent.character.health > 0 && opponent.camp !== this.proponent.camp) || (target !== null && target.character.health > opponent.character.health && opponent.character.health > 0 && opponent.camp !== this.proponent.camp)) {
                        target = opponent;
                        enemies = [opponent];
                    }
                });
                break;

            case TARGETING_TYPE.ALLY_ALL:
                characters.forEach((opponent) => {
                    if( opponent.character.health > 0 && opponent.camp === this.proponent.camp ) {
                        enemies.push(opponent);
                    }
                });
                break;

            case TARGETING_TYPE.ENEMY_ALL:
                characters.forEach((opponent) => {
                    if( opponent.character.health > 0 && opponent.camp !== this.proponent.camp ) {
                        enemies.push(opponent);
                    }
                });
                break;
        }

        if (enemies.length === 0) {
            characters.forEach((opponent) => {
                if (opponent.character.health > 0 && opponent.camp !== this.proponent.camp) {
                    enemies.push(opponent);
                }
            });
        }

        if (enemies.length > 0 && targeting !== TARGETING_TYPE.ALLY_ALL && targeting !== TARGETING_TYPE.ENEMY_ALL) {
            target = enemies[Math.round((enemies.length-1) * Math.random())];
        } else {
            target = enemies;
        }

        return target;
    }
}

export class RunAwaySkill extends BaseSkill {
    constructor(character) {
        super(character);
    }

    getSkillAction(battle) {
        return new MovieClip(
            MovieClip.Timeline(1, 1, null, () => {
                this.init(battle, TARGETING_TYPE.ENEMY_FRONT_TANK);
            }),
            MovieClip.Timeline(1, 1, null, () => {
                this.proponent.animation.setAnimation('idle_' + getDirectionName(this.proponent.animation.currentDir));
                this.proponent.animation.anim.loop = true;
            }),
            MovieClip.Timeline(31, 61, null, () => {
                this.proponent.alpha -= 0.05;
                this.proponent.position.x += 1;
                this.proponent.position.y -= 0.5;
                this.proponent.animation.setAnimation('walk_' + getDirectionName(this.proponent.animation.currentDir));
                this.proponent.animation.anim.loop = true;
            }),
            MovieClip.Timeline(62, 63, null, () => {
                this.proponent.character.health = 0;
                this.done(battle);
            })
        );
    }
}

export class CrouchSkill extends BaseSkill {
    constructor(character) {
        super(character);
    }

    getSkillAction(battle) {
        return new MovieClip(
            MovieClip.Timeline(1, 1, null, () => {
                this.init(battle, TARGETING_TYPE.ENEMY_FRONT_TANK);
            }),
            MovieClip.Timeline(1, 1, null, () => {
                this.proponent.animation.setAnimation('idle_' + getDirectionName(this.proponent.animation.currentDir));
                this.proponent.animation.anim.loop = true;
            }),
            MovieClip.Timeline(30, 31, null, () => {
                this.proponent.animation.setAnimation('crouch_' + getDirectionName(this.proponent.animation.currentDir));
                this.proponent.animation.anim.loop = true;
            }),
            MovieClip.Timeline(50, 51, null, () => {
                this.done(battle);
            })
        );
    }
}

// MELEE SKILL
export class DoubleMeleeSkill extends BaseSkill {
    constructor(character) {
        super(character);
    }

    getSkillAction(battle) {
        const start = { x: this.proponent.position.x, y: this.proponent.position.y };
        const vector = this.proponent.animation.currentDir === DIRECTIONS.SW? -1 : 1;
        const to = { x: this.proponent.position.x + 16 * vector, y: this.proponent.position.y - 8 * vector };

        return new MovieClip(
            MovieClip.Timeline(1, 1, null, () => {
                this.init(battle, TARGETING_TYPE.ENEMY_FRONT_TANK);
            }),
            MovieClip.Timeline(1, 10, this.proponent, [
                ["x", start.x, to.x, "outCubic"],
                ["y", start.y, to.y, "outCubic"]
            ]),
            MovieClip.Timeline(11, 23, null, () => {
                this.proponent.animation.setAnimation('atk_2_' + getDirectionName(this.proponent.animation.currentDir));
                this.proponent.animation.anim.loop = false;
            }),
            MovieClip.Timeline(50, 50, null, () => {
                this.damage = Math.round(this.proponent.character.attack - this.target.character.armor);
                battle.stage.effecter.addEffect(this.target, { name: 'slash', animationLength: 8, removeFrame: 60, speed: 0.5 });
                battle.stage.effecter.addFontEffect({target: this.target, outputText: '-' + this.damage});
                this.target.onDamage(this.damage);
            }),
            MovieClip.Timeline(63, 64, null, () => {
                this.proponent.animation.setAnimation('atk_' + getDirectionName(this.proponent.animation.currentDir));
                this.proponent.animation.anim.loop = false;
            }),
            MovieClip.Timeline(96, 96, null, () => {
                if (this.target) {
                    this.damage = Math.round(this.proponent.character.attack - this.target.character.armor);
                    battle.stage.effecter.addEffect(this.target, { name: 'slash', animationLength: 8, removeFrame: 60, speed: 0.5 });
                    battle.stage.effecter.addFontEffect({target: this.target, outputText: '-' + this.damage});
                    this.target.onDamage(this.damage);
                }
            }),
            MovieClip.Timeline(125, 126, null, () => {
                this.proponent.animation.setAnimation('idle_' + getDirectionName(this.proponent.animation.currentDir));
                this.proponent.animation.anim.loop = true;
            }),
            MovieClip.Timeline(127, 136, this.proponent, [
                ["x", to.x, start.x, "outCubic"],
                ["y", to.y, start.y, "outCubic"]
            ]),
            MovieClip.Timeline(137, 138, null, () => {
                this.done(battle);
            }),
        );
    }
}

// MELEE SKILL
export class MeleeSkill extends BaseSkill {
    constructor(character) {
        super(character);
    }

    getSkillAction(battle) {
        const start = { x: this.proponent.position.x, y: this.proponent.position.y };
        const vector = this.proponent.animation.currentDir === DIRECTIONS.SW? -1 : 1;
        const to = { x: this.proponent.position.x + 16 * vector, y: this.proponent.position.y - 8 * vector };

        return new MovieClip(
            MovieClip.Timeline(1, 1, null, () => {
                this.init(battle, TARGETING_TYPE.ENEMY_FRONT_TANK);
            }),
            MovieClip.Timeline(1, 10, this.proponent, [
                ["x", start.x, to.x, "outCubic"],
                ["y", start.y, to.y, "outCubic"]
            ]),
            MovieClip.Timeline(11, 25, null, () => {
                this.proponent.animation.setAnimation('atk_' + getDirectionName(this.proponent.animation.currentDir));
                this.proponent.animation.anim.loop = false;
            }),
            MovieClip.Timeline(50, 50, null, () => {
                this.damage = Math.round(this.proponent.character.attack - this.target.character.armor);
                battle.stage.effecter.addEffect(this.target, { name: 'slash', animationLength: 8, removeFrame: 60, speed: 0.5 });
                battle.stage.effecter.addFontEffect({target: this.target, outputText: '-' + this.damage});
                this.target.onDamage(this.damage);
            }),
            MovieClip.Timeline(78, 80, null, () => {
                this.proponent.animation.setAnimation('idle_' + getDirectionName(this.proponent.animation.currentDir));
                this.proponent.animation.anim.loop = true;
            }),
            MovieClip.Timeline(81, 90, this.proponent, [
                ["x", to.x, start.x, "outCubic"],
                ["y", to.y, start.y, "outCubic"]
            ]),
            MovieClip.Timeline(91, 92, null, () => {
                this.done(battle);
            }),
        );
    }
}

// 투사채를 던지는 SKILL
export class ProjectileSkill extends BaseSkill {
    constructor(character) {
        super(character);
    }

    getSkillAction(battle) {
        return new MovieClip(
            MovieClip.Timeline(1, 1, null, () => {
                this.init(battle, TARGETING_TYPE.ENEMY_FRONT_TANK);
            }),
            MovieClip.Timeline(11, 25, null, () => {
                this.proponent.animation.setAnimation('atk_' + getDirectionName(this.proponent.animation.currentDir));
                this.proponent.animation.anim.loop = false;
            }),
            MovieClip.Timeline(50, 50, null, () => {
                const projectile = new PIXI.Sprite(PIXI.Texture.fromFrame("fireBall.png"));
                projectile.anchor.x = 0.5;
                projectile.anchor.y = 0.5;
                projectile.position.x = this.proponent.position.x + this.proponent.width / 2;
                projectile.position.y = this.proponent.position.y - this.proponent.height / 2;
                projectile.alpha = 0;
                projectile.blendMode = PIXI.BLEND_MODES.ADD;
                projectile.rotation = Math.atan2((this.target.y - this.target.animation.height / 2) - (projectile.y - projectile.height / 2), (this.target.x - this.target.animation.width / 2) - (projectile.x - projectile.width / 2));
                battle.stage.effecter.detailEffectContainer.addChild(projectile);
    
                const movieClip = new MovieClip(
                    MovieClip.Timeline(1, 18, projectile, [["alpha", 0, 1, "outCubic"]]),
                    MovieClip.Timeline(1, 28, projectile, [["x", projectile.position.x, this.target.position.x + this.target.animation.width / 2, "outCubic"]]),
                    MovieClip.Timeline(1, 28, projectile, [["y", projectile.position.y, this.target.position.y - this.target.animation.height / 2, "outCubic"]]),
                    MovieClip.Timeline(18, 28, projectile, [["alpha", 1, 0, "outCubic"]]),
                    MovieClip.Timeline(28, 28, null, () => {
                        battle.stage.effecter.detailEffectContainer.removeChild(projectile);
                    }),
                );
        
                this.movies.push(movieClip);
                movieClip.playAndDestroy();
            }),
            MovieClip.Timeline(63, 65, null, () => {
                this.proponent.animation.setAnimation('idle_' + getDirectionName(this.proponent.animation.currentDir));
                this.proponent.animation.anim.loop = true;
            }),
            MovieClip.Timeline(78, 79, null, () => {
                this.damage = Math.round(this.proponent.character.magic - this.target.character.armor);
                battle.stage.effecter.addEffect(this.target, { name: 'explosion', animationLength: 16, removeFrame: 60, speed: 0.5 });
                battle.stage.effecter.addFontEffect({target: this.target, outputText: '-' + this.damage});
                this.target.onDamage(this.damage);

                this.done(battle);
            }),
        );
    }
}

// 화살을 던지는 SKILL
export class ArrowShotingSkill extends BaseSkill {
    constructor(character) {
        super(character);
    }

    getSkillAction(battle) {
        return new MovieClip(
            MovieClip.Timeline(1, 1, null, () => {
                this.init(battle, TARGETING_TYPE.ENEMY_BACK_CARRY);
            }),
            MovieClip.Timeline(11, 25, null, () => {
                this.proponent.animation.setAnimation('atk_' + getDirectionName(this.proponent.animation.currentDir));
                this.proponent.animation.anim.loop = false;
            }),
            MovieClip.Timeline(50, 50, null, () => {
                // 투사체 설정 음.. 방향이 맞는지 모르겠다..
                const projectile = new PIXI.Sprite(PIXI.Texture.fromFrame("arrow.png"));
                projectile.anchor.x = 0.5;
                projectile.anchor.y = 0.5;
                projectile.position.x = this.proponent.position.x + this.proponent.width / 2;
                projectile.position.y = this.proponent.position.y - this.proponent.height / 2;
                projectile.alpha = 0;
                projectile.blendMode = PIXI.BLEND_MODES.ADD;
                battle.stage.effecter.detailEffectContainer.addChild(projectile);
    
                const totalFrame = 35;
                let vecY = -6;
                const gravity = -2 * vecY / (totalFrame + 1);
                const sx = ((this.target.position.x + this.target.animation.width / 2) - projectile.position.x) / totalFrame;
                let sy = ((this.target.position.y - this.target.animation.height / 2) - projectile.position.y) / totalFrame + vecY;
    
                const projectileMovieClip = new MovieClip(
                    MovieClip.Timeline(1, 10, projectile, [["alpha", 0, 1, "outCubic"]]),
                    MovieClip.Timeline(1, totalFrame, null, () => {
                        sy += gravity;
                        projectile.position.x += sx;
                        projectile.position.y += sy;
                        projectile.rotation = Math.atan2(sy, sx);
                    }),
                    MovieClip.Timeline(totalFrame, totalFrame, null, () => {
                        battle.stage.effecter.detailEffectContainer.removeChild(projectile);
                    }),
                );
        
                this.movies.push(projectileMovieClip);
                projectileMovieClip.playAndStop();
            }),
            MovieClip.Timeline(63, 65, null, () => {
                this.proponent.animation.setAnimation('idle_' + getDirectionName(this.proponent.animation.currentDir));
                this.proponent.animation.anim.loop = true;
            }),
            MovieClip.Timeline(85, 86, null, () => {
                this.damage = Math.round(this.proponent.character.attack - this.target.character.armor);
                battle.stage.effecter.addEffect(this.target, { name: 'shoted', animationLength: 18, removeFrame: 60, speed: 0.5 });
                battle.stage.effecter.addFontEffect({target: this.target, outputText: '-' + this.damage});
                this.target.onDamage(this.damage);

                this.done(battle);
            }),
        );
    }
}

// 화살을 던지는 SKILL
export class ArrowHighShotingSkill extends BaseSkill {
    constructor(character) {
        super(character);
    }

    getSkillAction(battle) {
        return new MovieClip(
            MovieClip.Timeline(1, 1, null, () => {
                this.init(battle, TARGETING_TYPE.ENEMY_MIN_HP);
            }),
            MovieClip.Timeline(11, 25, null, () => {
                this.proponent.animation.setAnimation('atk_' + getDirectionName(this.proponent.animation.currentDir));
                this.proponent.animation.anim.loop = false;
            }),
            MovieClip.Timeline(50, 50, null, () => {
                // 투사체 설정 음.. 방향이 맞는지 모르겠다..
                const direnction = getDirectionName(this.proponent.animation.currentDir) === 'sw' ? -1 : 1;
                const effect = battle.stage.effecter.addEffect(this.proponent, { name: 'shotingeffect', animationLength: 5, removeFrame: 60, speed: 0.2, flipX: direnction === 1, rotation: -30 });
    
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
                battle.stage.effecter.detailEffectContainer.addChild(projectile);
    
                const totalFrame = 80;
                let vecY = -15;
                const gravity = -2 * vecY / (totalFrame + 1);
                const sx = ((this.target.position.x + this.target.animation.width / 2) - projectile.position.x) / totalFrame;
                let sy = ((this.target.position.y - this.target.animation.height / 2) - projectile.position.y) / totalFrame + vecY;
    
                const projectileMovieClip = new MovieClip(
                    MovieClip.Timeline(1, 10, projectile, [["alpha", 0, 1, "outCubic"]]),
                    MovieClip.Timeline(1, totalFrame, null, () => {
                        sy += gravity;
                        projectile.position.x += sx;
                        projectile.position.y += sy;
                        projectile.rotation = Math.atan2(sy, sx);
                    }),
                    MovieClip.Timeline(totalFrame, totalFrame, null, () => {
                        battle.stage.effecter.detailEffectContainer.removeChild(projectile);
                    }),
                );
        
                this.movies.push(projectileMovieClip);
                projectileMovieClip.playAndStop();
            }),
            MovieClip.Timeline(63, 65, null, () => {
                this.proponent.animation.setAnimation('idle_' + getDirectionName(this.proponent.animation.currentDir));
                this.proponent.animation.anim.loop = true;
            }),
            MovieClip.Timeline(130, 131, null, () => {
                this.damage = Math.round(this.proponent.character.attack - this.target.character.armor);
                battle.stage.effecter.addEffect(this.target, { name: 'shoted', animationLength: 18, removeFrame: 60, speed: 0.5 });
                battle.stage.effecter.addFontEffect({target: this.target, outputText: '-' + this.damage});
                this.target.onDamage(this.damage);

                this.done(battle);
            }),
        );
    }
}

export class FireRainSkill extends BaseSkill {
    constructor(character) {
        super(character);
    }

    getSkillAction(battle) {
        // Proponent 의 움직임, 애니메이션처리.
        const start = { x: this.proponent.position.x, y: this.proponent.position.y };
        const vector = this.proponent.animation.currentDir === DIRECTIONS.SW? -1 : 1;
        const to = { x: this.proponent.position.x + 16 * vector, y: this.proponent.position.y - 8 * vector };

        return new MovieClip(
            MovieClip.Timeline(1, 1, null, () => {
                this.init(battle, TARGETING_TYPE.ENEMY_ALL);
            }),
            MovieClip.Timeline(1, 10, this.proponent, [
                ["x", start.x, to.x, "outCubic"],
                ["y", start.y, to.y, "outCubic"]
            ]),
            MovieClip.Timeline(11, 25, null, () => {
                this.proponent.animation.setAnimation('atk_' + getDirectionName(this.proponent.animation.currentDir));
                this.proponent.animation.anim.loop = false;
            }),
            MovieClip.Timeline(50, 50, null, () => {
                battle.stage.effecter.addEffect(this.proponent, { name: 'firerainprop', animationLength: 7, removeFrame: 30, speed: 0.5 });
            }),
            MovieClip.Timeline(55, 55, null, () => {
                this.target.forEach((target) => {
                    const startTime = Math.round(Math.random() * 40);
                    const endTime = startTime + Math.round(Math.random() * 40) + 40;

                    const projectile = new PIXI.Sprite(PIXI.Texture.fromFrame("fireBall.png"));
                    projectile.anchor.x = 0.5;
                    projectile.anchor.y = 0.5;
                    projectile.position.x = target.position.x + Math.round(Math.random() * 150) - Math.round(Math.random() * 150);
                    projectile.position.y = target.position.y - 350;
                    projectile.alpha = 1;
                    projectile.blendMode = PIXI.BLEND_MODES.ADD;
                    projectile.rotation = Math.atan2((target.y - target.animation.height / 2) - (projectile.y - projectile.height / 2), (target.x - target.animation.width / 2) - (projectile.x - projectile.width / 2));
                    battle.stage.effecter.detailEffectContainer.addChild(projectile);

                    const fireRainMovie = new MovieClip(
                        MovieClip.Timeline(startTime, endTime, projectile, [["x", projectile.position.x, target.position.x + target.animation.width / 2, "inCubic"]]),
                        MovieClip.Timeline(startTime, endTime, projectile, [["y", projectile.position.y, target.position.y - target.animation.height / 2, "inCubic"]]),
                        MovieClip.Timeline(endTime + 1, endTime + 1, null, () => {
                            this.damage = Math.round(this.proponent.character.magic - target.character.armor);
                
                            battle.stage.effecter.addEffect(target, { name: 'explosion', animationLength: 16, removeFrame: 60, speed: 0.5 });
                            battle.stage.effecter.addFontEffect({target: target, outputText: '-' + this.damage});
                            target.onDamage(this.damage);

                            battle.stage.effecter.detailEffectContainer.removeChild(projectile);
                        }),
                    );
    
                    this.movies.push(fireRainMovie);
                    fireRainMovie.playAndStop();
                });

            }),
            MovieClip.Timeline(78, 80, null, () => {
                this.proponent.animation.setAnimation('idle_' + getDirectionName(this.proponent.animation.currentDir));
                this.proponent.animation.anim.loop = true;
            }),
            MovieClip.Timeline(81, 90, this.proponent, [
                ["x", to.x, start.x, "outCubic"],
                ["y", to.y, start.y, "outCubic"]
            ]),
            MovieClip.Timeline(230, 231, null, () => {
                this.done(battle);
            }),
        );
    }
}

export class HealSkill extends BaseSkill {
    constructor(character) {
        super(character);
    }

    getSkillAction(battle) {
        const start = { x: this.proponent.position.x, y: this.proponent.position.y };
        const vector = this.proponent.animation.currentDir === DIRECTIONS.SW? -1 : 1;
        const to = { x: this.proponent.position.x + 16 * vector, y: this.proponent.position.y - 8 * vector };

        return new MovieClip(
            MovieClip.Timeline(1, 1, null, () => {
                this.init(battle, TARGETING_TYPE.ALLY_ALL);
            }),
            MovieClip.Timeline(1, 10, this.proponent, [
                ["x", start.x, to.x, "outCubic"],
                ["y", start.y, to.y, "outCubic"]
            ]),
            MovieClip.Timeline(11, 25, null, () => {
                this.proponent.animation.setAnimation('magic_' + getDirectionName(this.proponent.animation.currentDir));
                this.proponent.animation.anim.loop = false;
            }),
            MovieClip.Timeline(50, 50, null, () => {
                this.target.forEach((target) => {
                    // 이펙트 추가한다.
                    if (target.character.health + 30 <= target.character.maxHealth && target.character.health > 0) {
                        target.character.health += 30;
                        battle.stage.effecter.addEffect(target, { name: 'healeffect', animationLength: 25, removeFrame: 120, speed: 0.5 });
                    } else if (target.character.health > 0) {
                        target.character.health = target.character.maxHealth;
                        battle.stage.effecter.addEffect(target, { name: 'healeffect', animationLength: 25, removeFrame: 120, speed: 0.5 });
                    }
    
                    const hpWidth = (target.health< 0 ? 0 : target.health) / target.maxHealth * 34;
                    target.progressBar.setWidth(hpWidth);
                });
            }),
            MovieClip.Timeline(78, 80, null, () => {
                this.proponent.animation.setAnimation('idle_' + getDirectionName(this.proponent.animation.currentDir));
                this.proponent.animation.anim.loop = true;
            }),
            MovieClip.Timeline(81, 90, this.proponent, [
                ["x", to.x, start.x, "outCubic"],
                ["y", to.y, start.y, "outCubic"]
            ]),
            MovieClip.Timeline(91, 92, null, () => {
                this.done(battle);
            }),
        );
    }
}