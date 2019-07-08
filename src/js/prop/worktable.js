import PropBase from './propbase';
import Item from '../item';

export default class WorkTable extends PropBase {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.upgraded = false;
    }

    applyTag(tag) {
        if (tag === "worktable") {
            this.upgrade();
        }
    }

    upgrade() {
        // 업그레이드를 한다
        this.tileTexture.texture = PIXI.Texture.fromFrame("house-worktable-upgrade.png");
        this.upgraded = true;
    }

    touch(game) {
        if (this.upgraded) {
            const recipes = game.getRecipes();
            game.ui.showCombineItemList(recipes, (recipe) => {
                // TODO : 나중에 아이템 이름과 아이콘을 표시할수 있도록 하자
                game.ui.showCraftUI(null, () => {
                    game.combine(recipe.id);
                    // 아이템 획득 UI 를 표시한다
                    // const inst = game.player.inventory.getItem(recipe.item);

                    // 제작한 아이템은 전부 1개씩만 만들어 진다는 가정 하, => 실제로도 Recipes에서 획득 갯수를 안적어 두기도 했고..
                    // => 한개라는 의미.. => 사실 여러개를 제작할 수 있는 것 아닌가? 무튼.. 그것은 추후 생각
                    // ex) 생선 1개로 떡밥을 제작할 경우 => 떡밥 10개가 만들어 질 수 있다고 생각한다.
                    const inst = new Item(recipe.item, 1);
                    game.ui.showItemAcquire(null, inst);
                })
            });
        } else {
            // 업그레이드 하시겠습니까 모달.을 띄운다
            game.ui.showConfirmModal("업그레이드 하시겠습니까?", true, (confirmed) => {
                if (confirmed === "ok") {
                    const t = async () => {
                        game.addTag("worktable");
                        game.exploreMode.interactive = false;
                        await game.$fadeOut(1);
                        this.upgrade();
                        await game.$fadeIn(1);
                        game.exploreMode.interactive = true;
                        game.completeQuest(1);
                    };

                    t();
                }
            });
        }
    }

}
