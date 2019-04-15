import ResourceManager from "./resource-manager";
import Tweens from "./tweens";
import Stage  from "./stage";
import { DIRECTIONS } from './define';

import Player  from "./player";
import Battle  from "./battle";
import Explore  from "./explore";

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
        // 전투는 별도 처리를 해야 할 듯하다
    }

    loadStage(stagePath, onLoadComplete) {
        // =======================================================
        // 전투 관련 하드 코딩이다. 나중에 스테이지 관련 핸들링을 변경하다
        // 전투로 넘어갈때는 스테이지 정보를 백업한다
        if (this.nextStageMode === "battle") {
            // 배틀로 갈때는 스테이지를 기록한다
            this.exploreMode.stage = this.stage;
            this.exploreMode.backupX = this.player.gridX;
            this.exploreMode.backupY = this.player.gridY;

        } else if (this.currentMode === this.battleMode) {
            // 전투에서 되돌아올때는 백업을 사용한다
            const backup = this.exploreMode.stage;
            this.exploreMode.fromBattle = true;
            this.exploreMode.stage = undefined;
            onLoadComplete(backup);
            return;
        }
        // =======================================================

        // 필요한 리소스를 로딩한다
        this.resourceManager.add("stage", stagePath);
        this.resourceManager.add("tiles.json", "assets/mapdata/tiles.json");
        this.resourceManager.add("tiles.png", "assets/mapdata/tiles.png");
        this.resourceManager.add("objects.json", "assets/mapdata/objects.json");
        this.resourceManager.add("objects.png", "assets/mapdata/objects.png");
        this.resourceManager.add("walls.json", "assets/mapdata/walls.json");
        this.resourceManager.add("walls.png", "assets/mapdata/walls.png");
        this.resourceManager.add("window_light.png", "assets/window_light.png");
        this.resourceManager.add("torch_light.png", "assets/torch_light.png");
        this.resourceManager.add("background.png", "assets/background.png");
        this.resourceManager.add("stealBarL.png", "assets/mapdata/stealBarL.png");
        this.resourceManager.add("stealBarR.png", "assets/mapdata/stealBarR.png");

    

        this.resourceManager.load((resources) => {
            if (!this.player) {
                this.player = new Player();
            }

            const mapData = resources["stage"].data; // 이것은 규칙을 정한다
            const stage = new Stage(mapData.width, mapData.height, mapData.tilewidth, mapData.tileheight);

            // 타일셋을 먼저 등록한다
            for (const tileset of mapData.tilesets) {
                const tiles = resources[tileset.source].data;
                const prefix = tileset.source.replace('.json', '_');
                const idStart = tileset.firstgid;

                // ======================================================
                // 타일안에 디테일 데이터가 있으면 별도로 처리한다
                const customTileData = {};
                if (tiles.tiles) {
                    for (const data of tiles.tiles) {
                        const custom = {};
                        // 애니메이션 정보 복사
                        if (data.animation) {
                            custom.animations = [];
                            for(const anim of data.animation) {
                                custom.animations.push({
                                    duration: anim.duration,
                                    textureName: prefix + anim.tileid + ".png",
                                })
                            }
                        }
                        // 커스텀 프라퍼티 복사
                        for( const property of data.properties) {
                            if (property.name === "movable") {
                                custom.movable = property.value;
                            }
                            else if(property.name === "objectType") {
                                custom.objectType = property.value;
                            } 
                            else if (property.name === "tag") {
                                custom.tags = property.value.split(';');
                            }
                            else if (property.name === "direction") {
                                custom.direction = (property.value === "left") ? DIRECTIONS.SW : DIRECTIONS.SE;
                            }
                        }
                        customTileData[data.id + idStart] = custom;
                    }
                }
                // ======================================================

                for (let i = 0; i < tiles.tilecount; ++i) {

                    const textureName = prefix + i + ".png";
                    if (!PIXI.utils.TextureCache[textureName]) {

                        const image = resources[tiles.image].data;

                        const x = i % tiles.columns;
                        const y = Math.floor(i / tiles.columns);
                        const c = document.createElement('canvas');
                        c.width = tiles.tilewidth + 2; 
                        c.height = tiles.tileheight + 2;
                        const context = c.getContext('2d');
                        context.drawImage(image, x * tiles.tilewidth, y * tiles.tileheight, tiles.tilewidth, tiles.tileheight, 1, 1, tiles.tilewidth, tiles.tileheight);
                        const texture = PIXI.Texture.fromCanvas(c, new PIXI.Rectangle (1, 1, tiles.tilewidth, tiles.tileheight));
                        PIXI.Texture.addToCache(texture, textureName);
                    }
                    // TODO : 나중에 타일매니져로 교체한다
                    stage.addTile(i+idStart, textureName, customTileData[i + idStart]); 
                }
            }

            // 타일맵을 설정한다
            for (const layer of mapData.layers) {
                for (let y = 0; y < layer.height;++y) {
                    for (let x = 0; x < layer.width;++x) {
                        // 맵툴문제 때문에 90 도를 뒤집어야 한다
                        const index =  y + (layer.width - x -1) * layer.width;
                        const tileId = layer.data[index];

                        // 90 도 회전시킨다.
                        if (layer.name === "Tiles") {
                            // 타일
                            stage.setGroundTile(x, y, tileId);
                        } else {
                            // 오브젝트이다
                            stage.setObjectTile(x, y, tileId);
                        }

                        // 특수 타일 처리
                        // 이 특수타일들에 대한 정보를 나중에 별도의 데이터로 분리해야한다.
                        // { tileid , tiletype }
                        // 앵커를 없애고 타일좌표로 맞추는것이 필요할지도 모르겠다.
                        if (tileId === 282) {
                            // 윈도우
                            const light = new PIXI.Sprite(PIXI.Texture.fromFrame("window_light.png"));
                            light.anchor.x = 1;
                            light.position.x = stage.getTilePosXFor(x, y) + 15;
                            light.position.y = stage.getTilePosYFor(x, y) + stage.TILE_HALF_H - 71;
                            light.blendMode = PIXI.BLEND_MODES.ADD;
                            stage.overlayContainer.addChild(light)
                        } else if (tileId === 279) {
                            // 토치 라이트
                            const light = new PIXI.Sprite(PIXI.Texture.fromFrame("torch_light.png"));
                            light.anchor.x = 0.5;
                            light.anchor.y = 0.5;
                            light.position.x = stage.getTilePosXFor(x, y) + 16;
                            light.position.y = stage.getTilePosYFor(x, y) + stage.TILE_HALF_H - 69;
                            light.blendMode = PIXI.BLEND_MODES.ADD;
                            stage.overlayContainer.addChild(light)
                        }
                    }
                }
            }

            // 렌더링 데이터를 빌드한다
            stage.build();

            // 로딩 완료 콜백
            if (onLoadComplete) {
                onLoadComplete(stage);
            }
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