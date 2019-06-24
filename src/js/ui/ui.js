import { EventEmitter } from "events";
import Button from './component/button';
import Modal from "./component/modal";
import SystemModal from "./systemmodal";
import Dialog from "./dialog";
import RecipeUI from "./recipeui";
import ProgressUI from "./progressui";
import Inventory from "./inventory";
import ItemImage from "./component/itemimage";
import CharacterSelect from "./characterSelect";
import CharacterDetail from "./characterDetail";
import MakeDom from "./component/makedom";
import Minimap from "./minimap";
import PartyUI from "./partyui";
import AcquireModal from "./itemacquireui";



export default class DomUI extends EventEmitter {
    constructor() {
        super();
        
        this.gamePane = document.getElementById('canvas');
        this.screenWidth = this.gamePane.screenWidth;
        this.screenHeight = this.gamePane.screenHeight;
        
        // theatreUI 를 설정한다
        this.theaterUI = new MakeDom('div');
        this.theaterUI.id = 'theater';
        this.theaterUI.style.top = this.gamePane.offsetTop + 'px';
        document.body.appendChild(this.theaterUI);

        // 메인 ui 를 설정한다
        this.gnbContainer = new MakeDom('div', 'gnbContainer');
        this.gnbContainer.style.top = this.gamePane.offsetTop + 'px';
        this.gnbContainer.style.opacity = '0';
        document.body.appendChild(this.gnbContainer);

        const gnb = new MakeDom('div', 'gnb');
        this.gnbContainer.appendChild(gnb);

        this.minimapDOM = document.createElement('canvas');
        this.minimapDOM.classList.add('minimap');
        this.minimapDOM.style.width = '160px';
        this.minimapDOM.style.height = '100px';
        this.minimapDOM.style.display = 'none';
        
        this.gnbContainer.appendChild(this.minimapDOM);

        this.minimap = new Minimap(160, 100, this.minimapDOM);
        
        const menuData = [
            {name:'캐릭터', event: "characterselect"},
            {name:'보관함', event: "inventory"},
            {name:'파티', event: "party"}
            // 아래 메뉴는 기획이 미정이어서 감춤
            // {name:'퀘스트', event: "quest"},
            // {name:'설정', event: "options"}
        ];
        
        menuData.forEach(menu => {
            let btn = new Button(menu.name, 'tabBtn');
            gnb.appendChild(btn.dom);
            btn.dom.addEventListener('click', () => {
                this.emit(menu.event);
            });
        });

        this.player = null;
        this.playerInvenData = null;
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'uiContainer';
        container.style.top = this.gamePane.offsetTop + 'px';
        document.body.appendChild(container);
        
        // event prevent??
        container.style.pointerEvents = 'auto';
    
        return container;
    }
    
    removeContainer(pane) {
        document.body.removeChild(pane);
    }

    showMenu() {
        // 기본 ui 를 보여준다
        this.gnbContainer.style.opacity = '1';
        this.gnbContainer.style.display = 'block';
    }

    hideMenu() {
        // 기본 ui 를 가린다
        this.gnbContainer.style.opacity = '0';
        this.gnbContainer.style.display = 'none';
    }

    showTheaterUI(){
        this.theaterUI.classList.add('show');
    }

    hideTheaterUI(){
        this.theaterUI.classList.remove('show');
    }

    showZoomBtn(){
        this.zoomBtn.style.opacity = '1';
    }

    hideZoomBtn(){
        this.zoomBtn.style.opacity = '0';
    }

    showMinimap() {
        this.minimapDOM.style.display = 'block';
    }
    hideMinimap() {
        this.minimapDOM.style.display = 'none';
    }

    showStageTitle(text) {
        // TODO : safari에서 오류.. 애니메이션 수정할 것.
        const pane = this.createContainer();
        const title = document.createElement('h2');
        title.className = 'stageTitle';
        title.innerText = text;

        pane.appendChild(title);
        pane.style.pointerEvents = 'none';

        const titleAnimation = title.animate([
            { transform: 'scale(0)', opacity: 0 }, 
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(0)', opacity: 0 }

        ], { 
            duration: 3000,
            easing: 'ease-out'
        });
        
        titleAnimation.play();

        setTimeout(() => {
            pane.parentNode.removeChild(pane);
        }, 3000);
    }
    
