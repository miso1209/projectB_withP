import Prop from './prop';

export default class Chest extends Prop {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.isOpened = false;

        // 자신의 타일 모양을 바꾸어야 한다
        this.animations = tileData.animations;
    }

    open() {
        // TODO : 애니메이션을 플레이 해야한다
        // 텍스쳐 변경
        this.setTexture(this.animations[1].texture);

        this.isOpened = true;
    }

    touch(game) {
        if (this.isOpened) {
            game.ui.showDialog("상자는 비어있다.");
        } else {
            this.open();
            // TODO : 아이템 아이디가 어딘가 있어야 하는데.. 일단 1,2번이 열쇠조각, 3번이 열쇠이다
            let itemType;
            if (!game.player.inventory.getItemByType(1))  {
                game.player.inventory.addItem(1, 1);
                itemType = 1;
            } else if (!game.player.inventory.getItemByType(2))  {
                game.player.inventory.addItem(2, 2);
                itemType = 2;
            }
            
            // 두번째상자에서 몬스터가 나오게 한다
            if (itemType === 2) {
                game.battleMode.callback = () => {
                    this.onItemAdded(game, itemType);
                };
                game.enterStage('assets/mapdata/map2.json', "battle");
            } else {
                this.onItemAdded(game, itemType);
            }
        }
    }

    onItemAdded(game, itemType) {
        game.ui.showItemAcquire(itemType, () => {
            // TODO:  모달 클로즈 이벤트를 만들어야 한다
            // 트리거를 만들어야 한다!!

            if (game.player.inventory.getItemByType(1) && 
                game.player.inventory.getItemByType(2)) {

                game.ui.showChatBallon(game.player, "열쇠조각은 모두 모았어!!\n아까 모루를 본 것 같은데 \n그쪽으로 가보자", 4);
            } else {
                game.ui.showChatBallon(game.player, "열쇠조각이다! 나머지 조각도 어딘가 있을거야", 4);
            }
        });
    }
}
