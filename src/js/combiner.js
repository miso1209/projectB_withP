import recipes from './recipes';
import items from './items';

function filter(category, callback) {
    for(const id in recipes) {
        const recipe = recipes[id];
        if (items[recipe.item].category === category) {
            callback(recipe);
        }
    }
}

export default class Combiner {
    constructor() {
    }

    getRecipes(inventory) {
        const sorting = {
            weapon: 1,
            armor: 2,
            accessory: 3,
            material: 4,
            consumables: 5,
            valuables: 6
        };
        const rankSorting = {
            U: 1,
            S: 2,
            A: 3,
            B: 4,
            C: 5
        };
        const result = [];
        const playerRecipes = {};
        inventory.forEach((item) => {
            if (item.category === 'valuables') {
                const itemId = recipes[item.id].item;
                const recipeItem = items[itemId];

                if (!playerRecipes[recipeItem.category]) {
                    playerRecipes[recipeItem.category] = [];
                }
                playerRecipes[recipeItem.category].push(recipes[item.id]);
            }
        });

        for (let key in playerRecipes) {
            playerRecipes[key].forEach((recipe) => {
                recipe.owned = inventory.getCount(recipe.item);
                recipe.data = items[recipe.item];
                recipe.available = true;
                for(const mat of recipe.materials) {
                    mat.owned = inventory.getCount(mat.item);
                    mat.data = items[mat.item];
    
                    recipe.available &= (mat.count <= mat.owned);
                }
            });
            
            playerRecipes[key].sort((a,b) => {
                if (a.data.id > b.data.id) {
                    return -1;
                }
                return 1;
            });

            playerRecipes[key].sort((a,b) => {
                if (rankSorting[a.data.rank] < rankSorting[b.data.rank]) {
                    return -1;
                }
                return 1;
            });

            result.push({
                category: key,
                recipes: playerRecipes[key]
            });
        }

        result.sort((a,b) => {
            if (sorting[a.category] < sorting[b.category]) {
                return -1;
            }
            return 1;
        });

        return result;
    }

    combine(id, inventory) {
        // 해당 아이템을 조합한다
        // 레시피를 보고 인벤토리에서 아이템을 제거한다
        // 모든 아이템 제거가 끝나면 새로운 아이템을 추가한다

        const recipe = recipes[id];
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
        const recipe = recipes[id];
        for(const mat of recipe.materials) {
            available &= (mat.count <= inventory.getCount(mat.item));
        }
        return available;

    }
}