import { BattleProgressBar } from "./battleui";
import AnimatedCharacter from "./animatedcharacter";
import { EventEmitter } from "events";
import { CHARACTER_CAMP } from "./battledeclare";

const PLAY_LOOP = true;
const PLAY_ONCE = false;

// 캐릭터 로직
export default class BattleCharacter extends EventEmitter{
    constructor(character) {
        super();
        this.character = character;
        this.isGroggy = false;
       
        this.turnAction = new TurnAction();
        this.container = new PIXI.Container();
        this.buffContainer = new PIXI.Container();
        this.animation = new AnimatedCharacter(character.id);

        this.progressBar = new BattleProgressBar();
        this.progressBar.show();
        this.progressBar.tinting('0xff0000');
        this.progressBar.setPosition({
            x: this.animation.width / 2,
            y: -this.animation.height,
        });

        this.container.addChild(this.animation);
        this.container.addChild(this.buffContainer);
        this.container.addChild(this.progressBar);

        this.progressBar.setProgress(this.health / this.maxHealth);
        // 캐릭터의 스피드대로 세팅한다
        this.actionScore = 1 / this.speed;
        this.buffs = {};

        this.coolTime = 0;
        this.maxCoolTime = 1;
        this.isExtraSkillIn = false;
    }

    extraSkillIn() {
        this.coolTime = 1;
        this.maxCoolTime = 1;
        this.isExtraSkillIn = true;
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
        this.animation.update();

        for (const name in this.buffs) {
            const buff = this.buffs[name];
            buff.update();
        }
    }

    nextTurn() {
        if (!this.canFight) {
            return;
        }
        
        if (this.coolTime > 0 && !this.isExtraSkillIn) {
            this.coolTime--;
        }

        // 지금은 적군일 경우 매턴 15% 확률로 스페셜 스킬을 시도한다. => 데이터로 빼야할듯 하다.
        if (Math.random() < 0.15 && this.camp === CHARACTER_CAMP.ENEMY) {
            this.specialSkill();
        }

        this.turnAction.nextTurn();
    }

    specialSkill() {
        this.emit('specialskill');
    }

    clearBuff() {
        for (const name in this.buffs) {
            this.removeBuff(name);
        }
    }

    addBuff(name, duration, buff) {
        if (!this.buffs[name]) {
            this.buffs[name] = buff;
            this.character.applyOption(this.buffs[name].option);
            this.buffContainer.addChild(this.buffs[name]);
        }

        this.turnAction.addAction(name, duration, () => {
            this.removeBuff(name);
        });
        
        this.updateProgressBar();
    }

    removeBuff(name) {
        if (this.buffs[name]) {
            this.buffContainer.removeChild(this.buffs[name]);
            this.character.clearOption(this.buffs[name].option);
            delete this.buffs[name];
        }
    }

    updateProgressBar() {
        const healthRate = this.health / this.maxHealth;
        this.progressBar.setProgress(healthRate);
    }

    onDamage(damage) {
        this.character.health -= damage;
        if (this.character.health < 0) {
            this.character.health = 0;
        }

        this.updateProgressBar();

        this.animation.colorBlink(0xFF0000, 0.75);
        this.animation.vibration(6, 0.5);

        if (this.health <= 0) {
            this.clearBuff();
            this.animation.hide(0.5, false);
            this.progressBar.hide();
        }
    }

    // 현재 Warrior만 들고있는데.. 이런것은 어떻게 처리하지.. 원래 모든 캐릭터가 통일된 animation을 들고 있어야 할듯한데..
    animation_shieldAttack() {
        this.animation.animate('atk_2', PLAY_ONCE);
    }

    // 현재 Hector만 들고있는데.. 이런것은 어떻게 처리하지.. 원래 모든 캐릭터가 통일된 animation을 들고 있어야 할듯한데..
    animation_crouch() {
        this.animation.animate('crouch', PLAY_ONCE);
    }
    
    // 현재 Healer만 들고있는데.. 이런것은 어떻게 처리하지.. 원래 모든 캐릭터가 통일된 animation을 들고 있어야 할듯한데..
    animation_magic() {
        this.animation.animate('magic', PLAY_ONCE);
    }


    animation_attack() {
        this.animation.animate('atk', PLAY_ONCE);
    }

    animation_idle() {
        this.animation.animate('idle', PLAY_LOOP);
    }

    animation_walk() {
        this.animation.animate('walk', PLAY_LOOP);
    }

    get position() {
        return this.container.position;
    }

    get width() {
        return this.animation.width;
    }

    get height() {
        return this.animation.height;
    }

    get alpha() {
        return this.container.alpha;
    }

    set alpha(a) {
        this.container.alpha = a;
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

    get magic() {
        return this.character.magic;
    }

    get armor() {
        return this.character.armor;
    }

    get speed() {
        return this.character.speed;
    }

    get canFight() {
        return this.isAlive && !this.isGroggy;
    }

    get isAlive() {
        return this.character.health > 0;
    }

    get skills() {
        return this.character.skills;
    }

    get displayName() {
        return this.character.displayName;
    }

    get exp() {
        return this.character.exp;
    }

    get maxExp() {
        return this.character.maxexp;
    }
}

class TurnAction {
    constructor() {
        this.actions = {};
    }

    nextTurn() {
        for(const name in this.actions) {
            const action = this.actions[name];

            if (action.duration === 0) {
                action.doneAction();
                delete this.actions[name];
            } else {
                action.duration--;
            }
        }
    }

    addAction(name, duration, doneAction) {
        this.actions[name] = {
            duration,
            doneAction
        };
    }
}