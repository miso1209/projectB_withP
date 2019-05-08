import FieldCharacter from './fieldcharacter';
import { DIRECTIONS } from './define';
import ScriptPlay from './cutscene/scriptplay';
import Portal from './event/portal';


export default class Explore {
    constructor(game) {
        this.game = game;
        this.cutscene = null;
        this.interactive = false;
    }

    prepare(x, y) {
        this.controller = new FieldCharacter(this.game.player.controlCharacter);
        //this.setInteractive(false);

        // 컷신준비를 한다
        //if (this.cutscene) 
        {
            //this.controller.alpha = 0;
            //this.cutscene.setCharacter(this.controller);
            
            //this.game.ui.showTheaterScreen(0);
            //this.game.stage.showPathHighlight = false;
        }  /*else {
            // 스테이지의 기본 스폰 포인트를 찾아야 한다!!
            this.game.stage.addCharacter(this.controller, 4, 4);
            this.game.stage.checkForFollowCharacter(this.controller, true);
        }*/

        this.controller.alpha = 0;
        this.game.stage.addCharacter(this.controller, x, y);
        this.game.stage.checkForFollowCharacter(this.controller, true);

        this.game.stage.onTouchObject = this.onTouchObject.bind(this);
        this.game.stage.onTileSelected = this.onTileSelected.bind(this);

        //=====================================================================
        // 포탈을 하드코딩으로 설치한다
        // 나중에 데이터로 빼자
        if (this.game.stage.name === "house") {
            this.game.stage.events[250] = new Portal(this.game, {x:10, y: 15, direction: DIRECTIONS.SE, margin:1}, {stage: "house-room", x: 0, y: 1, direction: DIRECTIONS.SE, margin: 2});
            this.game.stage.events[251] = new Portal(this.game, {x:11, y: 15, direction: DIRECTIONS.SE, margin:1}, {stage: "house-room", x: 1, y: 1, direction: DIRECTIONS.SE, margin: 2});

            this.game.stage.events[0] = new Portal(this.game, {x:0, y:0, direction:DIRECTIONS.NW, margin: 1}, {stage: "open_road_1", x:44, y:23, direction:DIRECTIONS.SW, margin:1});
            this.game.stage.events[1] = new Portal(this.game, {x:1, y:0, direction:DIRECTIONS.NW, margin: 1}, {stage: "open_road_1", x:44, y:22, direction:DIRECTIONS.SW, margin:1});
        } else if (this.game.stage.name === "house-room") {
            this.game.stage.events[0] = new Portal(this.game, {x:0, y:0, direction: DIRECTIONS.NW, margin:1 }, {stage: "house", x:10, y:14, direction: DIRECTIONS.NW, margin:2});
            this.game.stage.events[1] = new Portal(this.game, {x:1, y:0, direction: DIRECTIONS.NW, margin:1 }, {stage: "house", x:11, y:14, direction: DIRECTIONS.NW, margin:2});
        } else if (this.game.stage.name === "open_road_1") {
            this.game.stage.events[1145] = new Portal(this.game, {x: 45, y:22, direction:DIRECTIONS.NE, margin:1}, {stage: "house", x:1, y:1, direction:DIRECTIONS.SE, margin:2});
            this.game.stage.events[1195] = new Portal(this.game, {x: 45, y:23, direction:DIRECTIONS.NE, margin:1}, {stage: "house", x:0, y:1, direction:DIRECTIONS.SE, margin:2});
        }
        //=====================================================================
    }

    start() {
        // 진입 컷신이 없을 수 있다.
        if (this.cutscene) {
            // 플레이어 컷
            this.cutscene.once('complete', () => {
                if (this.game.player.hasTag("tutorial")) {
                    this.endCutscene();
                } else {
                    this.game.player.addTag("tutorial")
                    this.cutscene = new ScriptPlay();
                    this.cutscene.once('complete', () => { this.endCutscene(); });
                    this.cutscene.play(this.game);
                }
            });
            this.cutscene.play();
        } else {
            
        }
    }

    startCutscene() {
        this.setInteractive(false);
        this.game.stage.showPathHighlight = false;
    }

    endCutscene() {
        this.game.stage.showPathHighlight = true;
        this.setInteractive(true);
    }

    onGameClick(event) {
        // ui 가 클릭되었는지 확인

        if (this.interactive) {
            if (this.game.stage) {
                this.game.stage.checkForTileClick(event.data);
            }
        }
    }

    onTouchObject(obj) {
        if (obj) {
            obj.touch(this.game);
        }
    }

    onForegroundClick(event) {
        // ui 클릭을 만들어야 한다
    }

    onTileSelected(x, y) {
        // 해당 타일이 이동가능한 타일인가?
        const target =  this.game.stage.getObjectAt(x, y);
        this.target = target;
        // 해당 타일에 무엇이 있는지 확인한다
        // 목표에 도착했을때 타겟에 대한 인터랙션을 어떻게 하지?

        // 이동 루틴을 다시 만들어야 한다
        // 타겟이 있을때에는 타겟을 제외한 패스가 만들어졌을때 마지막 패스끝에 타겟 인터랙션을 달아야 한다.
        // 패스가 만들어지지 않으면, 타겟팅을 지정하지 않고 근접한 곳까지 이동한다
        this.game.stage.moveCharacter(this.controller, x, y);
    }

    update() {
    }

    setInteractive(flag) {
        this.interactive = flag;
    }
}