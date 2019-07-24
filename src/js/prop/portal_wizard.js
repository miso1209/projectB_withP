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
        const list = game.getSelectableFloor();
        const uiSelectableList = list.map((floor) => { return floor===0?'집':`${floor}층`});
        const gold = game.selectableFloor.length * 5; // 가진 층 수 * 5 Gold의 비용이 소모된다고 하자. 
        game.exploreMode.setInteractive(false);

        game.ui.showPortals(uiSelectableList, (result) => {
            if (result === 'ok') {
                console.log('refresh gold : ', gold);
                game.ui.showConfirmModal("이동가능한 포털리스트를 갱신하시겠습니까?", true, (result) => {
                    if (result === 'ok') {
                        game.addGold(-gold);
                        game.refreshSelectableFloor();
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