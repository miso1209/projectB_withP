import items from "./items";

export default class DevConsole {
    constructor() {
        const names = Object.getOwnPropertyNames(DevConsole.prototype);
        for(const name of names) {
            if (name !== 'constructor') {
                window[name] = this[name].bind(this);
            }
        }
    }

    setGame(game) {
        this.game = game;
    }

    setZoom(num) {
        this.game.stage.zoomTo(num, true);
    }

    kill(id) {
        this.game.player.characters[id].health = 0;
        this.game.storage.updateCharacter(this.game.player.characters[id].save());
    }
    
    recovery(id) {
        this.game.player.characters[id].health = this.game.player.characters[id].maxHealth;
        this.game.storage.updateCharacter(this.game.player.characters[id].save());
    }

    increaseExp(exp) {
        for (let key in this.game.player.characters) {
            this.game.player.characters[key].increaseExp(exp);
            this.recovery(key);
            this.game.storage.updateCharacter(this.game.player.characters[key].save());
        }
    }

    setLevel(level) {
        for (let key in this.game.player.characters) {
            this.game.player.characters[key].level = level;
            this.game.player.characters[key].exp = 0;
            this.recovery(key);
            this.game.storage.updateCharacter(this.game.player.characters[key].save());
        }
    }

    getGold(gold) {
        this.game.addGold(gold);
    }

    getAllConsumables(count) {
        for (let key in items) {
            const item = items[key];
            if (item.category === 'consumables') {
                this.game.player.inventory.addItem(item.id, Number(count));
            }
        }
    }

    getAllRecipes() {
        for (let key in items) {
            const item = items[key];
            if (item.category === 'recipes') {
                this.game.player.inventory.addItem(item.id, Number(1));
            }
        }
    }

    getAllMaterials(count) {
        for (let key in items) {
            const item = items[key];
            if (item.category === 'material') {
                this.game.player.inventory.addItem(item.id, Number(count));
            }
        }
    }

    enterCastle() {
        const func = async () => {
            await this.game.$leaveStage();
            await this.game.$enterStage('assets/mapdata/castle_lobby.json', 'castle-to-road3');

            this.game.exploreMode.interactive = true;
            this.game.stage.showPathHighlight = true;
            this.game.ui.hideTheaterUI(0.5);
            this.game.ui.showMenu();
            this.game.stage.enter();
        };

        func();
    }

    makeSelectableFloor(floor) {
        for(let i = 1; i <= floor; i++) {
            this.game.storage.addSelectableFloor(i);
        }
    }

    enterHouse() {
        const func = async () => {
            await this.game.$leaveStage();
            await this.game.$enterStage('assets/mapdata/house.json', 'house-gate');

            this.game.exploreMode.interactive = true;
            this.game.stage.showPathHighlight = true;
            this.game.ui.hideTheaterUI(0.5);
            this.game.ui.showMenu();
            this.game.stage.enter();
        };

        func();
    }

    enterFloor(floor) {
        const func = async () => {
            this.game.setFloor(floor-1);
            await this.game.$nextFloor(null, 'up');
        };

        func();
    }

    enterMiluda() {
        const func = async () => {
            this.game.setFloor(1);
            await this.game.$nextFloor(null, 'up', { enterBossStage: true });
        };

        func();
    }

    enterMiddleBoss() {
        const func = async () => {
            this.game.setFloor(9);
            await this.game.$nextFloor(null, 'up', { enterBossStage: true });
        };

        func();
    }

    enterFinalBoss() {
        const func = async () => {
            this.game.setFloor(19);
            await this.game.$nextFloor(null, 'up', { enterBossStage: true });
        };

        func();
    }
}