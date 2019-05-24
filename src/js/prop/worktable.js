import PropBase from './propbase';

export default class WorkTable extends PropBase {
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
            const data = [{category: 'consumables', recipes: recipes}];
            game.ui.showCombineItemList(data, (item) => {
                // TODO : 나중에 아이템 이름과 아이콘을 표시할수 있도록 하자
                game.ui.showCraftUI(null, () => {
                    game.combine(item.item);
                    // 아이템 획득 UI 를 표시한다
                    const inst = game.player.inventory.getItem(item.item);
                    game.ui.showItemAquire(inst);
                })
            });
        } else {
            // 업그레이드 하시겠습니까 모달.을 띄운다
            game.ui.showConfirmModal("업그레이드 하시겠습니까?", (confirmed) => {
                if (confirmed === "ok") {
                    game.addTag("worktable");
                    this.upgrade();
                }
            });
        }
    }

    getName() {
        if (this.upgraded) {
            return '작업대';
        } else {
            return '빈탁자';
        }
    }
}
