import EntranceDoor from "../field/cutscene/entrace-door";

// 포탈 이벤트
export default class Portal {
    constructor(game, stage, gridX, gridY, direction) {
        this.game = game;
        this.targetStage = stage;
        this.targetX = gridX;
        this.targetY = gridY;
        this.targetDirection = direction;
    }

    call() {
        // 이벤트가 호출되었다
        // 포탈이동용 컷신을 플레이한다.
        // TODO : 포탈이동용 컷신은 여러개가 있을수 있는데... 어떻게 하는게 좋을까
        // 일단은 지금은 하나이니까 하나로 하드코딩

        // TODO : 포탈에서 나가는 컷신은!?!! 

        
        // 월드 진입컷신을 만들어서 넣어준다.
        const enterCutscene = new EntranceDoor(this.game, this.targetX, this.targetY, this.targetDirection);
        this.game.enterStage("assets/mapdata/" + this.targetStage + ".json", enterCutscene);
    }
}