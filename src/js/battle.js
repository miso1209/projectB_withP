import { BattleUI } from "./battleui";
import { STAGE_BASE_POSITION, CHARACTER_CAMP, TARGETING_TYPE, BATTLE_STATUS, SCENE_STATUS } from "./battledeclare";
import BattleCharacter from "./battlecharacter";
import Skill from "./skill";
import { BattleEffecter } from "./battleeffecter";
import { DIRECTIONS } from "./define";
import { EventEmitter } from "events";

// Stage, Effecter, Skill 정리할 것.

export class Battle extends EventEmitter {
    constructor(options) {
        super();

        // options 에는 배틀의 생성정보가 담겨있다.
        this.stage = new PIXI.Container();

        this.screenSize = {
            width: options.screenWidth,
            height: options.screenHeight,
        };
        
        // 백그라운드 생성
        const background = new PIXI.Sprite(PIXI.Texture.fromFrame(options.background));
        this.stage.addChild(background);

        // 배틀정보를 담는 컨테이너를 만든다
        this.container = new PIXI.Container();
        this.stage.addChild(this.container);

        this.battlefield = new PIXI.Sprite(PIXI.Texture.fromFrame(options.battlefield));
        this.characters = new PIXI.Container(); // 캐릭터, 맵
        this.effects = new BattleEffecter();

        this.container.addChild(this.battlefield);
        this.container.addChild(this.characters);
        this.container.addChild(this.effects);

        // 옵션에 있는 팀정보를 가지고 세팅을한다
        this.allies = [];
        this.enemies = [];

        for (const c of options.allies) {
            if (c.character.health > 0) {
                const battleChar = new BattleCharacter(c.character);
                battleChar.setGridPosition(c.x, c.y);
                battleChar.setCamp(CHARACTER_CAMP.ALLY);
                this.allies.push(battleChar);
    
                this.initCharacter(battleChar);
            }
        }
        
        for(const c of options.enemies) {
            if (c.character.health > 0) {
                const battleChar = new BattleCharacter(c.character);
                battleChar.setGridPosition(c.x, c.y);
                battleChar.setCamp(CHARACTER_CAMP.ENEMY);
                this.enemies.push(battleChar);
            }
        }

        // 그리는 순서 때문에 우선 이렇게 처리해둔다.
        let enemyArray  = [].concat(this.enemies);
        enemyArray = enemyArray.splice(3,3).concat(enemyArray.splice(0,3));
        enemyArray.forEach((enemy) => {
            this.initCharacter(enemy);
        })

        // ui 임시 설정
        this.ui = new BattleUI({ w: options.screenWidth, h: options.screenHeight}, this.allies);
        this.ui.showBattleLogo('battle_start_logo.png', () => {
            this.pause = false;
        });

        // special skill 이벤트 emit받아서 사용 하는데.. => 죽었을 시 발동, 쿨타임 0 문제 해결해야 할 듯 하다.
        this.ui.on('specialskill', (character) => {
            this.specialSkillQueue.push(character);
        });
        this.stage.addChild(this.ui.container);

        this.activeSkill = null;
        this.specialSkillQueue = [];
        this.pause = true;

        // 이전투가 끝났을때 최종보상
        this.rewards = options.rewards;
        this.exp = options.exp;
        this.gold = options.gold;

        this.setScale(2);
        this.focusCenter();
    }

    initCharacter(character) {
        // hit/dead 등의 이벤트를 여기에 연결한다
        if (character.camp === CHARACTER_CAMP.ENEMY) {
            character.position.x = STAGE_BASE_POSITION.ENEMY_X + character.gridPosition.x * 36 + character.gridPosition.y * 36;
            character.position.y = STAGE_BASE_POSITION.ENEMY_Y + character.gridPosition.x * 20 - character.gridPosition.y * 20;
            character.animation.changeVisualToDirection(DIRECTIONS.SW);
            this.characters.addChild(character);
        }

        if (character.camp === CHARACTER_CAMP.ALLY) {
            character.position.x = STAGE_BASE_POSITION.PLAYER_X + character.gridPosition.x * 36 - character.gridPosition.y * 36;
            character.position.y = STAGE_BASE_POSITION.PLAYER_Y + character.gridPosition.x * 20 + character.gridPosition.y * 20;
            character.animation.changeVisualToDirection(DIRECTIONS.NE);
            this.characters.addChild(character);
        }
    }

    setScale(scale) {
        this.container.scale = {x: scale, y: scale };
    }

    focusCenter() {
        const offsetX = 41;
        const offsetY = -20;
        this.container.position.x = (this.screenSize.width - this.battlefield.width * this.container.scale.x) / 2 + offsetX;
        this.container.position.y = (this.screenSize.height - this.battlefield.height * this.container.scale.y) / 2 + offsetY;
    }

