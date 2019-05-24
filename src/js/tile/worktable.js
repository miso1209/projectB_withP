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
                }
            });
        }
    }
}
