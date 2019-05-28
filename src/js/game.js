import path from 'path';
import { EventEmitter } from 'events';

import Loader from "./loader";
import Stage  from "./stage";

import Player  from "./player";
import {Battle}  from "./battle";
import Explore  from "./explore";

import Combiner from './combiner';
import Character from './character';
import Quest from './quest';

import ScriptParser from './scriptparser';
import Cutscene from './cutscene';
import UI from './ui/ui';
import Portal from './portal';
import Notification from './notification';
import Item from './item';

export default class Game extends EventEmitter {
    constructor(pixi) {

        super();

        const width = pixi.renderer.width;
        const height = pixi.renderer.height;

        this.screenWidth = width;
        this.screenHeight = height;

        // 렌더링 레이어를 설정한다
        this.gamelayer = new PIXI.Container(); // 게임용
        pixi.stage.addChild(this.gamelayer);

        // 클릭 이벤트
        this.gamelayer.mouseup = this.onGameClick.bind(this);
        this.gamelayer.interactive = true;

        this.tweens = new Tweens();
        this.combiner = new Combiner();
        this.ui = new UI();

        // 제거해야한다...
        this.currentMode = null;
        this.exploreMode = new Explore(this);

        
        // 나중에 UI 로 바꾸어야 한다
        // 암전용 블랙스크린을 설치한다
        const blackScreen = new PIXI.Sprite(PIXI.Texture.WHITE);
        blackScreen.width = width + 128;
        blackScreen.height = height + 128;
        blackScreen.position.x = -64;
        blackScreen.position.y = -64;
        blackScreen.tint = 0;
        pixi.stage.addChild(blackScreen);
        this.blackScreen = blackScreen;
        
        // ui 이벤트 연결
        // 어느 시점에 해야 좋을까?
        this.ui.on('inventory', () => {
            // 게임에서 인벤토리 데이터를 얻어온다
            const inputs = this.getInvenotryData();
            this.ui.showInventory(inputs);
        });
        this.ui.on('characterselect', ()=> {
            const inputs = [];
            for (const cid in this.player.characters) {
                inputs.push(this.player.characters[cid]);
            }
            this.ui.showCharacterSelect(inputs);
        });

        // 게임 알림을 알려주는 notificatin 큐를 만든다
        this.notification = new Notification();
    }

    // 더이상 콜백만들기가 싫어서 시험적으로 추가하는 비동기 함수들
    async $preload() {
        const preloads = require('json/preloads.json');
        const loader = new Loader();   
        for(const r of preloads) {
            loader.add(...r);
        }
        await loader.asyncLoad();
    }

    setStorage(storage) {
        this.storage = storage;
    }

    initPlayer() {
        if (!this.storage.data) {
            // 캐릭터 데이터를 초기화한다
            this.storage.resetData();
            // TODO : 배틀 테스트를 위해서 추가한것인가?
            this.storage.data.characters[1] = { level: 1, exp: 0, equips: {}};
            this.storage.data.characters[2] = { level: 1, exp: 0, equips: {}};
            this.storage.data.characters[3] = { level: 1, exp: 0, equips: {}};
            this.storage.data.characters[4] = { level: 1, exp: 0, equips: {}};
            this.storage.data.characters[5] = { level: 1, exp: 0, equips: {}};

            // 파티 등록
            this.storage.data.party[0] = 1;
            this.storage.data.party[1] = 2;
            this.storage.data.party[2] = 3;
            this.storage.data.party[3] = 4;
            this.storage.data.party[4] = 5;

            // 현지 진행해야하는 컷신 아이디를 적는다
            this.storage.data.cutscene = 1;

            // 필드에 보이는 캐릭터
            this.storage.data.controlCharacter = 1;

            this.storage.save();
        }

        this.player = new Player();

        // 태그정보를 로딩한다
        for(const tag of this.storage.data.tags) {
            this.player.addTag(tag);
        }
            
        // 가지고 있는 캐릭터를 등록한다
        for(const charId in this.storage.data.characters) {
            const c = new Character(charId);
            c.load(this.storage.data.characters[charId]);
            this.player.characters[charId] = c;
        }

        // 파티멤버를 등록한다
        for(let i = 0; i < this.storage.data.party.length; ++i) {
            const member = this.storage.data.party[i];
            this.player.party.set(i, member);
        }
        
        // 플레이어의 인벤토리에 복사한다
        this.player.inventory.load(this.storage.data.inventory);

        // 퀘스트 정보를 등록한다
        for (const questId in this.storage.data.quests) {
            const quest = new Quest(questId);
            quest.refresh(this.storage.data.quests[questId]);
            quest.foreEachEvent(this.on.bind(this));
            this.player.quests[questId] = quest;
        }

        
        this.player.controlCharacter = this.storage.data.controlCharacter;

    }

