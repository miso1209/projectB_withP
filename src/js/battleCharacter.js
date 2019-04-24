import { DIRECTIONS } from './define';
import MovieClip from './movieclip';
import { MeleeSkill, ProjectileSkill, ArrowShotingSkill } from './skill';
import Tweens from './tweens';

function loadAniTexture(name, count) {
    const frames = [];  
    for (let i = 0; i < count; i++) {
        frames.push(PIXI.Texture.fromFrame(name + i + '.png'));
    }
    return frames;
}

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

const SKILL_STATUS = {
    IDLE: 1,
    WAIT: 2,
    ACTION: 3
}

const STATUS = {
    IDLE: 1,
    ATTACK: 2,
    DIE: 3,
    WAIT: 4,
    BE_ATTACKED: 5
}

export default class BattleCharacter extends PIXI.Container {
    constructor(spec) {
        super();
        this.container = new PIXI.Container();
        this.tweens = new Tweens();
        this.movies = [];

        this.status = STATUS.IDLE;

        if (spec.name == 'Elid') {
            this.skillA = new ProjectileSkill();
        } else if (spec.name == 'Miluda') {
            this.skillA = new ArrowShotingSkill();
        } else {
            this.skillA = new MeleeSkill();
        }
        this.skillA.setProponent(this);

        const shadow = new PIXI.Sprite(PIXI.Texture.fromFrame("shadow.png"));
        shadow.position.y = -shadow.height;
        this.container.addChild(shadow);

        this.loadSpec(spec);
        this.makeProgressBar();
        this.addChild(this.container);
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

        for(let key in spec.stat) {
            this[key] = spec.stat[key];
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
        this.movieClipsUpdate();
        this.tweens.update();
        // 캐릭터가 사망하였거나, 전투가 끝났을 경우 로직을 돌리지 않는다.
        if (this.status === STATUS.DIE || battle.isBattleEnd()) {
            return;
        }

        if (this.skillA.isReady()) {
            this.skillA.setWait();
            battle.basicQueue.enqueue(this.skillA);
        } else if (this.skillA.status === SKILL_STATUS.IDLE && battle.currentAction === null) {
            this.skillA.delay();
        }
    }

    movieClipsUpdate() {
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
        this.hp -= damage;
        const hpWidth = (this.hp < 0 ? 0 : this.hp) / this.maxHp * 34;

        this.tweens.addTween(this.hpBar, 0.5, { width: hpWidth }, 0, "easeInOut", true);
        this.softBackingTint(0xFF0000);
        this.vibration(6);

        this.checkDie();
    }

    softBackingTint (tint) {
        const startTint = tint? tint: 0xFFFFFF;
        let [sR, sG, sB] = [(startTint & 0xFF0000) >>> 16, (startTint & 0x00FF00) >>> 8, startTint & 0x0000FF];
        const [addR, addG, addB] = [(255 - sR) / 45, (255 - sG) / 45, (255 - sB) / 45];
        this.anim.tint = Math.round(sR) << 16 | Math.round(sG) << 8 | Math.round(sB);

        const movieClip = new MovieClip(
            MovieClip.Timeline(1, 45, null, () => {
                sR += addR;
                sG += addG;
                sB += addB;
                this.anim.tint = (Math.round(sR) << 16 | Math.round(sG) << 8 | Math.round(sB));
            }),
            MovieClip.Timeline(46, 46, null, () => {
                this.anim.tint = 0xFFFFFF;
            })
        );

        this.movies.push(movieClip);
        movieClip.playAndStop();
    }

    // 캐릭터 anim의 position 건드리는데.. anim x 건드리는 애랑 같이 사용할 경우 문제될 수 있다.
    vibration(scale) {
        const x = this.anim.position.x;
        const y = this.anim.position.y;
        let vibrationScale = scale;

        const movieClip = new MovieClip(
            MovieClip.Timeline(1, 12, null, () => {
                this.anim.position.x = x + vibrationScale;
                this.anim.position.y = y + vibrationScale;
                vibrationScale = vibrationScale / 6 * -5;
            }),
            MovieClip.Timeline(13, 13, null, () => {
                this.anim.position.x = x;
                this.anim.position.y = y;
            })
        );

        this.movies.push(movieClip);
        movieClip.playAndStop();
    }

    checkDie() {
        if (this.hp <= 0) {
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