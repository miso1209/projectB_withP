import path from 'path';
import ResourceManager from "./resource-manager";
import Tweens from "./tweens";
import Stage  from "./stage";
import CharacterFactory from "./characterFactory";

import Player  from "./player";
import Battle  from "./battle";
import Explore  from "./explore";

import TileSet from "./tiledmap";

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
        this.nextStageMode = null;

        this.resourceManager = new ResourceManager();


        // TODO :나중에 제거해야한다!!!
        // hitEffect or 화면 효과용 스크린을 설치. (다른곳으로 빼야할듯하다..)
        const whiteScreen = new PIXI.Sprite(PIXI.Texture.WHITE);
        whiteScreen.width = width + 128;
        whiteScreen.height = height + 128;
        whiteScreen.position.x = -64;
        whiteScreen.position.y = -64;
        whiteScreen.alpha = 0;
        pixi.stage.addChild(whiteScreen);
        this.whiteScreen = whiteScreen;
    }

    start(playerInfo) {
        // 플레이어 정보를 네트워크나 디스크로부터 읽어온 직후이다.
        // 플레이어가 어디에 위치 했는지 확인한다.
        // 플레이어 캐릭터를 만든다
        this.resourceManager.add("assets/night/atk_sw.json");
        this.resourceManager.add("assets/night/atk_nw.json");
        this.resourceManager.add("assets/night/idle_sw.json");
        this.resourceManager.add("assets/night/idle_nw.json");
        this.resourceManager.add("assets/night/walk_sw.json");
        this.resourceManager.add("assets/night/walk_nw.json");
        this.resourceManager.add("shadow.png", "assets/shadow.png");
        // 전투용 라이프 바 (지금 로딩할필요가 있을까?)
        this.resourceManager.add("pbar.png", "assets/pbar.png");
        this.resourceManager.add("pbar_r.png", "assets/pbar_r.png");
        this.resourceManager.add("pbar_g.png", "assets/pbar_g.png");
        this.resourceManager.add("pbar_o.png", "assets/pbar_o.png");
        // 몬스터용 데이터 (나중에 옮겨야 한다)
        this.resourceManager.add("assets/elid/elid_atk_nw.json");
        this.resourceManager.add("assets/elid/elid_atk_sw.json");
        this.resourceManager.add("assets/elid/elid_idle_nw.json");
        this.resourceManager.add("assets/elid/elid_idle_sw.json");

        this.resourceManager.add("assets/miluda/miluda_atk_sw.json");
        this.resourceManager.add("assets/miluda/miluda_atk_nw.json");
        this.resourceManager.add("assets/miluda/miluda_idle_sw.json");
        this.resourceManager.add("assets/miluda/miluda_idle_nw.json");

        this.resourceManager.add("assets/titan/monster2-atk_sw.json");
        this.resourceManager.add("assets/titan/monster2-idle_sw.json");

        this.resourceManager.add("assets/medusa/monster1-atk_sw.json");
        this.resourceManager.add("assets/medusa/monster1_idle_sw.json");
        
        // 이펙트
        this.resourceManager.add("assets/slash_1.json");
        this.resourceManager.add("assets/explosion.json");
        this.resourceManager.add("assets/shoted.json");
        this.resourceManager.add("fireBall.png", "assets/fireBall.png");
        this.resourceManager.add("arrow.png", "assets/arrow.png");

        // Character JSON Load
        CharacterFactory.loadCharacterJson();

        this.enterStage(playerInfo.stagePath, "explore");
    }

    enterStage(stagePath, mode) {
        this.nextStageMode = mode;
        if (this.currentStage) {
            // 기존 스테이지에서 나간다
            this.tweens.addTween(this.blackScreen, 1, { alpha: 1 }, 0, "easeIn", true, () => {
                this.gamelayer.removeChildren();

                // 화면 암전이 끝나면 로딩을 시작한다
                this.loadStage(stagePath, this.onStageLoadCompleted.bind(this));
            });
        } else {
            // 바로 로딩을 한다
            this.loadStage(stagePath, this.onStageLoadCompleted.bind(this));
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

    loadStage(stagePath, onLoadComplete) {

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

                if (!this.player) {
                    this.player = CharacterFactory.createPlayer(CharacterFactory.createCharacterSpec('hector'));
                }

                const stage = new Stage(mapData.width, mapData.height, mapData.tilewidth, mapData.tileheight);

                // 여기에 데이터를 입력한다
                const tileset = new TileSet(mapData);

                // 타일맵을 설정한다
                for (let y = 0; y < tileset.height;++y) {
                    for (let x = 0; x < tileset.width;++x) {
                        const gtile = tileset.groundLayer[x +y * tileset.width];
                        if (gtile) {
                            stage.setGroundTile(x, y, gtile);
                        }
                        const otile = tileset.objectLayer[x +y * tileset.width];
                        if (otile) {
                            stage.setObjectTile(x, y, otile);
                        }
                        //const tiles = tileset.getTilesAt(x, y);
                        //for(const tiledata of tiles)  {
                        //    stage.setTile(x, y, tiledata);
                        //}
                    }
                }
                

                // 렌더링 데이터를 빌드한다
                stage.build();

                // 로딩 완료 콜백
                if (onLoadComplete) {
                    onLoadComplete(stage);
                }
            });
        });
    }

    onStageLoadCompleted(stage) {
        // 스테이지의 줌레벨을 결정한다
        stage.zoomTo(2, true);
        this.stage = stage;
        this.gamelayer.addChild(stage);

        // 페이드 인이 끝나면 게임을 시작한다
        if (this.nextStageMode === "battle") {
            this.currentMode = this.battleMode;
        } else {
            this.currentMode = this.exploreMode;
        }
        this.nextStageMode = null;

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