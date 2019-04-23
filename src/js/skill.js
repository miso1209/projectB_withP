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

const SKILL_STATUS = {
    IDLE: 1,
    WAIT: 2,
    ACTION: 3
}

export default class Skill {
    constructor() {
        this.status = SKILL_STATUS.IDLE;

        // JSON을 받아서 각각의 정보를 넣는다. (지금은 하드코딩)
        this.damage = 20 + Math.round(Math.random()*30);

        // beforeAttack : Attack 전까지의 frame, doneAttack : Attack 액션이 모두 수행될때 까지의 frame, afterAttack 다음 공격까지의 delay frame
        this._delay = {
            beforeAttack: 50,
            doneAttack: 78,
            afterAttack: 100
        };

        // 현재 남아있는 후딜을 계산하기 위함..
        this.currentDelay = this._delay.afterAttack * Math.random();

        // 타겟팅 만들어야 한다..
        this.targeting = null;
        this.movie = null;
    }

    // 스킬의 사용자를 셋한다.
    setProponent(proponent) {
        this.proponent = proponent;
    }

    isReady() {
        return (this.currentDelay <= 0 && this.status === SKILL_STATUS.IDLE);
    }

    // 스킬 사용 전 ( 큐 삽입할때 호출되어 WAIT 상태로 초기화 한다. )
    init() {
        this.currentFrame = 0;
        this.status = SKILL_STATUS.WAIT;
        
        const start = { x: this.proponent.x, y: this.proponent.y };
        const vector = this.proponent.currentDir === DIRECTIONS.SW? -1 : 1;
        const to = { x: this.proponent.x + 32 * vector, y: this.proponent.y - 16 * vector };

        // Proponent 의 동작처리.
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

        this.movie = movieClip;
        movieClip.playAndStop();
    }

    action(battle) {
        this.movie.update();
        this.status = SKILL_STATUS.ACTION;
        
        // 스킬의 사용자를 비교하여, 적군파티, 아군파티를 셋팅한다.
        let proponents = battle.players;
        let opponents = battle.enemies;
        if (proponents.indexOf(this.proponent) < 0) {
            [proponents, opponents] = [opponents, proponents];
        }

        if (this.currentFrame === this._delay.beforeAttack) {
            const target = this.getTarget(opponents);
            if (target) {
                battle.battleEffect.addDamageEffect(target, this.damage, "#ffffff");
                target.onDamage(this.damage);
            }
        } else if (this.currentFrame === this._delay.doneAttack) {
            this.currentFrame = 0;
            // 임시로 공격 후 딜레이를 랜덤으로 주어 공격 순서가 뒤죽박죽이 되게 만들어 본다.
            this.currentDelay = this._delay.afterAttack * Math.random();
            this.status = SKILL_STATUS.IDLE;

            return null;
        }
        this.currentFrame++;
        
        return this;
    }

    delay() {
        this.currentDelay--;
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
}