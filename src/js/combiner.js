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
                const isAvailableResult = this.isAvailable(recipe.id, inventory, level);
                recipe.owned = inventory.getCount(recipe.item);
                recipe.data = items[recipe.item];
                recipe.available = isAvailableResult.success;
                recipe.reason = isAvailableResult.reason;
                recipe.maxCount = isAvailableResult.maxCount;
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

        // 랜덤한 재련값을 가지도록 하자. 추후 재련이 생기기 전까지는..
        /*
            +0  : 20%, +1  : 16%
            +2  : 13%, +3  : 11%
            +4  : 9%, +5  : 8%
            +6  : 7%, +7  : 6%
            +8  : 5%, +9  : 3%, +10 : 2% 
        */
        // let reinforce = '';
        // let reinRand = [0.2, 0.16, 0.13, 0.11, 0.09, 0.08, 0.07, 0.06, 0.05, 0.03, 0.02];
        // if (this.isEquipable(recipe.item)) {
        //     const rand = Math.random();
        //     let sum = 0;
        //     reinRand.forEach((comp, i) => {
        //         if (rand > sum && rand <= sum + comp) {
        //             sum += sum;
        //         }
        //     });
        // }

        // 새로운 아이넴을 추가한다 ${reinforce}
        inventory.addItem(`${rank}${recipe.item}`);
        return {
            item: `${rank}${recipe.item}`,
            success: true
        };
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
            reason: [],
            maxCount: 0
        };
        const recipe = recipes[id];
        for(const mat of recipe.materials) {
            result.success &= (mat.count * 1 <= inventory.getCount(mat.item));
        }
        result.reason.push(result.success?{materials: true}:{materials: false});
        
        result.success &= (recipe.gold * 1 <= inventory.gold);
        result.reason.push((recipe.gold * 1 <= inventory.gold)?{gold: true}:{gold: false});

        result.success &= (recipe.level <= level);
        result.reason.push((recipe.level <= level)?{level: true}:{level: false});
        
        result.maxCount = this.getMaxCount(recipe, inventory, level);

        return result;
    }

    getMaxCount(recipe, inventory) {
        let maxCount = 0;

        for (let i=0; i<=10; i++) {
            let success = true;
            for(const mat of recipe.materials) {
                success &= (mat.count * i <= inventory.getCount(mat.item));
            }
            success &= (recipe.gold * i <= inventory.gold);
            
            if (success) {
                maxCount = i;
            } else {
                break;
            }
        }

        return maxCount;
    }
}