    start() {
        this.initPlayer();

        // TODO : 마지막 플레이된 컷신을 찾아서 해당 컷신을 실행하도록 한다.
        if (this.storage.data.cutscene) {
            // 필드에 들어간다// 튜토리얼 컷신을 샘플로 작성해본다
            this.playCutscene(this.storage.data.cutscene);
            
        } else {
            // 그냥 평범하게 집에 들어간다
            this.ui.showTheaterUI(0.5);
            this.$enterStage("assets/mapdata/house.json", "house-gate").then(() => {
                this.exploreMode.interactive = true;
                this.stage.showPathHighlight = true;
                this.ui.hideTheaterUI(0.5);
                this.ui.showMenu();
            });
        }
    }

    playCutscene(script) {
        //=========================================
        this.storage.data.cutscene = Number(script);
        this.storage.save();
        //=========================================

        this.onNotify({ type:"cutscene", script: script });
    }

    _playCutscene(script) {
        if (Number(script)) {
            script = Cutscene.fromData(Number(script));
        } else {
            script = Cutscene.fromJSON(script);
        }

        this.ui.showTheaterUI(0.5);
        this.ui.hideMenu();
        this.exploreMode.setInteractive(false);
        if (this.stage) { this.stage.showPathHighlight = false; }

        const next = () => {
            const func = script.next();
            if (func) {
                if (func.command === "dialog") {
                    this.ui.showDialog(func.arguments, next);

                } else if (func.command === "delay") {
                    const delay = func.arguments[0] * 1000;
                    setTimeout(next, delay);

                } else if (func.command === "enterstage") {
                    const path = "assets/mapdata/" + func.arguments[0] + ".json";
                    const eventName = func.arguments[1];  
                    this.$enterStage(path, eventName).then(next);

                } else if (func.command === "leavestage") {
                    const eventName = func.arguments[0];  
                    this.$leaveStage(eventName).then(next);

                } else if (func.command === "goto") {
                    const x = func.arguments[0];  
                    const y = func.arguments[1];  
                    this.stage.once('moveend', next);
                    this.stage.moveCharacter(this.exploreMode.controller, x, y);

                } else if (func.command === "addtag") {
                    this.addTag(...func.arguments);
                    next();
                } else if (func.command === "addquest") {
                    this.addQuest(...func.arguments);
                    next();
                }
            } else {
                const t = async() => {
                    // 컷신플레이가 종료되었다
                    // 암전후 다시 밝아진다.
                    await this.$fadeOut(1);
                    this.ui.hideTheaterUI();
                    await this.$fadeIn(1);
                    
                    this.ui.showMenu();
                    this.exploreMode.interactive = true;
                    if (this.stage) { this.stage.showPathHighlight = true; }

                    this.onNotification = false;

                    this.storage.data.cutscene = null;
                    this.storage.save();
                }

                t();
            }
        }

        next();
    }

    buildStageEnterCutscene(eventName) {
        const event = this.stage.findEventByName(eventName);
        if (event) {
            // 현재는 door 만 있다
            return Portal.New('doorin', this, event.gridX, event.gridY, event.direction, 1);
        } else {
            return Portal.New('default', this, this.exploreMode.lastX, this.exploreMode.lastY);
        }
    }

