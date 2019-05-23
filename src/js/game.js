import path from 'path';
import { EventEmitter } from 'events';

import ResourceManager from "./resource-manager";
import Stage  from "./stage";

import Player  from "./player";
import {Battle}  from "./battle";
import Explore  from "./explore";

import { doorIn, doorOut } from './cutscene/door';
import idle from './cutscene/idle';
import Combiner from './combiner';
import Character from './character';
import Quest from './quest';

import ScriptPlay from './cutscene/scriptplay';
import ScriptParser from './scriptparser';

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

        // 암전용 블랙스크린을 설치한다
        const blackScreen = new PIXI.Sprite(PIXI.Texture.WHITE);
        blackScreen.width = width + 128;
        blackScreen.height = height + 128;
        blackScreen.position.x = -64;
        blackScreen.position.y = -64;
        blackScreen.tint = 0;
        pixi.stage.addChild(blackScreen);
        this.blackScreen = blackScreen;

        this.tweens = new Tweens();
        this.exploreMode = new Explore(this);
        this.currentMode = null;
        
        this.resourceManager = new ResourceManager();
        this.combiner = new Combiner();
       
    }

    setStorage(storage) {
        this.storage = storage;
    }

    initPlayer() {
        this.player = new Player();
        
        // 플레이어의 인벤토리에 복사한다
        for (const itemId in this.storage.data.inventory) {
            this.player.inventory.addItem(itemId, this.storage.data.inventory[itemId]);
        }

        // 퀘스트 정보를 등록한다
        for (const questId in this.storage.data.quests) {
            const quest = new Quest(questId);
            quest.refresh(this.storage.data.quests[questId]);
            quest.foreEachEvent(this.on.bind(this));
            this.player.quests[questId] = quest;
        }

        // 인벤토리에 변화가 올때 캐릭터 정보를 저장한다
        this.player.inventory.on('added', this.storage.addItem.bind(this.storage));
        this.player.inventory.on('chagned', this.storage.updateItem.bind(this.storage));
        this.player.inventory.on('remove', this.storage.removeItem.bind(this.storage));

        // TODO : 배틀 테스트를 위해서 추가한것인가?
        this.player.characters.push(new Character(1));
        this.player.characters.push(new Character(2));
        this.player.characters.push(new Character(3));
        this.player.characters.push(new Character(4));
        this.player.characters.push(new Character(5));
        this.player.controlCharacter = this.player.characters[0];
    }

    hasTag(tag) {
        return this.storage.data.tags.indexOf(tag) >= 0;
    }

    addTag(tag) {
        this.storage.addTag(tag);
        // 태그 추가 이벤트 트리거 
        this.emit('addtag', tag);
    }

    addQuest(questId) {

        if (!this.storage.data.quests[questId]) {
            // 퀘스트를 가지고 있지 않다면 퀘스트를 추가한다
            // 가지고 있다면 추가하지 않는다.
            const quest = new Quest(questId);
            this.storage.setQuest(questId, quest.data);

            // 퀘스트를 활성화시킨다
            this.player.quests[questId] = quest;
            quest.foreEachEvent(this.on.bind(this));
        }
    }

    start() {
        this.initPlayer();

        // 필요한 필드 캐릭터 정보를 로딩한다
        const anim_path = "assets/sprite/character/" + this.player.controlCharacter.name;
        for (const ani in this.player.controlCharacter.data.animations) {
            this.resourceManager.add(anim_path + "/" + ani + ".json");
        }
        this.resourceManager.add("shadow.png", "assets/shadow.png");

        if (this.hasTag("newplayer")) {
            // 그냥 평범하게 집에 들어간다
            this.playCutscene([
                {
                    command: "enterstage",
                    arguments: ["house", "house-gate"],
                }
            ]);
        } else {
            // 필드에 들어간다// 튜토리얼 컷신을 샘플로 작성해본다
            const introCutscene = [
                {
                    command: "enterstage",
                    arguments: ["house", "house-gate"],
                }, {
                    command: "delay",
                    arguments: [0.5],
                },  {
                    command: "dialog",
                    arguments: [
                        { text: "누구 계신가요?", speaker: 1},
                    ]
                }, {
                    command: "dialog",
                    arguments: [
                        { text: "(아무런 반응이 없다)" },
                    ]
                }, {
                    command: 'goto',
                    arguments: [3, 14]
                }, {
                    command: "dialog",
                    arguments: [
                        { text: "여긴 빈집인가?", speaker: 1},
                        { text: "좋아!! 여기서부터 새출발이다!", speaker: 1},
                    ]
                }, {
                    command: 'goto',
                    arguments: [5, 8]
                }, {
                    command: "dialog",
                    arguments: [
                        
                        { text: "우선 여기 테이블에 작업도구들을 준비해보자 ", speaker: 1}
                    ]
                }, { 
                    command: "addquest",
                    arguments: [1]
                }, {
                    command: "addtag",
                    arguments: ["newplayer"]
                }, 
            ];
            this.playCutscene(introCutscene);
        }
    }

    playCutscene(script) {
        if (this.cutscene) {
            this.cutscene.stop();
        }

        this.cutscene = new ScriptPlay(script);
        this.cutscene.once('complete', () => {
            this.cutscene = null;
        })
        this.cutscene.play(this);
    }

    buildStageEnterCutscene(eventName) {
        const event = this.stage.findEventByName(eventName);
        if (event) {
            // 현재는 door 만 있다
            return new doorIn(this, event.x, event.y, event.direction, 1);
        } else {
            return new idle();
        }
    }

    buildStageLeaveCutscene(eventName) {
        const event = this.stage.findEventByName(eventName);
        if (event) {
            // 현재는 door 만 있다
            return new doorOut(this, event.x, event.y, event.direction, 1);
        } else {
            return new idle();
        }
    }

    enterStage(stagePath, eventName) {

        this.resourceManager.add("stage", stagePath);
        this.resourceManager.load((resources) => {
            const resourcePath = path.dirname(stagePath) + '/';

            const mapData = resources["stage"].data; // 이것은 규칙을 정한다
            // 맵데이터로부터 필요한 리소스를 전부 가져온다
            // 나중에 클래스로 만들어야 할 것 같은데!?
            for(const tileset of mapData.tilesets) {
                if (tileset.image) {
                    // 타일셋이 이미지 하나를 타일링 해서 쓰고 있는 경우이다
                    this.resourceManager.add(tileset.image, resourcePath + tileset.image);
                }
                if (tileset.tiles) {
                    // 타일마다 개별 이미지를 쓰는 경우도 있다
                    for(const tile of tileset.tiles) {
                        if (tile.image) {
                            this.resourceManager.add(tile.image, resourcePath + tile.image);
                        }
                    }
                }
            }

            this.resourceManager.load((resources) => {
                const stageName = path.basename(stagePath, ".json");
                const stage = new Stage(this, stageName, mapData.width, mapData.height, mapData.tilewidth, mapData.tileheight);
                stage.load(mapData);
                
                 // 스테이지의 줌레벨을 결정한다
                stage.zoomTo(2, true);
                this.stage = stage;
                this.gamelayer.addChild(stage);

                // 페이드 인이 끝나면 게임을 시작한다
                this.currentMode = this.exploreMode;
                const event = this.stage.findEventByName(eventName);
                if (event) {
                    this.currentMode.prepare(event.gridX, event.gridY);
                } else {
                    this.currentMode.prepare(0, 0);
                }

                // 진입 컷신을 사용한다
                this.tweens.addTween(this.blackScreen, 0.5, { alpha: 0 }, 0, "easeOut", true, () => {
                    const cutscene = this.buildStageEnterCutscene(eventName)
                    cutscene.once('complete', () => { 
                        this.currentMode.start();
                        this.emit('stageentercomplete');
                    });
                    cutscene.play();
                });
            });
        });
    }

    leaveStage(eventName) {
        if (this.stage) {
            // 이벤트를 찾는다
            this.currentMode.setInteractive(false);
            const cutscene = this.buildStageLeaveCutscene(eventName);
            cutscene.play();
            cutscene.once('complete', () => {
                this.tweens.addTween(this.blackScreen, 0.5, { alpha: 1 }, 0, "easeIn", true, () => {
                    // 바로 제거한다.
                    this.gamelayer.removeChild(this.stage);
                    this.emit('stageleavecomplete');
                });
            });
        }
    }

    enterBattle() {
        if (this.currentMode instanceof Explore) {
            // 기존 스테이지를 보이지 않게 한다 (스테이지를 떠날 필요는없다)
            this.gamelayer.removeChild(this.stage);

            // 배틀을 사용한다
            const options = {
                allies: [{ character: new Character(1), x: 0, y: 0}],
                enemies: [{ character: new Character(2), x: 0, y: 0}],
                background: "battle_background.png",
                battlefield: "battleMap1.png",
                screenWidth: this.screenWidth,
                screenHeight: this.screenHeight,
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
        const parsed = ScriptParser(script);
        const func = this[parsed.name];

        if (typeof(func) !== "function") {
            throw Error("invalid command : " + parsed.name);
        }

        func(...this.args);
    }
}