import Monster from "./monster";
import Monsters from "./monsters";
import FloorMonsters from "./floormonsters";
import StoryMonsters from "./storymonsters";
import Character from "./character";

import Items from "./items";
import FloorRecipes from "./floorrecipes";
import FloorChests from "./floorchest";

const RANK_TO_NUM = {
    C: 0,
    B: 1,
    A: 1,
    S: 2,
    U: 2
};

export default class PropGenerator {
    constructor() {
    }
    createChest(floor) {
        const itemCount = 3 + Math.round(Math.random() * 3);
        const floorData = FloorChests[floor];
        const rewards = [];
        // 추후 해당 아이템들의 Rarity의 총합으로 어떤 상자인지 판정해야겟다. => 나올 수 있는 아이템 중 최고의 아이템 상위 n% 는 랭크가 높다 이런식으로 판별하자.
        const rewardsRank = 0;

        for (let i=0; i<itemCount; i++) {
            const items = [];
            for (let key in Items) {
                if (Items[key].category === 'material') {
                    const item = Object.assign({}, Items[key]);
                    items.push(item);
                }
            }

            // Leader Extract, push monster to party
            const itemData = this.getRarityItem(this.getFilteredItems(items, floorData));
            rewards.push({ id: itemData.id, owned: 1});
        }

        let chest = {
            type: "chest",
            texture: 'castle_treasurebox_sprite',
            isAnimationTile: true,
            animationLength: 24,
            movable: false,
            xsize: 1,
            ysize: 2,
            rewards: rewards,
            rank: rewardsRank
        };
        if (Math.random() <= 0.5) {
            chest = Object.assign(chest, {
                xsize: 2,
                ysize: 1,
                imageOffset: { x:-16, y:0 },
                nameTagOffset: { x: -16, y: -8 }
            });
        }

        return chest;
    }

    createRecipe(floor, inventory) {
        const floorData = FloorRecipes[floor];
        const recipes = [];
        const playerRecipes = [];
        
        for (let key in inventory.items) {
            const item = inventory.items[key];
            if (item.data.category === 'recipes') {
                playerRecipes.push(item.id);
            }
        }

        for (let key in Items) {
            const item = Object.assign({}, Items[key]);
            if((item.category === 'recipes') && playerRecipes.indexOf(key) < 0) {
                recipes.push(item);
            }
        }

        let selectedItem = this.getRarityItem(this.getFilteredItems(recipes, floorData));
        // 이미 레시피를 다 먹은경우 뭘 줘야 하는가?
        if (!selectedItem) {
            // 우선 소형포션 제작서를 넣어두자..
            selectedItem = {id:5001};
        }
        
        return {
            type: "recipe",
            texture: 'recipeshelf_1x1_sprite',
            isAnimationTile: true,
            animationLength: 24,
            movable: false,
            xsize: 1,
            ysize: 1,
            rank: RANK_TO_NUM[selectedItem.rank],
            recipe: selectedItem.id
        }
    }
    
    createMonster(floor, isBoss) {
        const partyLength = isBoss?(4 + Math.round(Math.random() * 2)):(2 + Math.round(Math.random() * 4));
        const floorData = FloorMonsters[floor];
        const monsterParty = {
            name : null,
            field: {
                character: null,
                direction: "sw",
                x: 0,
                y: 0
            },
            battle: {
                characters: []
            },
            gold: 0,
            exp: 0,
            rewards: {

            }
        };

        let leader = null;
        for (let i=0; i<partyLength; i++) {
            const monsters = [];
            for (let key in Monsters) {
                const monster = Object.assign({}, Monsters[key]);
                monsters.push(monster);
            }

            // Leader Extract, push monster to party
            const monsterData = this.getRarityItem(this.getFilteredItems(monsters, floorData));
            const monster = new Character(monsterData.character.id);
            monster.level = monsterData.character.baseLevel + Math.round(monsterData.character.levelUpPerFloor * (floor - 1));
            monster.level += isBoss?3:0; // Boss 일경우 3레벨 업.
            monsterParty.battle.characters.push({ id: monsterData.character.id, level: monster.level });

            if (leader === null || leader.totalPowerFigure <= monster.totalPowerFigure) {
                leader = monster;
            }

            // Rewards
            monsterParty.gold += monsterData.gold + monsterData.goldPerLevel * monster.level;
            monsterParty.exp += monsterData.exp + monsterData.expPerLevel * monster.level;

            // Item Rewards
           const rewardsItemList = [];
           monsterData.rewards.forEach((itemId) => {
               rewardsItemList.push(Items[itemId]);
           });

           const selectedItem = this.getRarityItem(rewardsItemList);
           if (monsterParty.rewards[selectedItem.id]) {
                monsterParty.rewards[selectedItem.id]++;
           } else {
                monsterParty.rewards[selectedItem.id] = 1;
           }
        }
        monsterParty.gold = Math.round(monsterParty.gold);
        monsterParty.exp = Math.round(monsterParty.exp);

        // Field Character set leader
        monsterParty.name = `Lv${leader.level}. ${leader.displayName}`;
        monsterParty.field.character = leader.id;

        if (monsterParty.exp === 0) {
            monsterParty.exp = 1;
        }

        return new Monster(monsterParty);
    }

    createStoryMonster(type) {
        return new Monster(StoryMonsters[type]);
    }

    getFilteredItems(list, filter) {
        const filteredList = [];

        for (let key in list) {
            const item = Object.assign({}, list[key]);

            if(item.score >= filter.boundedScore.min && item.score <= filter.boundedScore.max) {
                filteredList.push(item);
            }
        }
        
        return filteredList;
    }

    getRarityItem(list) {
        let rarity = 0;
        list.forEach((item) => {
            rarity += item.rarity;
        });

        // 레어리티는 높을수록 잘 안나오는 것 이기 때문에 역수로 계산하며, 누적하면서 자신의 랜덤 인덱스를 구한다.
        let totalRarity = 0;
        list.forEach((item) => {
            totalRarity += rarity / item.rarity;
            item.rarity = totalRarity;
        });

        let selectedItem = null;
        const randomIndex = Math.random() * totalRarity;
        for (let item of list) {
            // 당첨 된 레시피를 최종 레시피로 선정한다.
            if (randomIndex <= item.rarity) {
                selectedItem = item;
                break;
            }
        }

        return selectedItem;
    }
}