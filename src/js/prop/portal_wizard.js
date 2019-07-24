import PropBase from './propbase';
import { loadAniTexture } from '../utils';
import { DIRECTIONS } from '../define';

export default class PortalWizard extends PropBase {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.alreadyParty = false;

        this.hasEmitter = true;

        this.nameTagOffset = {
            x: 0,
            y: -(this.tileTexture.height / 2)
        };

        this.displayName = 'Lv.99 공간 마법사';
        this.showName();
    }

    touch(game) {
        // List 갱신은 갱신 후 매 1시간 or, 새로운 층을 돌파하였을 경우 갱신된다.
        let list = game.getSelectableFloor();
        let uiSelectableList = list.map((floor) => { return floor===0?'집':`${floor}층`});
        const cost = game.selectableFloor.length * 5; // 가진 층 수 * 5 Gold의 비용이 소모된다고 하자. 

        game.exploreMode.setInteractive(false);
        game.ui.showPortals(uiSelectableList, (result) => {

            if (result === 'ok') {
                game.ui.showConfirmModal(`포털 리스트를 갱신하면 <em>${cost}골드</em>가 소모됩니다. 이동가능한 포털리스트를 갱신하시겠습니까?`, true, (result) => {
                    if (result === 'ok') {
                        // 소모비용 / 가지고 있는 골드 체크
                        if (game.player.inventory.gold - cost < 0) {
                            game.ui.showConfirmModal(`갱신에 필요한 골드가 부족합니다.`, false, (result) => {
                                if (result === 'ok') {
                                    game.exploreMode.setInteractive(true);
                                }
                            });
                        } else{
                            console.log('리스트 갱신~!');
                            game.addGold(-cost);
                            game.refreshSelectableFloor();

                            list = game.getSelectableFloor();
                            uiSelectableList = list.map((floor) => { return floor===0?'집':`${floor}층`});

                            game.ui.showPortals(uiSelectableList);
                        } 
                    } else {
                        game.exploreMode.setInteractive(true);
                    }
                });
            } else if(result === 'cancel'){
                game.exploreMode.setInteractive(true);
            } else {
                this.portal(game, list[result]);
            }
        });
    }

    portal(game, floor) {
        floor = Number(floor);
        Sound.playSound('portal_prop_1.wav', { singleInstance: true });
        const effect = new PIXI.extras.AnimatedSprite(loadAniTexture('portaleffect', 30));
        effect.animationSpeed = 0.3;
        effect.loop = false;
        effect.play();
        effect.scale.x = 1.5;
        effect.scale.y = 1.5;
        effect.anchor.x = 0.5;
        effect.anchor.y = 1;
        effect.position.x += 18;
        effect.position.y += 25;
        effect.blendMode = PIXI.BLEND_MODES.ADD;
        this.addChild(effect);
        game.stage.stopObject(game.stage.player);

        // 0은 집을 의미한다.
        if (floor === 0) {
            game.allRecoveryParty();
            game._playCutscene(5);
        } else {
            game.setFloor(floor - 1);

            let direciton = '';
            if (this.direction === DIRECTIONS.NW) {
                direciton = 'left';
            } else if(this.direction === DIRECTIONS.NE) {
                direciton = 'up';
            }
            
            const $t = async () => {
                await game.$fadeIn(1);
                await game.$nextFloor(null, direciton, { enterPortalStage: true });
            };
    
            $t();
        }
    }

    hideName() {

    }

    getName() {
        return this.displayName;
    }
}