    update() {
        // 기본 스킬들 업데이트
        this.ui.update();
        this.effects.update();
        
        for (const bchar of this.allies){
            bchar.update();
        }

        for (const bchar of this.enemies){
            bchar.update();
        }

        // 전투 종료 시 정지.
        if (this.pause) {
            return ;
        }

        // 스킬이 모두 종료되었으면 스킬을 종료하고 다음 스킬을 발동시킨다
        if (!this.activeSkill || this.activeSkill.isFinished) {
            this.notifyNextTurn();
            this.activeSkill = null;

            // 배틀 상태를 체크
            const battleStatus = this.getBattleStatus();
            if (battleStatus === BATTLE_STATUS.WIN) {
                // 이겼다
                this.pause = true;
                this.emit('win');
                this.clearCharacterBuffs();

                this.ui.showBattleLogo('victory_logo.png', () => {
                    const reward = {
                        gold: this.gold,
                        items: this.rewards,
                        exp: this.exp,
                        characters: this.allies
                    };

                    this.ui.showReward(reward);
                });

                this.ui.on('closeReward', () => {
                    this.emit('closeBattle');
                });
            } else if (battleStatus === BATTLE_STATUS.LOSE) {
                // 졌다
                this.pause = true;
                this.emit('lose');
                this.clearCharacterBuffs();

                this.ui.showBattleLogo('defeat_logo.png', () => {
                    this.emit('closeBattle');
                });
            }
        }

        if (!this.activeSkill) {
            let nextSkill = null;
            // 스페셜 스킬이 예약되어 있는가
            while (this.specialSkillQueue.length > 0 ){
                const character = this.specialSkillQueue[0];
                this.specialSkillQueue.splice(0, 1);
                nextSkill = this.getSpeicalSkill(character);

                if (character.isAlive) {
                    break;
                }
            }

            // 스페셜 스킬이 설정되어 있지 않다면 일반 스킬을 설정한다
            if (!nextSkill) {
                // 가장 행동이 빠른 캐릭터의 스킬을 가져온다
                const character = this.nextCharacter();
                if (character) {
                    nextSkill = this.getNormalSkill(character);
                }
            }
         
            // 다음 스킬을 설정
            this.activeSkill = nextSkill;
        }

        // 기본 스킬을 업데이트 한다
        this.activeSkill.update();
    }

    notifyNextTurn() {
        for (const bchar of this.allies){
            bchar.nextTurn();
        }
        for (const bchar of this.enemies){
            bchar.nextTurn();
        }
    }

    clearCharacterBuffs() {
        for (const bchar of this.allies){
            bchar.clearBuff();
        }
        for (const bchar of this.enemies){
            bchar.clearBuff();
        }
    }

    nextCharacter() {
        // 다음 행동 순서의 캐릭터를 가져온다
        let score =  Number.MAX_SAFE_INTEGER;
        let selected = null;
        const list = this.allies.concat(this.enemies);
        for (const bchar of list) {
            // 살아있는 놈만 반환하도록 해둔다.
            if (bchar.actionScore < score && bchar.isAlive) {
                selected = bchar;
                score = bchar.actionScore;
            }
        }

        return selected;
    }

    getTarget(allies, enemies, targetingType) {
        const result = [];

        switch(targetingType) {
            case TARGETING_TYPE.ENEMY_FRONT_TANK:
                // 상대의 순번이 빠른 상대를 고른다
                for(let i = 0; i < enemies.length; ++i) {
                    const target = enemies[i];
                    if (target.isAlive) {
                        result.push(target);
                        break;
                    }
                }
                break;

            case TARGETING_TYPE.ENEMY_BACK_CARRY:
                // 상대의 순번이 느린 상대를 고른다
                for(let i = enemies.length - 1; i >= 0; --i) {
                    const target = enemies[i];
                    if (target.isAlive) {
                        result.push(target);
                        break;
                    }
                }
                break;

            case TARGETING_TYPE.ENEMY_MIN_HP:
                {
                    let selectedHp = Number.MAX_SAFE_INTEGER;
                    let selected = null;
                    enemies.forEach((target) => {
                        if (target.isAlive && target.health < selectedHp) {
                            selectedHp = target.health;
                            selected = target;
                        }
                    });

                    if (selected) {
                        result.push(selected);
                    }
                }
                break;

            case TARGETING_TYPE.ALLY_ALL:
                allies.forEach((target) => {
                    if( target.isAlive ) {
                        result.push(target);
                    }
                });
                break;

            case TARGETING_TYPE.ENEMY_ALL:
                enemies.forEach((target) => {
                    if( target.isAlive ) {
                        result.push(target);
                    }
                });
                break;
        }
        return result;
    }

    getNormalSkill(character) {
        const skill = Math.random()<0.5?Skill.New(character.skills.a):Skill.New(character.skills.b);

        const allies = (character.camp === CHARACTER_CAMP.ALLY) ? this.allies : this.enemies;
        const enemies = (character.camp === CHARACTER_CAMP.ALLY) ? this.enemies : this.allies;

        const targets = this.getTarget(allies, enemies, skill.targetingType);
        skill.setOwner(character);
        skill.setTarget(targets);
        skill.setEffects(this.effects);

        // 캐릭터의액선 스코어를 증가시킨다
        character.actionScore += 1 / character.speed;

        return skill;
    }

    getSpeicalSkill(character) {
        const skill = Skill.New(character.skills.extra);
        
        const allies = (character.camp === CHARACTER_CAMP.ALLY) ? this.allies : this.enemies;
        const enemies = (character.camp === CHARACTER_CAMP.ALLY) ? this.enemies : this.allies;

        const targets = this.getTarget(allies, enemies, skill.targetingType);
        skill.setOwner(character);
        skill.setTarget(targets);
        skill.setEffects(this.effects);

        // 캐릭터의액선 스코어를 증가시킨다
        character.actionScore += 1 / character.speed;

        return skill;
    }

    getBattleStatus() {
        // 아군과 전군중에 살아있는 쪽이 한명이라도 있는지 체크한다. (전멸 플래그 체크)
        const aliveCamp = { ally: false, enemy: false };
        this.allies.forEach((character) => { aliveCamp.ally |= character.isAlive; });
        this.enemies.forEach((character) => { aliveCamp.enemy |= character.isAlive; });

        // 둘다 살아있으면 노멀 상태, 한쪽이 전멸했아면 승패를 가른다
        if (aliveCamp.ally && aliveCamp.enemy) {
            return BATTLE_STATUS.DEFAULT;
        } 
        else if (aliveCamp.ally) {
            return BATTLE_STATUS.WIN;
        } 
        else {
            return BATTLE_STATUS.LOSE;
        } 
    }
}