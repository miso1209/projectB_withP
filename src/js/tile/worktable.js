import Prop from './prop';

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
            const recipes = game.getRecipes('consumables');
            game.emit('combine-open', [{category: 'consumables', recipes: recipes}]);
        } else {
            // 업그레이드 하시겠습니까 모달.을 띄운다
            game.emit('confirm-show', "업그레이드 하시겠습니까?", (confirmed) => {
                if (confirmed === "ok") {
                    game.addTag("worktable");
                    this.upgrade();
/*
                    // 여기서 다음 컷신을 플레이한다.
                    // 슈퍼 울트라 하드코딩
                    // TODO : 이벤트를 써서 별도로 처리하도록 변경해야한다
                    const script = [
                        { 
                            command: "leavestage",
                            arguments: [] 
                        }, {
                            command: "enterstage",
                            arguments: ["house", { x: 10, y: 14, direction: DIRECTIONS.NW, margin: 2}],
                        }, {
                            command: "dialog",
                            arguments: [ {text:"이런, 누군가가 쓰러져있잖아", speaker: 1}]
                        }, {
                            command: "goto",
                            arguments: [2, 5],
                        }, {
                            command: "dialog",
                            arguments: [
                                {text: "으아아아!!!!!!", speaker: 1},
                                {text: "피.. 피가 엄청나다.", speaker: 1},
                                {text: "...", speaker: 1},
                                {text: "살려주면 바닥.. 닦아놓겠지?", speaker: 1}
                            ]
                        }
                    ]
                    game.playCutscene(script);*/
                }
            });
        }
    }
}