    showDialog(script, callback) {
        const pane = this.createContainer();
        const dialog = new Dialog(pane, 700, 140, script);
    
        dialog.setText(script[0].text);
        if (script[0].speaker) {
            dialog.speaker = this.player.characters[script[0].speaker];
            dialog.showSpeaker(script[0].speaker);
        }
        dialog.onComplete = callback;
    }

    showConfirmModal(text, result) {
        const pane = this.createContainer();
        const confirmModal = new SystemModal(pane, 300, 200, text, result);
        confirmModal.dom.style.top = '50%';
        confirmModal.dom.style.marginTop = 200 * -0.5 + 'px';
        confirmModal.contents.style.margin = '10% auto';
        confirmModal.contents.style.fontSize = '1.1rem';
    }

    // 임시
    showSystemModal(text, items, result) {
        const pane = this.createContainer();
        const confirmModal = new SystemModal(pane, 300, 200, text, result);
        confirmModal.dom.style.top = '50%';
        confirmModal.dom.style.marginTop = 250 * -0.5 + 'px';
        confirmModal.contents.style.margin = '10% auto';
        confirmModal.contents.style.fontSize = '1.1rem';

        const options = new MakeDom('div', 'contents-option');

        if (items.length > 0) {
            items.forEach((item) => {
                let option = new ItemImage(item.data.image.texture, item.data.image.x, item.data.image.y);
                let count = new MakeDom('span');
                count.innerText = `x${item.owned}`;
                options.appendChild(option.dom);
                options.appendChild(count);
            });
        } else {
            let option = new ItemImage(items.data.image.texture, items.data.image.x, items.data.image.y);
            // let count = new MakeDom('span');
            // count.innerText = `x${items.owned}`;
            options.appendChild(option.dom);
            // options.appendChild(count);
        }
        confirmModal.contents.appendChild(options);
    }

    showUseItemModal(text, input, result) {
        const pane = this.createContainer();
        const confirmModal = new SystemModal(pane, 300, 200, text, result);
        confirmModal.dom.style.top = '50%';
        confirmModal.dom.style.marginTop = 250 * -0.5 + 'px';
        confirmModal.contents.style.margin = '10% auto';
        confirmModal.contents.style.fontSize = '1.1rem';

        const options = new MakeDom('div', 'contents-option');

        if (input.length > 0) {
            input.forEach((item) => {
                let option = new ItemImage(item.data.image.texture, item.data.image.x, item.data.image.y);
                let count = new MakeDom('span');
                count.innerText = `x${item.owned}`;
                options.appendChild(option.dom);
                options.appendChild(count);
            });
        } else {
            let option = new ItemImage(items.data.image.texture, items.data.image.x, items.data.image.y);
            options.appendChild(option.dom);
        }

        confirmModal.contents.appendChild(options);
    }

    showCombineItemList(inputs, callback) { // 제작하기 버튼 콜백
        const pane = this.createContainer();
        pane.classList.add('screen');
    
        this.recipeUI = new RecipeUI(pane, 360, 460, callback);
        
        for (const input of inputs) {
            this.recipeUI.tabs.push({category: input.category});
            this.recipeUI.inputs = inputs;
        }
    
        if (inputs.length > 0) {
            this.recipeUI.select(inputs[0].category);
        }
        this.recipeUI.moveToLeft(150);
    }

    showCraftUI(itemId, result) {
        const pane = this.createContainer();
        let domHeight = 300;

        const modal = new Modal(pane, 360, domHeight, () => {
            result(itemId);
            this.removeContainer(pane);
        });
    
        modal.addTitle('아이템 조합중');
        modal.addCloseButton();
        modal.addConfirmButton('조합완료');
    
        modal.dom.style.top = '50%';
        modal.dom.style.marginTop = domHeight * -0.5 + 'px';

        const itemText = document.createElement('div');
        itemText.className = 'contents';
        itemText.innerText = "아이템을 조합중";
        itemText.style.top = '60px';

        const interval = 10; // 1 ~ 10
        const loading = new ProgressUI(modal.dom, interval, (onComplete)=>{
            itemText.innerText = "아이템 조합 성공!"
        });
    
        loading.moveToCenter(130);
        
        modal.dom.appendChild(itemText);
        modal.dom.appendChild(loading.dom);
    }

    // 아이템 획득
    showAcquireModal(item, inputs, result) {
        const pane = this.createContainer();
        const domHeight = 300;
        
        const itemAcquire = new AcquireModal(pane, inputs, 360, domHeight, () => {
            this.removeContainer(pane);
            if (result) {
                result();
            }
        });
    }

