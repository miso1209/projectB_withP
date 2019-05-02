import path from 'path';
import ResourceManager from "./resource-manager";
import Tweens from "./tweens";
import Stage  from "./stage";

import Player  from "./player";
import Battle  from "./battle";
import Explore  from "./explore";

import TileSet from "./tiledmap";
import EntityFactory from './entityfactory';
import EntranceDoor from './field/cutscene/entrace-door';
import { DIRECTIONS } from './define';

export default class Game {
    constructor(pixi) {

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
        this.generator = new EntityFactory();
    }

    // 아이템과 캐릭터 데이터등을 미리 로딩을 한다
    loadCommon(next) {
        this.resourceManager.add("items", "assets/json/items.json");
        this.resourceManager.add("characters", "assets/json/characters.json");

        this.resourceManager.load((resources) => {
            this.generator.setItems(resources.items.data);
            this.generator.setCharacters(resources.characters.data);

            if (next) {
                next();
            }
        });
    }


    start(playerInfo) {
        // 임시로 캐릭터데이터를 생성한다
        this.player = new Player();
        // 플레이어가 가지고 있는 캐릭터를 하나 정의한다
        this.player.characters.push(this.generator.character(1));
        this.player.controlCharacter = this.player.characters[0];

        // 필요한 필드 캐릭터 정보를 로딩한다
        const anim_path = "assets/sprite/character/" + this.player.controlCharacter.name;
        for (const ani in this.player.controlCharacter.data.animations) {
            this.resourceManager.add(anim_path + "/" + ani + ".json");
        }
        this.resourceManager.add("shadow.png", "assets/shadow.png");


        // 필드에 들어간다
        this.enterStage(playerInfo.stagePath, new EntranceDoor(this, 0,1, DIRECTIONS.SE, 2));
    }

    enterStage(stagePath, enterCutscene) {
        if (this.stage) {
            this.currentMode.setInteractive(false);
            // 기존 스테이지에서 나간다
            this.tweens.addTween(this.blackScreen, 1, { alpha: 1 }, 0, "easeIn", true, () => {
                this.gamelayer.removeChildren();

                // 화면 암전이 끝나면 로딩을 시작한다
                this.loadStage(stagePath, enterCutscene);
            });
        } else {
            // 바로 로딩을 한다
            this.loadStage(stagePath, enterCutscene);
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

    loadStage(stagePath, enterCutscene) {

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


                // 여기에 데이터를 입력한다
                const tileset = new TileSet(mapData);

                // 타일맵을 설정한다
                for (let y = 0; y < tileset.height;++y) {
                    for (let x = 0; x < tileset.width;++x) {
                        const btile = tileset.bottomLayer[x +y * tileset.width];
                        if (btile) {
                            stage.setBottomTile(x, y, btile);
                        }
                        const gtile = tileset.groundLayer[x +y * tileset.width];
                        if (gtile) {
                            stage.setGroundTile(x, y, gtile);
                        }
                        const otile = tileset.objectLayer[x +y * tileset.width];
                        if (otile) {
                            stage.setObjectTile(x, y, otile);
                        }
                    }
                }
                

                // 렌더링 데이터를 빌드한다
                stage.build();

                // 로딩 완료 콜백
                this.onStageLoadCompleted(stage, enterCutscene);
            });
        });
    }

    onStageLoadCompleted(stage, enterCutscene) {
        // 스테이지의 줌레벨을 결정한다
        stage.zoomTo(2, true);
        this.stage = stage;
        this.gamelayer.addChild(stage);

        // 페이드 인이 끝나면 게임을 시작한다
        this.currentMode = this.exploreMode;
        this.currentMode.cutscene = enterCutscene;
        this.currentMode.prepare();

        // 다시 암전을 밝힌다
        this.tweens.addTween(this.blackScreen, 1, { alpha: 0 }, 0, "easeOut", true, () => {
            this.currentMode.start();
        });
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