    buildStageLeaveCutscene(eventName) {
        const event = this.stage.findEventByName(eventName);
        if (event) {
            // 현재는 door 만 있다
            return Portal.New('doorout', this, event.gridX, event.gridY, event.direction, 1);
        } else {
            return Portal.New('default', this, this.exploreMode.controller.gridX, this.exploreMode.controller.gridY);
        }
    }
    
    async $enterStage(stagePath, eventName) {
        const stageName = path.basename(stagePath, ".json");
        const stage = new Stage();
        await stage.$load(stageName);
        for(const tag of this.player.tags) {
            stage.applyTag(tag);
        }
        stage.zoomTo(2, true);

        this.stage = stage;
        this.gamelayer.addChild(stage);

        // 페이드 인이 끝나면 게임을 시작한다
        this.currentMode = this.exploreMode;
        
        this.currentMode.start();
        const cutscene = this.buildStageEnterCutscene(eventName)
        // 임시 이동 코드...
        this.stage.addCharacter(this.currentMode.controller, cutscene.gridX, cutscene.gridY);
        this.stage.checkForFollowCharacter(this.currentMode.controller, true);
        // 스테이지 타이틀을 띄운다
        // 진입 컷신을 사용한다
        await this.$fadeIn(0.5);
        await cutscene.$play();
    }

    async $leaveStage(eventName) {
        if (!this.stage) { return; }

        // 이벤트를 찾는다
        this.exploreMode.setInteractive(false);
        const cutscene = this.buildStageLeaveCutscene(eventName);
        
        await cutscene.$play();
        await this.$fadeOut(0.5);
        this.gamelayer.removeChild(this.stage);
        this.stage = null;
    }

    enterBattle(monster) {
        if (this.currentMode instanceof Explore) {
            // 기존 스테이지를 보이지 않게 한다 (스테이지를 떠날 필요는없다)
            this.gamelayer.removeChild(this.stage);
            
            // 인카운터 정보를 이용해서 배틀 데이터를 만든다
            const enemies = [];
            for (let i = 0; i < monster.battleCharacters.length; ++i) {
                const c = monster.battleCharacters[i];
                if (c) {
                    enemies.push({
                        character: new Character(c),
                        x: monster.columnOf(i),
                        y: monster.rowOf(i)
                    });
                }
            }

            // 플레이어 파티 데이터를 작성한다
            const allies = this.player.party.getBattleAllies();

            // 배틀을 사용한다
            const options = {
                allies: allies,
                enemies: enemies,
                background: "battle_background.png",
                battlefield: "battleMap1.png",
                screenWidth: this.screenWidth,
                screenHeight: this.screenHeight,
                rewards: monster.rewards,
                exp: monster.exp,
            };
            this.currentMode = new Battle(options);
            this.currentMode.on('win', () => { this.leaveBattle(); });
            this.currentMode.on('lose', () => { this.leaveBattle(); });
            this.gamelayer.addChild(this.currentMode.stage);
        }
    }

    leaveBattle() {
        if (this.currentMode instanceof Battle) {
            // 기존 스테이지를 보이지 않게 한다 (스테이지를 떠날 필요는없다)
            this.gamelayer.removeChild(this.currentMode.stage);
            this.gamelayer.addChild(this.stage);
            // 배틀을 사용한다
            this.currentMode = this.exploreMode;
        }
    }

    onGameClick(event) {
        if (this.currentMode && this.currentMode.onGameClick) {
            this.currentMode.onGameClick(event);
        }
    }

