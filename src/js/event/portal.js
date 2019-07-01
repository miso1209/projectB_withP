import { getDirectionFromName } from "../utils";
import { DIRECTIONS } from "../define";
import Explore from "../explore";

// 포탈 이벤트
export class Portal2 {
    constructor(x,y, src) {
        this.name = src.name;
        this.gridX = x;
        this.gridY = y;

        this.direction = getDirectionFromName(src.direction);
        this.targetStage = src.targetstage
        this.from = src.name;
        this.to = src.target;
        this.forceStop = true;
    }


    touch(game) {
        // 월드 진입컷신을 만들어서 넣어준다.
        const $t = async () => {
            game.exploreMode.interactive = false;
            game.stage.showPathHighlight = false;
            game.ui.showTheaterUI(0.5);
            game.ui.hideMenu();

            await game.$leaveStage(this.from)
            await game.$enterStage("assets/mapdata/" + this.targetStage + ".json", this.to);

            game.exploreMode.interactive = true;
            game.stage.showPathHighlight = true;
            game.ui.hideTheaterUI(0.5);
            game.ui.showMenu();
            game.stage.enter();
        };

        $t();
    }
}

// Touch가 아니라, 밟았을 때 작동하는 포털이다.
export class Portal5 {
    constructor(x,y, src) {
        this.name = src.name;
        this.gridX = x;
        this.gridY = y;

        this.direction = getDirectionFromName(src.direction);
        this.targetStage = src.targetstage
        this.from = src.name;
        this.to = src.target;
        this.forceStop = true;
    }

    touch(game) {
    }

    onEvent(game) {
        // 월드 진입컷신을 만들어서 넣어준다.
        const $t = async () => {
            game.stage.stopObject(game.stage.player);
            game.exploreMode.interactive = false;
            game.stage.showPathHighlight = false;
            game.ui.showTheaterUI(0.5);
            game.ui.hideMenu();

            await game.$leaveStage(this.from)
            await game.$enterStage("assets/mapdata/" + this.targetStage + ".json", this.to);

            game.exploreMode.interactive = true;
            game.stage.showPathHighlight = true;
            game.ui.hideTheaterUI(0.5);
            game.ui.showMenu();
            game.stage.enter();
        };

        $t();
    }
}

// 스테이지의 경로가 아니라, 스테이지 객체를 넘겨줄 때 사용하는 포털이다. (밟았을 때 작동.)
export class Portal3 {
    constructor(x,y, src) {
        this.name = src.name;
        this.gridX = x;
        this.gridY = y;

        this.direction = getDirectionFromName(src.direction);
        this.targetStage = src.targetstage
        this.from = src.name;
        this.to = src.target;
        this.forceStop = true;
    }
    onEvent(game) {
        // 월드 진입컷신을 만들어서 넣어준다.
        game.stage.stopObject(game.stage.player);
        const $t = async () => {
            await game.$leaveStage(this.from)
            await game.$enterStageIns(this.targetStage, this.to);
        };

        $t();
    }

    touch(game) {
    }
}

// 실제로 작동하는 포털은 아니지만, 플레이어의 Input 위치만을 알려주는 포털이다 ( Hall의 경우 입구로 들어오지만, 해당 입구는 이벤트가 없음 )
export class Portal4 {
    constructor(x,y, src) {
        this.name = src.name;
        this.gridX = x;
        this.gridY = y;

        this.direction = getDirectionFromName(src.direction);
        this.targetStage = src.targetstage
        this.from = src.name;
        this.to = src.target;
        this.forceStop = true;
    }

    onEvent(game) {
        // 월드 진입컷신을 만들어서 넣어준다.
        const $t = async () => {
        };

        $t();
    }

    touch(game) {
        // 월드 진입컷신을 만들어서 넣어준다.
        const $t = async () => {
        };

        $t();
    }
}

// 층을 갈아엎을때 사용되는 포털이다 => 새로운 인스턴트 던전( 새로운 층 )을 생성할때 사용되는 포털이다.
export class NextFloorPortal {
    constructor(x,y, src) {
        this.name = src.name;
        this.gridX = x;
        this.gridY = y;

        this.direction = getDirectionFromName(src.direction);
        this.targetStage = src.targetstage
        this.from = src.name;
        this.to = src.target;
        this.forceStop = true;
    }

    onEvent(game) {
        let direciton = '';
        if (this.direction === DIRECTIONS.NW) {
            direciton = 'left';
        } else if(this.direction === DIRECTIONS.NE) {
            direciton = 'up';
        }
        game.stage.stopObject(game.stage.player);
        // 월드 진입컷신을 만들어서 넣어준다.
        const $t = async () => {
            await game.$nextFloor(this.from, direciton);
        };

        $t();
    }


    touch(game) {
        const $t = async () => {
        };

        $t();
    }
}