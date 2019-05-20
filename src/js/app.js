import ResourceManager from './resource-manager'
import Storage from './storage';
import DevConsole from './devconsole';
import Game from './game';
import UI from './ui'
import DomUI from './domUI'

export default class App {
    constructor() {
        this.storage = new Storage();
        this.dev = new DevConsole();
        this.game = null;

        this.pixi = new PIXI.Application(980, 500, { 
            backgroundColor: 0x6BACDE,
            view: document.getElementById('canvas'),
        });
    }

    showIntro() {
        const loader = new ResourceManager();

        loader.add('opening.png', 'assets/opening.png');
        loader.add('border.png', 'assets/border.png');
        loader.load(() => {
            // 화면을 그린다
            // 버튼을 클릭하면 게임을 시작한다
            const sprite = new PIXI.Sprite(PIXI.Texture.fromFrame('opening.png'))
            sprite.interactive = true;
            sprite.mouseup = () => {
                this.pixi.stage.removeChildren();
                this.startGame();
            };
        
            this.pixi.stage.addChild(sprite);
            this.pixi.stage.addChild(new PIXI.Sprite(PIXI.Texture.fromFrame("border.png")));
        });
    }

    startGame() {
        this.game = new Game(this.pixi);
        // TODO: 나중에 dom 으로 바꾸도록 한다
        this.pixi.stage.addChild(new PIXI.Sprite(PIXI.Texture.fromFrame("border.png"))); 

        const game = this.game;

        // TODO : 나중에 제거하도록 하자
        game.resourceManager.add("dialog.png", "assets/dialog.png");
        game.resourceManager.add("dialogtitle.png", "assets/dialogtitle.png");
        game.resourceManager.add("theater.png", "assets/theater.png");
        game.resourceManager.add("item3.png", "assets/items/item3.png");
        game.resourceManager.add("chatballon.png", "assets/ui/chatballon.png");
        game.resourceManager.add("chatballon_comma.png", "assets/ui/chatballon_comma.png");
        game.resourceManager.add("ending.png", "assets/ending.png");
        game.resourceManager.add("inventory.png", "assets/inventory.png");
        game.resourceManager.add("combine.png", "assets/combine.png");
        game.resourceManager.add("combine_listitem.png", "assets/combine_listitem.png");
        game.resourceManager.add("combine_button.png", "assets/combine_button.png");
        game.resourceManager.add("player1_active.png", "assets/player1_active.png");
        game.resourceManager.add("player2_active.png", "assets/player2_active.png");
        game.resourceManager.add("player3_active.png", "assets/player3_active.png");
        game.resourceManager.add("player4_active.png", "assets/player4_active.png");
        game.resourceManager.add("player5_active.png", "assets/player5_active.png");
        game.resourceManager.add("ch01_skill01_on.png", "assets/ch01_skill01_on.png");
        game.resourceManager.add("ch01_skill02.png", "assets/ch01_skill02.png");
        game.resourceManager.add("ch02_skill01_on.png", "assets/ch02_skill01_on.png");
        game.resourceManager.add("ch02_skill02.png", "assets/ch02_skill02.png");
        game.resourceManager.add("ch03_skill01_on.png", "assets/ch03_skill01_on.png");
        game.resourceManager.add("ch03_skill02.png", "assets/ch03_skill02.png");
        game.resourceManager.add("monster01_active.png", "assets/monster01_active.png");
        game.resourceManager.add("monster02_active.png", "assets/monster02_active.png");
        game.resourceManager.add("monster03_active.png", "assets/monster03_active.png");
        game.resourceManager.add("ending_victory.png", "assets/ending_victory.png");
        game.resourceManager.add("battleMap1.png", "assets/battleMap1.png");
        game.resourceManager.add("battle_background.png", "assets/battle_background.png");

        game.resourceManager.add("assets/warrior/warrior_atk_sw.json");
        game.resourceManager.add("assets/warrior/warrior_atk_nw.json");
        game.resourceManager.add("assets/warrior/warrior_atk_2_sw.json");
        game.resourceManager.add("assets/warrior/warrior_atk_2_nw.json");
        game.resourceManager.add("assets/warrior/warrior_idle_sw.json");
        game.resourceManager.add("assets/warrior/warrior_idle_nw.json");
        game.resourceManager.add("assets/warrior/warrior_walk_sw.json");
        game.resourceManager.add("assets/warrior/warrior_walk_nw.json");

        game.resourceManager.add("assets/healer/healer_atk_sw.json");
        game.resourceManager.add("assets/healer/healer_atk_nw.json");
        game.resourceManager.add("assets/healer/healer_magic_sw.json");
        game.resourceManager.add("assets/healer/healer_magic_nw.json");
        game.resourceManager.add("assets/healer/healer_idle_sw.json");
        game.resourceManager.add("assets/healer/healer_idle_nw.json");
        game.resourceManager.add("assets/healer/healer_walk_sw.json");
        game.resourceManager.add("assets/healer/healer_walk_nw.json");

        game.resourceManager.add("shadow.png", "assets/shadow.png");
        game.resourceManager.add("pbar.png", "assets/pbar.png");
        game.resourceManager.add("pbar_r.png", "assets/pbar_r.png");
        game.resourceManager.add("pbar_g.png", "assets/pbar_g.png");
        game.resourceManager.add("pbar_o.png", "assets/pbar_o.png");
        game.resourceManager.add("assets/elid/elid_atk_nw.json");
        game.resourceManager.add("assets/elid/elid_atk_sw.json");
        game.resourceManager.add("assets/elid/elid_idle_nw.json");
        game.resourceManager.add("assets/elid/elid_idle_sw.json");
        game.resourceManager.add("assets/miluda/miluda_atk_sw.json");
        game.resourceManager.add("assets/miluda/miluda_atk_nw.json");
        game.resourceManager.add("assets/miluda/miluda_idle_sw.json");
        game.resourceManager.add("assets/miluda/miluda_idle_nw.json");
        game.resourceManager.add("assets/titan/monster2-atk_sw.json");
        game.resourceManager.add("assets/titan/monster2-idle_sw.json");
        game.resourceManager.add("assets/medusa/monster1-atk_sw.json");
        game.resourceManager.add("assets/medusa/monster1_idle_sw.json");
        game.resourceManager.add("assets/slash_1.json");
        game.resourceManager.add("assets/shotingeffect.json");
        game.resourceManager.add("assets/healeffect.json");
        game.resourceManager.add("assets/firerainprop.json");
        game.resourceManager.add("assets/explosion.json");
        game.resourceManager.add("assets/shoted.json");
        game.resourceManager.add("fireBall.png", "assets/fireBall.png");
        game.resourceManager.add("shield.png", "assets/shield.png");
        game.resourceManager.add("arrow.png", "assets/arrow.png");

        game.loadCommon(() => {
            this.start();
        });
    }

    start() {
        // 게임을 시작한다
        this.game.setStorage(this.storage);
        this.dev.setGame(this.game);
        
        // TODO : ui 에서 ui2 로 변경중
        this.game.ui = new UI(this.game);
        this.game.ui2 = new DomUI(this.game);

        this.game.start();
        this.update();

        window.addEventListener("keydown", (e) => {
            if (e.keyCode === 66) {
                // 스테이지를 변경한다
                toggle = !toggle;
                if (toggle) {
                game.enterBattle();
                domUI.setStageMode('battle');
                } else {
                game.leaveBattle();
                domUI.setStageMode('normal');
                }
            }


        });
    }

    update() {
        this.game.update();
        this.game.ui.update();
        requestAnimationFrame(this.update.bind(this));      
    }
}