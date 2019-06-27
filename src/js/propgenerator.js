import FloorMonsters from "./floormonsters";
import StoryMonsters from "./storymonsters";
import Character from "./character";
import Monster from "./monster";
import Items from "./items";

const RANK = {
    C: 'C',
    B: 'B',
    A: 'A',
    S: 'S',
    U: 'U',
    UNKNOWN: 'UNKNOWN'
};

export default class PropGenerator {
    constructor() {
    }
    createChest(currentFloor, isBoss) {
        const itemsByRanked = [
            {
                items: [1,2,3,4,5,6],
                ranks: [RANK.C, RANK.C, RANK.A]
            }, {
                items: [1,2,3,4,5,6],
                ranks: [RANK.C, RANK.B, RANK.S]
            }, {
                items: [1,2,3,4,5,6],
                ranks: [RANK.B, RANK.A, RANK.U]
            }
        ];

        let rewardsData = null;
        const rankIndex = this.getRank();
        rewardsData = itemsByRanked[rankIndex];
        rewardsData.items = rewardsData.items[Math.round(Math.random() * (rewardsData.items.length - 1))];

        const rewards = [];
        for (let i=0; i<rewardsData.items; i++) {
            const itemRank = rewardsData.ranks[this.getRank()];
            const item = this.getItem(currentFloor, itemRank);
            rewards.push({ id: item.id, owned: 1 });
        }

        let chest = {
            type: "chest",
            texture: PIXI.Texture.fromFrame('castle_treasurebox.png'),
            movable: false,
            xsize: 1,
            ysize: 2,
            rewards: rewards,
            rank: rankIndex
        };
        if (Math.random() <= 0.5) {
            chest = Object.assign(chest, {
                texture: PIXI.Texture.fromFrame('castle_treasurebox_flip.png'),
                xsize: 2,
                ysize: 1,
                imageOffset: { x:-16, y:0 },
                nameTagOffset: { x: -16, y: -8 }
            });
        }

        return chest;
    }

    createRecipe(floor, isBoss) {
        let success = false;
        const recipes = [];
        let rank = this.getOneOfAllRank().display;

        while (!success) {
            const filteredRecipes = [];
            for (let key in Items) {
                const item = Items[key];
                if (item.rank === rank && item.category === "valuables") {
                    filteredRecipes.push(item);
                }
            }
    
            filteredRecipes.forEach((item) => {
                if (item.generateFloor.begin <= floor && item.generateFloor.end >= floor) {
                    recipes.push(item);
                }
            });

            if (recipes.length === 0) {
                rank = this.getUnderRank(rank);
                if (rank === RANK.UNKNOWN) {
                    rank = RANK.C;
                    console.log('no rank, no floor', floor, rank);
                    floor--;
                }
                success = false;
            } else {
                success = true;
            }
        }

        const recipe = recipes[Math.round(Math.random() * (recipes.length - 1))];
        let recipeRank = (recipe.rank === 'U' || recipe.rank === 'S')?2:1;
        recipeRank -= recipe.rank === 'C'?1:0;
        // const anim = new PIXI.extras.AnimatedSprite(loadAniTexture('recipeshelf_1x1_sprite', 24));
        // anim.gotoAndStop(1);
        
        return {
            tileData: {
                type: "recipe",
                texture: PIXI.Texture.fromFrame('recipeshelf_front_1x1_flip.png'),
                movable: false,
                xsize: 1,
                ysize: 1,
                rank: recipeRank,
                recipe: recipe.id
            }
        }
    }

    createMonster(currentFloor, isBoss) {
        // 원래 필드에 C - U 까지 전부 나왔지만, 미들보스에서만 S - U등급의 몬스터가 나오는 것으로 변경.
        const monstersByRanked = [
            {
                monsters: [1,2,3],
                ranks: [RANK.C, RANK.B, RANK.A]
            }, {
                monsters: [2,3,4],
                ranks: [RANK.C, RANK.B, RANK.A]
                // ranks: [RANK.C, RANK.A, RANK.S]
            }, {
                monsters: [3,4,5],
                ranks: [RANK.C, RANK.B, RANK.A]
                // ranks: [RANK.B, RANK.A, RANK.U]
            }, {
                monsters: [4,5,6],
                ranks: [RANK.C, RANK.B, RANK.U]
            }, {
                monsters: [4,5,6],
                ranks: [RANK.B, RANK.A, RANK.S]
            }
        ];

        let monsterParty = null;
        if (isBoss) {
            monsterParty = monstersByRanked[3 + Math.round(Math.random())];
        } else {
            monsterParty = monstersByRanked[this.getRank()];
        }
        monsterParty.monsters = monsterParty.monsters[Math.round(Math.random() * (monsterParty.monsters.length - 1))];

        const monsters = [];
        for (let i=0; i<monsterParty.monsters; i++) {
            const monsterRank = monsterParty.ranks[this.getRank()];
            monsters.push(this.getMonster(currentFloor, monsterRank));
        }
        return new Monster(this.makeMonsterParty(monsters, currentFloor, isBoss));
    }

    createStoryMonster(type) {
        return new Monster(StoryMonsters[type]);
    }

