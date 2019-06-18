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
        };

        $t();
    }
}

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
        // 월드 진입컷신을 만들어서 넣어준다.
        const $t = async () => {
            await game.$leaveStage(this.from)
            await game.$enterStageIns(this.targetStage, this.to);
        };

        $t();
    }
}

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
        let direciton = '';
        if (this.direction === DIRECTIONS.NW) {
            direciton = 'left';
        } else if(this.direction === DIRECTIONS.NE) {
            direciton = 'up';
        }
        // 월드 진입컷신을 만들어서 넣어준다.
        const $t = async () => {
            await game.$nextFloor(this.from, direciton);
        };

        $t();
    }
}