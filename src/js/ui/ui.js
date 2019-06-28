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
import ItemAcquire from "./itemAcquire";



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
    
    hasModal() {
        const currentUI = document.querySelector('.uiContainer');
        if (currentUI) {
            return true;
        }
        return false;
    }
    
    showStageTitle(text) {
        // TODO : safari에서 오류.. 애니메이션 수정할 것.
        const pane = this.createContainer();
        const title = document.createElement('h2');
        title.className = 'stageTitle';
        title.innerText = text;
        pane.classList.remove('uiContainer');
        pane.classList.add('container');
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
        
        dialog.speakers = this.characters;
        if (script[0].speaker) {
            dialog.showSpeaker(script[0].speaker);
        }

        dialog.onComplete = callback;
    }

    // 기본 노티모달 : 텍스트 + 확인/취소 버튼 cancelable === true -> 취소버튼 
    showConfirmModal(text, cancelable, result) {
        const pane = this.createContainer();
        const confirmModal = new SystemModal(pane, 300, 200, text, cancelable, result);
        confirmModal.dom.style.top = '50%';
        confirmModal.dom.style.marginTop = 200 * -0.5 + 'px';
        confirmModal.contents.style.margin = '10% auto';
        confirmModal.contents.style.fontSize = '1.1rem';
    }

    showUseItemModal(text, items, result) {
        const pane = this.createContainer();
        const confirmModal = new SystemModal(pane, 300, 240, text, true, result);

        confirmModal.dom.style.top = '50%';
        confirmModal.dom.style.marginTop = 240 * -0.5 + 'px';
        confirmModal.contents.style.margin = '10% auto';
        confirmModal.contents.style.fontSize = '1.1rem';

        const options = new MakeDom('div', 'contents-option');
       
        let option = new ItemImage(items.data.image.texture, items.data.image.x, items.data.image.y);
        options.appendChild(option.dom);

        let name = new MakeDom('p', 'name', items.data.name);
        options.appendChild(name);

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
        let domHeight = 240;

        const modal = new Modal(pane, 360, domHeight);
        modal.addTitle('아이템 조합중');
        modal.dom.style.top = '50%';
        modal.dom.style.marginTop = domHeight * -0.5 + 'px';

        const itemText = document.createElement('div');
        itemText.className = 'contents';
        itemText.innerText = "아이템을 조합중입니다.";
        itemText.style.top = '60px';

        const interval = 4;
        const loading = new ProgressUI(modal.dom, interval, (onComplete)=>{
            itemText.innerText = "아이템 조합 성공!"
            this.removeContainer(pane);
            result(itemId);
        });
    
        loading.moveToCenter(130);
        
        modal.dom.appendChild(itemText);
        modal.dom.appendChild(loading.dom);
    }

    // 아이템 획득
    showItemAcquire(text, inputs, result) {
        const pane = this.createContainer();
        const acquire = new ItemAcquire(pane, text, inputs, (response) => {
            this.removeContainer(pane);

            if (result) {
                console.log(response);
                result();
            }
        });
    }

    showInventory(inputs) {
        const pane = this.createContainer();
        const inventory = new Inventory(pane, inputs);
        inventory.moveToRight(70);
        inventory.onTabSelected(inventory.tabs[0].category);
    }

    showParty(inputs, partyinputs){
        const pane = this.createContainer();
        
        const party = new PartyUI(pane, inputs, partyinputs, (id, character) => {
            if(id === 'buttoncallback') {
                console.log('buttoncallback' , character);
                this.emit(character);
            } else {
                this.emit('setParty', id, character);
            }
        });
    }

    showCharacterSelect(inputs) {
        const pane = this.createContainer();
        const characterSelect = new CharacterSelect(pane, inputs, (info) => {
            this.showCharacterDatail(info);
        });
        
        // consumables
        this.emit('playerInvenData', {category: 'consumables'});
        characterSelect.consumablesData = this.playerInvenData;

        const useItem = ((selected) => {
            if (selected !== null) {
                this.showUseItemModal('포션을 사용하시겠습니까?', selected, (confirmed) => {
                    if (confirmed === "ok") {
                        this.emit('useItem', selected.data.id, 1, characterSelect.selected);
                        characterSelect.updateStatus(characterSelect.selected);
                        
                        this.emit('playerInvenData', {category:'consumables'});
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
            
            if (option === 'close') {
                // 시뮬레이션 취소하고-캐릭터 선택창 이동 
                this.emit('cancelSimulate');
                this.emit('characterselect');
                return;
            } else {
                this.emit('playerInvenData', {category:result.category, class: player.data.class} );
            }
            
            if (characterDetail.pauseData !== null) {
                this.emit('playerInvenData', {category:characterDetail.pauseData, class: player.data.class} );
            }

            if (result.data !== null) {
                if (option === 'simulationEquip') {
                    // console.log('아이템 고르기 - 시뮬레이션');
                    this.emit('simulateEquip', result.data.category, result.item, player.id);
                } else if (option === 'cancel') {
                    // console.log('시뮬레이션 취소');
                    this.emit('cancelSimulate');
                    characterDetail.statItem.data = null;
                } else if (option === 'equip') {
                    // console.log('장비 장착');
                    this.emit('equipItem', result.data.category, result.item, player.id);
                    characterDetail.statItem.data = null;
                    characterDetail.updateEquip();
                    characterDetail.showEquipInfo();
                    characterDetail.pauseData = null;
                } else {
                    // console.log('장비 해제');
                    this.emit('unequipItem', result.data.category, player.id);
                    characterDetail.statItem.data = null;
                    characterDetail.updateEquip();
                    characterDetail.pauseData = null;
                }
                characterDetail.selected = this.player;
                characterDetail.updateStat();

            } else {
                if (this.playerInvenData.length !== 0) {
                    characterDetail.tempEquipData = this.playerInvenData;
                    characterDetail.showEquipInven();
                } else {
                    this.showConfirmModal('장착가능한 장비가 없습니다.', false, ()=>{
                        // TODO: 나중엔 상점으로 연결하면 되려나.
                    });
                }
            }
        });
    }
}
