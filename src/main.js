import Game from './js/game'
import UI from './js/ui'
import ResourceManager from './js/resource-manager'

function initApp() {
  const pixi = new PIXI.Application(980, 500  , { backgroundColor : 0x6BACDE, forceCanvas: true });
  document.body.appendChild(pixi.view);

  // 오프닝을 준비한다
  const loader = new ResourceManager();

  loader.add('opening.png', 'assets/opening.png');
  loader.add('border.png', 'assets/border.png');
  loader.load(() => {
      // 화면을 그린다
      // 버튼을 클릭하면 게임을 시작한다
      const sprite = new PIXI.Sprite(PIXI.Texture.fromFrame('opening.png'))
      sprite.interactive = true;
      pixi.stage.addChild(sprite);
      sprite.mouseup = () => {
          gameStart(pixi);
      };

      pixi.stage.addChild(new PIXI.Sprite(PIXI.Texture.fromFrame("border.png")));
  });
}


function gameStart(pixi) {
  // 나중에 스테이지 데이터와 캐릭터 데이터를 자동으로 추출할수 있게 해야한다
  // 로딩 속도를 최적화 하기 위해서
  // 일단은 모든 데이터를 다 넣도록 하자 (알아서 캐싱된다)

  pixi.stage.removeChildren();
  const game = new Game(pixi);
  pixi.stage.addChild(new PIXI.Sprite(PIXI.Texture.fromFrame("border.png")));

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
  game.resourceManager.add("player1_active.png","assets/player1_active.png");
  game.resourceManager.add("player2_active.png", "assets/player2_active.png");
  game.resourceManager.add("player3_active.png", "assets/player3_active.png");
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

  game.resourceManager.load(() => {
      const ui = new UI(game);
      game.ui = ui;

      game.start({ stagePath: 'assets/mapdata/house.json' });
      const game_update = () => {
          game.update();
          ui.update();
          requestAnimationFrame(game_update);
      }
      game_update();


      let toggle = true;

      window.addEventListener("keydown", (e) => {
          if (e.keyCode === 66) {
              // 스테이지를 변경한다
              toggle = !toggle;
              if (toggle) {
                  game.enterBattle();
              } else {
                  game.leaveBattle();
              }
          } else if (e.keyCode  === 67) {
              //ui.showDialog("테스트 다이얼로그입니다. 클릭하면 꺼집니다");
              //ui.showItemAcquire();
              //ui.showChatBallon(game.player, "테스트");
              if (toggle) {
                  ui.showCombine();
              } else {
                  ui.hideCombine();
              }
              toggle = !toggle;
          } 
      }, true);
  });
}

initApp();