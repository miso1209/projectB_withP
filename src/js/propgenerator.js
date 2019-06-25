import monsters from "./floormonsters";
import Character from "./character";
import Monster from "./monster";
const RANK = {
    C: 'C',
    B: 'B',
    A: 'A',
    S: 'S',
    U: 'U'
};

export default class PropGenerator {
    constructor() {
    }

    getMonster(floor, rank) {
        let success = false;
        const resultMonsters = [];

        while (!success) {
            const filteredMonsters = [];
            for (let key in monsters) {
                const monster = monsters[key];
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
                success = false;
            } else {
                success = true;
            }
        }

        const selectedMonster = resultMonsters[Math.round(Math.random() * (resultMonsters.length - 1))];

        return selectedMonster;
    }

    makeMonsterParty(monsters, floor) {
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
            const character = new Character(monster.character.id);
            character.level = monster.character.baseLevel + Math.floor(monster.character.levelUpPerFloor * floor);
            character.level += Math.round(Math.random() * 1.8);
            if (!resultMonsterParty.field.character || dps < character.totalPowerFigure) {
                dps = character.totalPowerFigure;
                resultMonsterParty.name = `Lv.${character.level} ${character.displayName}[${monster.rank}]`
                resultMonsterParty.field.character = monster.character.id;
            }

            resultMonsterParty.battle.characters.push({
                id: monster.character.id,
                level: character.level
            });

            // rewards 추가. gold exp, rewards
            resultMonsterParty.gold += monster.gold + Math.round(monster.goldPerLevel * character.level);
            resultMonsterParty.exp += monster.exp + Math.round(monster.expPerLevel * character.level);

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
        return resultMonsterParty;
    }

    createMonster(currentFloor) {
        const monstersByRanked = [
            {
                monsters: [1,2,3],
                ranks: [RANK.C, RANK.B, RANK.A]
            }, {
                monsters: [2,3,4],
                ranks: [RANK.C, RANK.A, RANK.S]
            }, {
                monsters: [3,4,5],
                ranks: [RANK.B, RANK.A, RANK.U]
            }
        ];
        const monsterParty = monstersByRanked[this.getRank()];
        monsterParty.monsters = monsterParty.monsters[Math.round(Math.random() * (monsterParty.monsters.length - 1))];

        const monsters = [];
        for (let i=0; i<monsterParty.monsters; i++) {
            const monsterRank = monsterParty.ranks[this.getRank()];
            monsters.push(this.getMonster(currentFloor, monsterRank));
        }
        return new Monster(this.makeMonsterParty(monsters, currentFloor));
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
                console.log('rank error');
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
}