    getOneOfAllRank() {
        /*
            몬스터의 Rank도 있지만,
            생성되는 몬스터의 질(급) 또한 랜덤으로 정해준다.
            C - U등급을 부여받으며, 각 올스텟 계수는 다음과 같다.

            C: 100%   (40%)
            B: 105%   (34%)
            A: 112%   (20%)
            S: 123%   ( 5%)
            U: 135%   ( 1%)

            => 편차가 너무 크고, 필드 몬스터가 보스보다 강해질 우려가 있기 때문에 편차를 줄여본다.
        */
        const rand = Math.random();

        if(rand <= 0.4) {
            return {
                strong: 1,
                display: 'C'
            }
        } else if(rand <= 0.74) {
            return {
                strong: 1.05,
                display: 'B'
            }
        } else if(rand <= 0.94) {
            return {
                strong: 1.12,
                display: 'A'
            }
        } else if(rand <= 0.99) {
            return {
                strong: 1.23,
                display: 'S'
            }
        } else {
            return {
                strong: 1.35,
                display: 'U'
            }
        }
    }

    getUnderRank(rank) {
        let resultRank = null;

        switch(rank) {
            case RANK.U:
                resultRank = RANK.S;
            break;

            case RANK.S:
                resultRank = RANK.A;
            break;

            case RANK.A:
                resultRank = RANK.B;
            break;

            case RANK.B:
                resultRank = RANK.C;
            break;

            case RANK.C:
                resultRank = RANK.UNKNOWN;
            break;
        }

        return resultRank;
    }

    getRank() {
        const probability = Math.random();
        let result = null;

        if (probability <= 0.75) {
            result = 0;
        } else if (probability <= 0.95) {
            result = 1;
        } else {
            result = 2;
        }

        return result;
    }

    getItem(floor, rank) {
        let success = false;
        const resultItems = [];

        while (!success) {
            const filteredItems = [];
            for (let key in Items) {
                const item = Items[key];
                if (item.rank === rank) {
                    filteredItems.push(item);
                }
            }
    
            filteredItems.forEach((item) => {
                if (item.generateFloor.begin <= floor && item.generateFloor.end >= floor) {
                    resultItems.push(item);
                }
            });

            if (resultItems.length === 0) {
                rank = this.getUnderRank(rank);
                if (rank === RANK.UNKNOWN) {
                    rank = RANK.C;
                    console.log('no rank, no floor', floor, rank);
                    floor--;
                }
                success = false;
            } else {
                success = true;
            }
        }

        const selectedItem = resultItems[Math.round(Math.random() * (resultItems.length - 1))];

        return selectedItem;
    }

    getMonster(floor, rank) {
        let success = false;
        const resultMonsters = [];

        while (!success) {
            const filteredMonsters = [];
            for (let key in FloorMonsters) {
                const monster = FloorMonsters[key];
                if (monster.rank === rank) {
                    filteredMonsters.push(monster);
                }
            }
    
            filteredMonsters.forEach((monster) => {
                if (monster.generateFloor.begin <= floor && monster.generateFloor.end >= floor) {
                    resultMonsters.push(monster);
                }
            });

            if (resultMonsters.length === 0) {
                rank = this.getUnderRank(rank);
                if (rank === RANK.UNKNOWN) {
                    rank = RANK.C;
                    console.log('no rank, no floor', floor, rank);
                    floor--;
                }
                success = false;
            } else {
                success = true;
            }
        }

        const selectedMonster = resultMonsters[Math.round(Math.random() * (resultMonsters.length - 1))];

        return selectedMonster;
    }

    makeMonsterParty(monsters, floor, isBoss) {
        const resultMonsterParty = {
            name: '',
            field: {
                character: null
            },
            battle: {
                characters: [

                ]
            },
            gold: 0,
            exp: 0,
            rewards: {

            }
        }

        let dps = 0;

        monsters.forEach((monster) => {
            // 몬스터의 Rank는 C - U까지 랜덤하게 생성하고, 100% - 150%의 강함을 가지자.
            const monsterRank = isBoss?{strong: 1.3, display:'U'}:this.getOneOfAllRank();
            const character = new Character(monster.character.id, monsterRank);
            character.level = monster.character.baseLevel + Math.floor(monster.character.levelUpPerFloor * floor);
            character.level += Math.round(Math.random() * 1.8);


            if (!resultMonsterParty.field.character || dps < character.totalPowerFigure) {
                dps = character.totalPowerFigure;
                resultMonsterParty.name = `Lv.${character.level} ${character.displayName}[${monster.rank}]`
                resultMonsterParty.field.character = monster.character.id;
            }

            resultMonsterParty.battle.characters.push({
                id: monster.character.id,
                level: character.level,
                rank: monsterRank
            });

            // rewards 추가. gold exp, rewards
            resultMonsterParty.gold += monster.gold + monster.goldPerLevel * character.level * character.rank.strong;
            resultMonsterParty.exp += monster.exp + monster.expPerLevel * character.level * character.rank.strong;

            monster.rewards.forEach((reward) => {
                if (Math.random() <= reward.probability) {
                    if (!resultMonsterParty.rewards[reward.item]) {
                        resultMonsterParty.rewards[reward.item] = 1;
                    } else {
                        resultMonsterParty.rewards[reward.item]++;
                    }
                }
            });
        });

        resultMonsterParty.exp = Math.round(resultMonsterParty.exp);
        resultMonsterParty.gold = Math.round(resultMonsterParty.gold);

        if (resultMonsterParty.exp <= 0) {
            resultMonsterParty.exp = 1;
        }
        
        return resultMonsterParty;
    }
}