import { BattleProgressBar } from "./battleui";
import AnimatedCharacter from "./animatedcharacter";

const PLAY_LOOP = true;
const PLAY_ONCE = false;

// 캐릭터 로직
export default class BattleCharacter extends PIXI.Container {
    constructor(character) {
        super();
        this.character = character;
       
        this.animation = new AnimatedCharacter(character.id);

        this.progressBar = new BattleProgressBar();
        this.progressBar.setPosition({
            x: this.animation.width / 2,
            y: -this.animation.height,
        });

        this.addChild(this.animation);
        this.addChild(this.progressBar);

        this.progressBar.setProgress(this.health / this.maxHealth);
        this.possibleOfBattle = true;
        // 캐릭터의 스피드대로 세팅한다
        this.actionScore = 0;
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
        this.buffManager.update();
        // 액티브 스코어를 감소시킨다
        --this.actionScore;
    }

    onDamage(damage) {
        this.character.health -= damage;
        const healthRate = this.health / this.maxHealth;
        this.progressBar.setProgress(healthRate);

        this.animation.colorBlink(0xFF0000, 0.75);
        this.animation.vibration(6, 0.5);
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

    get health() {
        return this.character.health;
    }

    get maxHealth() {
        return this.character.maxHealth;
    }

    get attack() {
        return this.character.attack;
    }

    get armor() {
        return this.character.armor;
    }

    get isAlive() {
        return this.character.health > 0;
    }

    get skills() {
        return this.character.skills;
    }
}