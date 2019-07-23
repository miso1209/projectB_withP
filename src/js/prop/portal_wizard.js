import PropBase from './propbase';
import { loadAniTexture } from '../utils';
import { DIRECTIONS } from '../define';

export default class PortalWizard extends PropBase {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.alreadyParty = false;

        this.hasEmitter = true;

        // name tag의 offset을 설정할 수 있도록 한다.
        this.nameTagOffset = {
            x: 0,
            y: -(this.tileTexture.height / 2)
        };

        this.displayName = 'Lv.99 공간 마법사';

        // 초기에 이름을 보이고, hideName을 오버라이딩 하여, hide 하지 않도록 한다.
        this.showName();
    }

    touch(game) {
        // 이 정보를 List로 보여주고 반환 Index를 받아 처리하자.
        const uiSelectableList = game.selectableFloor.map((floor) => { return floor===0?'집':`${floor}층`});
        console.log('player 가 선택 가능한 층(List로 나온다.) :', uiSelectableList);

       game.exploreMode.setInteractive(false);
    //    game.ui.showDialog([
    //         { text: "후후.. 제가 필요하실 줄 알았습니다." },
    //         { text: "어디로 이동하실 껀가요?." }
    //     ], () => {

            /*
            game.selectableFloor : 사용자가 입장 가능한 실제 층의 배열 => [0, 1, 2, 3 ...]
            list : game.selectableFloor을 한번 전처리한 배열 (사용자가 이동 가능한 층의 배열로 이루어져 있다.) => ['집', '1층' ,'2층' '3층', ...]
            result : list에 대한 반환 Index값.(number) 취소 일 경우 'cancel'
            */

            // 아마 이런 모습이 될 것 같다.
            /*  
            game.ui.showListModal(list, (result) => {
                if (result !== 'cancel') {
                    this.portal(game, game.selectableFloor[result.value]);
                } else {
                    game.exploreMode.setInteractive(true);
                }
            });
            */
            game.ui.showPortals(uiSelectableList, (result) => {
                console.log(result);
                if (result === 'ok') { // 리스트갱신- 시스템 모달
                    // this.portal(game, game.selectableFloor[result]);
                    game.ui.showConfirmModal("이동가능한 포털리스트를 갱신하시겠습니까?", true, (result) => {
                        if (result === 'ok') {
                            console.log('리스트갱신 뿜!');
                        } else {
                            game.exploreMode.setInteractive(true);
                        }
                    });
                } else if(result === 'cancel'){
                    game.exploreMode.setInteractive(true);
                } else {
                    console.log('???');
                    this.portal(game, result);
                }
            });
            // game.ui.showConfirmModal("포털 이동?", true, (result) => {
            //     if (result === 'ok') {
            //         this.portal(game, game.selectableFloor[game.selectableFloor.length - 1]);
            //     } else {
            //         game.exploreMode.setInteractive(true);
            //     }
            // });
        // });
    }

    portal(game, floor) {
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