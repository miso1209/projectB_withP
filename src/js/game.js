import path from 'path';
import { EventEmitter } from 'events';

import ResourceManager from "./resource-manager";
import Tweens from "./tweens";
import Stage  from "./stage";

import Player  from "./player";
import {Battle}  from "./battle";
import Explore  from "./explore";

import { doorIn, doorOut } from './cutscene/door';
import ScriptPlay from './cutscene/scriptplay';

import idle from './cutscene/idle';
import Combiner from './combiner';
import ItemTable from './resources/item-table';
import CharacterTable from './resources/chararacter-table';
import Character from './character';

export default class Game extends EventEmitter {
    constructor(pixi) {

        super();

        const width = pixi.renderer.width;
        const height = pixi.renderer.height;

        this.screenWidth = width;
        this.screenHeight = height;

        // 렌더링 레이어를 설정한다
        this.background = new PIXI.Container();
        this.gamelayer = new PIXI.Container(); // 게임용
        this.foreground = new PIXI.Container(); // UI 

        pixi.stage.addChild(this.background);
        pixi.stage.addChild(this.gamelayer);
        pixi.stage.addChild(this.foreground);

        // 클릭 이벤트
        this.gamelayer.mouseup = this.onGameClick.bind(this);
        this.gamelayer.interactive = true;

        this.foreground.mouseup = this.onForegroundClick.bind(this);
        this.foreground.interactive = true;
    
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
        this.battleMode = new Battle(this);
        this.exploreMode = new Explore(this);
        this.currentMode = null;
        
        this.resourceManager = new ResourceManager();
        this.itemTable = new ItemTable();
        this.charTable = new CharacterTable();
        this.combiner = new Combiner();
    }

    setStorage(storage) {
        this.storage = storage;
    }

    // 아이템과 캐릭터 데이터등을 미리 로딩을 한다
    loadCommon(next) {
        this.resourceManager.add("items", "assets/json/items.json");
        this.resourceManager.add("characters", "assets/json/characters.json");
        this.resourceManager.add("recipe", "assets/json/recipe.json");

        this.resourceManager.load((resources) => {
            this.itemTable.init(resources.items.data);
            this.charTable.init(resources.characters.data);
            this.combiner.addRecipes(resources.recipe.data, this.itemTable);

            if (next) {
                next();
            }
        });
    }

    initPlayer() {
        this.player = new Player();
        
        if (!this.storage.hasAlreadyPlayed()) {
            // 플레이어의 초기장비와 초기 캐릭터를 설정한다
            this.storage.addItem(2001, 2);
        }

        // 플레이어의 인벤토리에 복사한다
        for (const itemId in this.storage.data.inventory) {
            this.player.inventory.addItem(itemId, this.storage.data.inventory[itemId]);
        }

        // TODO : 배틀 테스트를 위해서 추가한것인가?
        this.player.characters.push(new Character(this.charTable.getData(1)));
        this.player.characters.push(new Character(this.charTable.getData(2)));
        this.player.characters.push(new Character(this.charTable.getData(3)));
        this.player.characters.push(new Character(this.charTable.getData(4)));
        this.player.characters.push(new Character(this.charTable.getData(5)));
        this.player.controlCharacter = this.player.characters[0];
    }

    hasTag(tag) {
        return this.storage.data.tags.indexOf(tag) >= 0;
    }

    addTag(tag) {
        this.storage.addTag(tag);
    }

    start() {
        this.initPlayer();

        // 필요한 필드 캐릭터 정보를 로딩한다
        const anim_path = "assets/sprite/character/" + this.player.controlCharacter.name;
        for (const ani in this.player.controlCharacter.data.animations) {
            this.resourceManager.add(anim_path + "/" + ani + ".json");
        }
        this.resourceManager.add("shadow.png", "assets/shadow.png");

        if (this.hasTag("intro-watch")) {
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
                }, {
                    command: "dialog",
                    arguments: [
                        { text: "돈이 없다고 이런곳에서 살아야 하나 ...", speaker: 1},
                        { text: "난 어제 내집에서 잘 수 있을까", speaker: 1},
                        { text: "... 우울해지네", speaker: 1},
                        { text: "아 모르겠다! 일단 작업용 탁자나 찾아보자", speaker: 1}]
                }, {
                    command: "addtag",
                    arguments: ["intro-watch"]
                }
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
        if (this.currentMode === this.exploreMode) {
            // 기존 스테이지를 보이지 않게 한다 (스테이지를 떠날 필요는없다)
            this.battleMode.prepare();
            this.gamelayer.removeChild(this.stage);
            this.gamelayer.addChild(this.battleMode.container);
            // 배틀을 사용한다
            this.currentMode = this.battleMode;
        }
    }

    leaveBattle() {
        if (this.currentMode === this.battleMode) {
            // 기존 스테이지를 보이지 않게 한다 (스테이지를 떠날 필요는없다)
            this.gamelayer.removeChild(this.battleMode.container);
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

    onForegroundClick(event) {
        if (this.currentMode && this.currentMode.onForegroundClick) {
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

    onDialog(callback) {
        this.dialog_callback = callback;
    }

    onCutsceneStart(callback) {
        this.cutscenestart_callback = callback;
    }

    onCutsceneEnd(callback) {
        this.cutsceneend_callback = callback;
    }

    getRecipes(category) {
        const recipes = this.combiner.getRecipes(category, this.player.inventory);
        for (const recipe of recipes) {
            if (!recipe.data)  {
                recipe.data = this.itemTable.getData(recipe.item);
            }

            for (const mat of recipe.materials) {
                if (!mat.data) {
                    mat.data = this.itemTable.getData(mat.item);
                }
            }
        }

        return recipes;
    }

    // TODO : 나중에 밖으로 빼야 하나?
    getInvenotryData() {
        const sortByCategory = {};
        // 카테고리별로 묶는다.
        for(const itemId in this.player.inventory.items) {
            const count = this.player.inventory.items[itemId];

            const data = this.itemTable.getData(itemId);
            
            sortByCategory[data.category] = sortByCategory[data.category] || [];
            sortByCategory[data.category].push({ item: itemId, data: data, owned: count });
        }

        // 이것을 배열로 바꾼다
        const result = [];
        for(const category in sortByCategory) {
            const items = sortByCategory[category];
            result.push({ category: category, items: items });
        }
        return result;
    }
}