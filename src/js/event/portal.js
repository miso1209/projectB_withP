import { getDirectionFromName } from "../utils";

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
        game.playCutscene([
            { command: "leavestage", arguments: [this.from] },
            { command: "enterstage", arguments: [this.targetStage, this.to] },
        ]);
    }
}