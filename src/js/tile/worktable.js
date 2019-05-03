import Prop from './prop';
import ScriptPlay from '../field/cutscene/scriptplay';
import { DIRECTIONS } from '../define';

export default class WorkTable extends Prop {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.upgraded = false;
    }

    upgrade() {
        // 업그레이드를 한다
        this.tileTexture.texture = PIXI.Texture.fromFrame("house-worktable-upgrade.png");
        this.upgraded = true;
    }

    touch(game) {
        if (this.upgraded) {
            console.log("open worktable")
        } else {
            // 업그레이드 하시겠습니까 모달.을 띄운다
            const modal = game.ui.createConfirmModal("업그레이드 하시겠습니까?");
            modal.onConfirm = (confirmed) => {
                modal.onConfirm = null;
                if (confirmed) {
                    this.upgrade();

                    // 여기서 다음 컷신을 플레이한다.
                    // 슈퍼 울트라 하드코딩
                    // TODO : 이벤트를 써서 별도로 처리하도록 변경해야한다
                    const nextScene = new ScriptPlay([
                        {
                            command: "enterstage",
                            arguments: ["house", { x: 10, y: 14, direction: DIRECTIONS.NW, margin: 2}],
                        }, {
                            command: "dialog",
                            arguments: ["이런, 누군가가 쓰러져있잖아"],
                        }, {
                            command: "goto",
                            arguments: [2, 5],
                        }, {
                            command: "dialog",
                            arguments: ["으아아아!!!!!!"],
                        }, {
                            command: "dialog",
                            arguments: ["피.. 피가 엄청나다."],
                        }, {
                            command: "dialog",
                            arguments: ["..."],
                        }, {
                            command: "dialog",
                            arguments: ["살려주면 바닥.. 닦아놓겠지?"],
                        }
                    ]);

                    game.currentMode.cutscene = nextScene;
                    nextScene.play(game);
                }
            }
        }
    }
}
