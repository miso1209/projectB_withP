import { BattleProgressBar } from "./battleui";
import AnimatedCharacter from "./animatedcharacter";
import { EventEmitter } from "events";
import { CHARACTER_CAMP } from "./battledeclare";
import ScriptParser from "./scriptparser";

const PLAY_LOOP = true;
const PLAY_ONCE = false;

// 캐릭터 로직
export default class BattleCharacter extends EventEmitter{
    constructor(character) {
        super();
        this.character = character;
        // 전투불능
        this.isGroggy = false;
        // 1 이상 == 공격불능 (중첩 가능해서 숫자로 남김.)
        this.isStuned = 0;
       
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
        
        // 캐릭터의 스킬 쿨타임 감소.
        if (this.coolTime > 0 && !this.isExtraSkillIn) {
            this.coolTime--;
        }

        // 적군일 경우 매턴 캐릭터의 skillActiveProbability 확률로 스페셜 스킬을 시도한다.
        if (Math.random() < this.skillActiveProbability && this.camp === CHARACTER_CAMP.ENEMY) {
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
            this.buffs[name].abilityOptions.forEach((option) => {
                this.character.applyOption(option);
            });
            this.buffs[name].statusOptions.forEach((option) => {
                this.applyStatusOption(option);
            })
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
            this.buffs[name].abilityOptions.forEach((option) => {
                this.character.clearOption(option);
            });
            this.buffs[name].statusOptions.forEach((option) => {
                this.clearStatusOption(option);
            })
            delete this.buffs[name];
        }
    }

    applyStatusOption(option) {
        option = new ScriptParser(option);
        switch(option.name) {
            case "stun":
                this.isStuned += Number(option.args[0]);
                break;
        }
    }

    clearStatusOption(option) {
        option = new ScriptParser(option);
        switch(option.name) {
            case "stun":
                this.isStuned -= Number(option.args[0]);
                break;
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

    get critical() {
        return this.character.critical;
    }

    get criticalPotential() {
        return this.character.criticalPotential
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

    get canAction() {
        return this.canFight && this.isStuned === 0;
    }

    get isAlive() {
        return this.character.health > 0;
    }

    get skills() {
        return this.character.skills;
    }

    get skillActiveProbability() {
        return this.character.skillActiveProbability;
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