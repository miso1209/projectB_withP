export default class Combiner {
    constructor() {
        this.recipes = {};
    }

    addRecipes(recipes, itemResources) {
        for(const recipe of recipes) {
            recipe.category = itemResources.getCategory(recipe.item);
            this.recipes[recipe.item] = recipe;
        }
    }

    getRecipes(category, inventory) {
        const result = [];
        // 해당 타입의 레시피를 반환한다
        // 인벤토리를 참고해서 활성하 비활성화를 표기한다
        for(const id in this.recipes) {
            const recipe = this.recipes[id];
            if (recipe.category === category) {
                recipe.owned = inventory.getCount(recipe.item);

                recipe.available = true;
                for(const mat of recipe.materials) {
                    mat.owned = inventory.getCount(mat.item);
                    recipe.available &= (mat.count <= mat.owned);
                }

                result.push(recipe);
            }
        }
        return result;
    }

    combine(id, inventory) {
        // 해당 아이템을 조합한다
        // 레시피를 보고 인벤토리에서 아이템을 제거한다
        // 모든 아이템 제거가 끝나면 새로운 아이템을 추가한다


        const recipe = this.recipes[id];
        if (!recipe) {
            throw Error("invalid recipe: " + id);
        }

        if (!this.isAvailable(id, inventory)) {
            throw Error("can not combine recipe: " + id);
        }

        for(const mat of recipe.materials) {
            inventory.deleteItem(mat.item, mat.count)
        }

        // 새로운 아이넴을 추가한다
        inventory.addItem(recipe.item);
    }

    isAvailable(id, inventory) {
        let available = true;
        const recipe = this.recipes[id];
        for(const mat of recipe.materials) {
            available &= (mat.count <= inventory.getCount(mat.item));
        }
        return available;

    }
}