    update() {
        this.tweens.update();
        if (this.stage) {
            this.stage.update();
        }
        if (this.currentMode) {
            this.currentMode.update();
        }

        // 캐릭터 데이터를 저장해야 하는지 확인
        if (this.player) {
            for (const cid in this.player.characters) {
                const c = this.player.characters[cid];
                if (c.isDirty()) {
                    c.clearDirty();
                    this.storage.updateCharacter(c.save());
                }
            }

            if (this.player.inventory.isDirty()) {
                this.storage.updateInventory(this.player.inventory.save());
                this.player.inventory.clearDirty();
            }
           
        }
    }

    combine(id) {
        this.combiner.combine(id, this.player.inventory);
        return true;
    }

    getRecipes(category) {
        const recipes = this.combiner.getRecipes(category, this.player.inventory);
        return recipes;
    }

    // TODO : 나중에 밖으로 빼야 하나?
    getInvenotryData() {
        const sortByCategory = {};
        // 카테고리별로 묶는다.
        this.player.inventory.forEach((item) => {
            if (!sortByCategory[item.category]) {
                sortByCategory[item.category] = [];
            }

            sortByCategory[item.category].push({ item: item.id, data: item.data, owned: item.count });
        });
      

        // 이것을 배열로 바꾼다
        const result = [];
        for(const category in sortByCategory) {
            const items = sortByCategory[category];
            result.push({ category: category, items: items });
        }
        return result;
    }
    
    runScript(script) {
        const parsed = new ScriptParser(script);
        const func = this[parsed.name];

        if (typeof(func) !== "function") {
            throw Error("invalid command : " + parsed.name);
        }

        func.bind(this)(...parsed.args);
    }

    hasTag(tag) {
        return this.player.hasTag(tag);
    }

    addTag(tag) {
        this.player.addTag(tag);
        // 저장하는 코드를 업데이트로 옮긴다
        this.storage.addTag(tag);

        this.emit('addtag', tag);
    }

    addItem(itemId, count) {
        this.player.inventory.addItem(itemId, Number(count));
        this.onNotify({ type:"item", item:itemId, count:count } );

        // 퀘스트를 위한 이벤트 처리
        this.emit('additem', itemId, count);
    }

    addQuest(questId) {

        if (!this.storage.data.quests[questId]) {
            // 퀘스트를 가지고 있지 않다면 퀘스트를 추가한다
            // 가지고 있다면 추가하지 않는다.
            const quest = new Quest(questId);
            this.storage.setQuest(questId, quest.data);
            this.player.quests[questId] = quest;

            // 퀘스트를 활성화시킨다
            quest.foreEachEvent(this.on.bind(this));
        }
    }

    completeQuest(id) {
        const quest = this.player.quests[id];
        console.log(quest, quest.isAllObjectivesCompleted());
        if (quest && quest.isAllObjectivesCompleted()){
            // 이벤트 연결을 끊어놓는다
            quest.foreEachEvent(this.removeListener.bind(this));

            for(const reward of quest.rewards) {
                this.runScript(reward.script);
            }
            
            // 가지고 있는 퀘스트에서 제거한다. 
            // TODO : 어딘가에 보관해야 할 것 같은데?
            this.storage.completeQuest(id);
            delete this.player.quests[id];
        }
    }

    //나중에 UI 로 뺴야 한다
    async $fadeOut(duration) {
        await this.tweens.$addTween(this.blackScreen, duration, { alpha: 1 }, 0, "linear", true);
    }

    async $fadeIn(duration) {
        await this.tweens.$addTween(this.blackScreen, duration, { alpha: 0 }, 0, "linear", true);
    }

    onNotify(options) {
        // TODO : 나중에 아이템 알람말고 다른 것도 필요하다
        if (this.onNotification) {
            this.notification.push(options);
        } else {
            if (options.type === "item") {
                this.onNotification = true;
                this.ui.showItemAquire(new Item(options.item, options.count), () => {
                    this.onNotification = false;
                    const next = this.notification.pop();
                    if (next) {
                        this.onNotify(next);
                    }
                });
            } else if (options.type === "cutscene") {
                this.onNotification = true;
                this._playCutscene(options.script);
            }
        }
    }
}