    showItemAcquire(item, result) {
        const pane = this.createContainer();
        const domHeight = 300;
        const itemAcquire = new Acquireui(pane, inputs, 360, domHeight, () => {
            this.removeContainer(pane);
            if (result) {
                result();
            }
        });
        
        itemAcquire.addTitle('아이템 획득');
        itemAcquire.addCloseButton();
        itemAcquire.addConfirmButton('확인');
        itemAcquire.moveToCenter(0);
        itemAcquire.dom.style.top = '50%';
        itemAcquire.dom.style.marginTop = domHeight * -0.5 + 'px';

        const itemText = document.createElement('div');
        itemText.className = 'contents';
        itemText.style.top = 'auto';
        itemText.style.bottom = '70px';
        itemText.innerText = item.name;
        
        const image = new ItemImage('items@2.png', item.data.image.x, item.data.image.y);
        const itemSprite = image.dom;
        itemSprite.style.position = 'absolute';
        itemSprite.style.left = '0';
        itemSprite.style.right = '0';
        itemSprite.style.margin = '90px auto 0';
        
        itemAcquire.dom.appendChild(itemText);
        itemAcquire.dom.appendChild(itemSprite);
    }


    showInventory(inputs) {
        const pane = this.createContainer();
        const inventory = new Inventory(pane, inputs);
        inventory.moveToRight(70);
        inventory.onTabSelected(inventory.tabs[0].category);
    }

    showParty(inputs, partyinputs){
        const pane = this.createContainer();
        
        const party = new PartyUI(pane, inputs, partyinputs, (result) => {
            this.emit('setParty', result);
            console.log(partyinputs.totalPowerFigure);
            party.updateMembers();
        });
    }

    showCharacterSelect(inputs) {
        const pane = this.createContainer();
        
        const characterSelect = new CharacterSelect(pane, inputs, (info) => {
            this.showCharacterDatail(info);
        });
        
        // consumables
        this.emit('playerInvenData', 'consumables');
        characterSelect.consumablesData = this.playerInvenData;

        const useItem = ((selected) => {
            if (selected !== null) {
                this.showSystemModal('포션을 사용하시겠습니까?', selected, (confirmed) => {
                    if (confirmed === "ok") {
                        this.emit('useItem', selected.data.id, 1, characterSelect.selected);
                        characterSelect.updateStatus(characterSelect.selected);
                        
                        this.emit('playerInvenData', 'consumables');
                        characterSelect.consumablesData = this.playerInvenData;

                        characterSelect.createConsumablesItem(useItem);
                    } 
                });
            }
        });
        characterSelect.createConsumablesItem(useItem);
    }

    showCharacterDatail(player) {
        const pane = this.createContainer();
        const characterDetail = new CharacterDetail(pane, player, (result, option) => {
        
            this.emit('playerInvenData', result.category);

            if (result.data !== null) {
                if (option === 'simulationEquip') {
                    // console.log('아이템 고르기 - 시뮬레이션');
                    this.emit('simulateEquip', result.data.category, result.item, player.id);
                    
                    characterDetail.selected = this.player;
                    characterDetail.updateStat();
                } else if (option === 'cancel') {
                    // console.log('시뮬레이션 취소');
                    this.emit('cancelSimulate');
                    
                    characterDetail.selected = this.player;
                    characterDetail.statItem.data = null;
                    characterDetail.updateStat();

                } else if (option === 'equip') {
                    // console.log('장비 장착');
                    this.emit('equipItem', result.data.category, result.item, player.id);
                    
                    characterDetail.statItem.data = null;
                    characterDetail.updateEquip();
                    characterDetail.showEquipInfo();
                } else {
                    // console.log('장비 해제');
                    this.emit('unequipItem', result.data.category, player.id);
                    characterDetail.statItem.data = null;
                    characterDetail.updateEquip();
                    characterDetail.updateStat();
                }
            } else {
                if (this.playerInvenData.length !== 0) {
                    this.emit('playerInvenData', result.category);
                    characterDetail.tempEquip = this.playerInvenData;
                    characterDetail.showEquipInven();
                } else {
                    this.showConfirmModal('장착가능한 장비가 없습니다.', ()=>{
                        // TODO: 나중엔 상점으로 연결하면 되려나.
                    });
                }
            }
        });
    }
}
