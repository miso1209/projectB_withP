import PropBase from './propbase';
import Item from '../item';

export default class WorkTable extends PropBase {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.upgraded = false;
        this.nameTagOffset = {
            x: -30,
            y: 0
        };
        this.name = "빈 탁자";
    }

    getName() {
        return this.name;
    }

    applyTag(tag) {
        if (tag === "worktable") {
            this.upgrade();
        }
    }

    upgrade() {
        // 업그레이드를 한다
        this.tileTexture.texture = PIXI.Texture.fromFrame("house-worktable-upgrade.png");
        this.name = "작업용 테이블";
        this.hideName();
        this.upgraded = true;
    }

    touch(game) {
        if (this.upgraded) {
            const recipes = game.getRecipes();
            Sound.playSound('table.wav', { singleInstance: true });
            game.ui.showCombineItemList(recipes, (recipe, count) => {
                // TODO : 나중에 아이템 이름과 아이콘을 표시할수 있도록 하자
                game.ui.showCraftUI(count, () => {
                    count = count?count:1;
                    count = count<=recipe.maxCount?count:recipe.maxCount;
                    const result = game.combine(recipe.id, count);
                    const resultItems = [];
                    for (let key in result.items) {
                        resultItems.push(new Item(key, result.items[key]));
                    }
                    game.ui.showItemAcquire(null, resultItems);
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
                    };

                    t();
                }
            });
        }
    }

}
