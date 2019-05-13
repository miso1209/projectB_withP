import path from 'path';
import ResourceManager from "./resource-manager";
import Tweens from "./tweens";
import Stage  from "./stage";

import Player  from "./player";
import Battle  from "./battle";
import Explore  from "./explore";

import EntityFactory from './entityfactory';
import { doorIn, doorOut } from './cutscene/door';
import ScriptPlay from './cutscene/scriptplay';
import { EventEmitter } from 'events';
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

    start(playerInfo) {
        // 임시로 캐릭터데이터를 생성한다
        this.player = new Player();
        // 플레이어가 가지고 있는 캐릭터를 하나 정의한다
        this.player.characters.push(new Character(this.charTable.getData(1)));
        this.player.controlCharacter = this.player.characters[0];

        // 필요한 필드 캐릭터 정보를 로딩한다
        const anim_path = "assets/sprite/character/" + this.player.controlCharacter.name;
        for (const ani in this.player.controlCharacter.data.animations) {
            this.resourceManager.add(anim_path + "/" + ani + ".json");
        }
        this.resourceManager.add("shadow.png", "assets/shadow.png");

        // 필드에 들어간다
        this.playCutscene();
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

    buildStageEnterCutscene(options) {
        // 현재는 door 만 있다
        return new doorIn(this, options.x, options.y, options.direction, options.margin);
    }

    buildStageLeaveCutscene(options) {
        if (options) {
            // 현재는 door 만 있다
            return new doorOut(this, options.x, options.y, options.direction, options.margin);
        } else {
            return new idle();
        }
    }

    enterStage(stagePath, options) {

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
                const stage = new Stage(stageName, mapData.width, mapData.height, mapData.tilewidth, mapData.tileheight);
                stage.load(mapData);
                
                 // 스테이지의 줌레벨을 결정한다
                stage.zoomTo(2, true);
                this.stage = stage;
                this.gamelayer.addChild(stage);

                // 페이드 인이 끝나면 게임을 시작한다
                this.currentMode = this.exploreMode;
                this.currentMode.prepare(options.x, options.y);

                // 진입 컷신을 사용한다
                this.tweens.addTween(this.blackScreen, 0.5, { alpha: 0 }, 0, "easeOut", true, () => {
                    const cutscene = this.buildStageEnterCutscene(options)
                    cutscene.once('complete', () => { 
                        this.currentMode.start();
                        this.emit('stageentercomplete');
                    });
                    cutscene.play();
                });
            });
        });
    }

    leaveStage(options) {
        if (this.stage) {
            this.currentMode.setInteractive(false);
            const cutscene = this.buildStageLeaveCutscene(options);
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
            this.gamelayer.addChild(this.battleMode.stage);
            // 배틀을 사용한다
            this.currentMode = this.battleMode;
        }
    }

    leaveBattle() {
        if (this.currentMode === this.battleMode) {
            // 기존 스테이지를 보이지 않게 한다 (스테이지를 떠날 필요는없다)
            this.gamelayer.removeChild(this.battleMode.stage);
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
}