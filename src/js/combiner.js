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

    getRecipes(player) {
        const inventory = player.inventory;
        let level = 1;
        const sorting = {
            weapon: 1,
            armor: 2,
            accessory: 3,
            material: 4,
            consumables: 5,
            recipes: 6
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
        for (let key in player.characters) {
            const character = player.characters[key];
            level = level<=character.level?character.level:level;
        }
        inventory.forEach((item) => {
            if (item.category === 'recipes') {
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
                recipe.available = this.isAvailable(recipe.id, inventory, level).success;
                recipe.reason = this.isAvailable(recipe.id, inventory, level).reason;
                for(const mat of recipe.materials) {
                    mat.owned = inventory.getCount(mat.item);
                    mat.data = items[mat.item];
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

        if(!recipe.available) {
            throw Error("can not combine recipe: " + id);
        }

        for(const mat of recipe.materials) {
            inventory.deleteItem(mat.item, mat.count);
        }
        inventory.gold -= recipe.gold;

        // Rank 판독해서 리턴하자 확률은 다음과 같이 정의해보자.
        /*
            C: 40%
            B: 30%
            A: 20%
            S: 7%
            U: 3%
        */
       let rank = '';
        if (this.isEquipable(recipe.item)) {
            const rand = Math.random();

            if (rand <= 0.4) {
            } else if (rand <= 0.7) {
                rank = 'B';
            } else if (rand <= 0.9) {
                rank = 'A';
            } else if (rand <= 0.97) {
                rank = 'S';
            } else {
                rank = 'U';
            }
        }

        // 새로운 아이넴을 추가한다
        inventory.addItem(`${rank}${recipe.item}`);
        return true;
    }

    isEquipable(id) {
        let result = false;

        result |= items[id].category === 'weapon';
        result |= items[id].category === 'armor';
        result |= items[id].category === 'accessory';

        return result;
    }

    isAvailable(id, inventory, level) {
        const result = {
            success: true,
            reason: []
        };
        const recipe = recipes[id];
        for(const mat of recipe.materials) {
            result.success &= (mat.count <= inventory.getCount(mat.item));
        }
        
        // result.reason += result.success?'':'[재료 부족]';

        // result.success &= (recipe.gold <= inventory.gold);
        // result.reason += (recipe.gold <= inventory.gold)?'':'[Gold 부족]';

        // result.success &= (recipe.level <= level);
        // result.reason += (recipe.level <= level)?'':'[제한레벨 미달.]';

        result.reason.push(result.success?{materials: true}:{materials: false});
        
        result.success &= (recipe.gold <= inventory.gold);
        result.reason.push((recipe.gold <= inventory.gold)?{gold: true}:{gold: false});

        result.success &= (recipe.level <= level);
        result.reason.push((recipe.level <= level)?{level: true}:{level: false});
        
        // console.log(result);
        
        return result;

    }
}