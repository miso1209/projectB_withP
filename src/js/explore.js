import ScriptPlay from './cutscene/scriptplay';
import AnimatedCharacter from './animatedcharacter';


export default class Explore {
    constructor(game) {
        this.game = game;
        this.cutscene = null;
        this.interactive = false;
    }

    prepare(x, y) {
        // 일단 플레이어 캐릭터중에 뭐를 화면에 보여줄지 결정해야한다
        this.controller = new AnimatedCharacter(1);
        this.controller.alpha = 0;
        this.game.stage.addCharacter(this.controller, x, y);
        this.game.stage.checkForFollowCharacter(this.controller, true);

        this.game.stage.onTouchObject = this.onTouchObject.bind(this);
        this.game.stage.onTileSelected = this.onTileSelected.bind(this);
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