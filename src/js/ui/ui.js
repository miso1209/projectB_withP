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
import Profile from "./profile";
import QuestList from "./quest";
import QuestModal from "./questModal";


export default class DomUI extends EventEmitter {
    constructor() {
        super();

        this.flagArray = [false, false, false, false];

        this.gamePane = document.getElementById('canvas');
        this.screenWidth = this.gamePane.screenWidth;
        this.screenHeight = this.gamePane.screenHeight;
        
        // theatreUI 를 설정한다
        this.theaterUI = new MakeDom('div');
        this.theaterUI.id = 'theater';
        this.theaterUI.style.top = this.gamePane.offsetTop + 'px';

        // 메인 ui 를 설정한다
        this.gnbContainer = new MakeDom('div', 'gnbContainer');
        this.gnbContainer.style.top = this.gamePane.offsetHeight + this.gamePane.offsetTop - 100 + 'px';
        this.gnbContainer.style.opacity = '0';

        // 스테이지타이틀, 튜토리얼 툴팁용 레이어
        this.displayLayer = new MakeDom('div', 'container');
        this.displayLayer.style.top = this.gamePane.offsetTop + 'px';
        this.questWrap = null;

        this.profile = new MakeDom('div', 'gnb-profile');
        this.gnbContainer.appendChild(this.profile);
        
        const gnb = new MakeDom('div', 'gnb-navi');
        gnb.id = 'Navigation';
        this.gnbContainer.appendChild(gnb);

        this.minimapDOM = document.createElement('canvas');
        this.minimapDOM.classList.add('minimap');
        this.minimapDOM.style.width = '165px';
        this.minimapDOM.style.height = '106px';
        this.minimapDOM.style.display = 'none';
        
        this.displayLayer.appendChild(this.minimapDOM);
        this.minimap = new Minimap(165, 106, this.minimapDOM);
        const menuData = [
            {index:0, name:'캐릭터', event: "characterselect"},
            {index:1, name:'보관함', event: "inventory"},
            {index:2, name:'파티', event: "party"},
            {index:3, name:'퀘스트', event: "quest"}
            // {name:'설정', event: "options"}
        ];
        
        menuData.forEach(menu => {
            let btn = new Button(menu.name, 'nav');
            gnb.appendChild(btn.dom);
            btn.dom.addEventListener('click', () => {
                this.clearFlag(menu.index);
                this.emit(menu.event);
            });
        });

        // 설정버튼
        this.setting = new Button('', 'setting');
        gnb.appendChild(this.setting.dom);
        this.setting.dom.addEventListener('click', ()=>{
            this.emit('options');
        });

        document.body.appendChild(this.gnbContainer);
        document.body.appendChild(this.displayLayer);
        document.body.appendChild(this.theaterUI);

        // 스테이지 정보
        this.stageInfo = new MakeDom('div', 'stageInfo');
        this.displayLayer.appendChild(this.stageInfo);

        this.questStatus = new MakeDom('div', 'questStatusBar');
        this.displayLayer.appendChild(this.questStatus);

        // game data
        this.player = null;
        this.character = null;
        this.playerInvenData = null;
        this.characters = null;
    }

    clearFlag(index) {
        this.flagArray[index] = false;
        this.checkFlag();
    }

    checkFlag() {
        const gnb = document.getElementById('Navigation');

        for (const fid in this.flagArray) {
            let flag = this.flagArray[fid]
            if (flag) {
                gnb.childNodes[fid].classList.add('new');
            } else {
                gnb.childNodes[fid].classList.remove('new');
            }
        }
    }

    showCompleteQuest(currentQuest) {
        // console.log('showCompleteQuest');
        // console.log(currentQuest);
        this.questStatus.innerHTML = '';

        const frag = document.createDocumentFragment();
        const title = new MakeDom('p', 'quest_name', currentQuest.title);
        const desc = new MakeDom('p', 'quest_desc', `퀘스트가 완료되었습니다.`);
        title.innerText = currentQuest.title;
        desc.innerText = `퀘스트가 완료되었습니다.`;

        frag.appendChild(title);
        frag.appendChild(desc);

        if (currentQuest.success) {
            this.questStatus.classList.add('show');
        }
        this.questStatus.appendChild(frag);
    }

    resetQuestStatus() {
        this.questStatus.classList.remove('show');
    }

    showQuest(questlist) {
        if (this.questWrap !== null) {
            this.questWrap.inputs = questlist;
            this.questWrap.update();
            return;
        } else {
            this.questWrap = new QuestList(questlist, (result)=>{
                this.emit('quest', result);
            });
            this.questWrap.dom.addEventListener('click', ()=>{
                this.questWrap.dom.classList.toggle('open');
    
                if(this.questWrap.dom.classList.contains('open')) {
                    this.emit('questList');
                }
            });
            this.displayLayer.appendChild(this.questWrap.dom);
        }
    }
    
    hideQuest(close) {
        if(close) {
            if(this.questWrap.dom.classList.contains('open'))
            this.questWrap.dom.classList.remove('open');
            return;
        } else {
            const quest = this.displayLayer.querySelector('.questWrap');
            if(quest) {
                this.displayLayer.removeChild(quest);
                this.questWrap = null;
            }
        }
    }

    showProfile(player){
        if (this.player_profile)  {
            this.updateProfile();
            return;
        } 

        this.player_profile = new Profile(player, () => {
            this.emit('characterselect');
        });

        this.player_profile.updateAvatar(player.controlCharacter, this.player);
        this.profile.appendChild(this.player_profile.dom);
    }

    updateProfile(){
        // dps, gold 변할 때 같이 호출되야함.
        this.player_profile.updateAvatar(this.player.controlCharacter, this.player);
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'uiContainer';
        container.style.top = this.gamePane.offsetTop + 'px';
        document.body.appendChild(container);

        return container;
    }
    
    removeContainer(pane) {
        document.body.removeChild(pane);
    }

    showMenu() {
        // 기본 ui 를 보여준다
        this.gnbContainer.style.opacity = '1';
        this.gnbContainer.style.display = 'block';
        this.emit('questList');
    }

    hideMenu() {
        // 기본 ui 를 가린다
        this.gnbContainer.style.opacity = '0';
        this.gnbContainer.style.display = 'none';
        
        this.resetQuestStatus();
        this.hideQuest();
    }

    showTheaterUI(){
        this.theaterUI.classList.add('show');
    }

    hideTheaterUI(){
        this.theaterUI.classList.remove('show');
    }

    showMinimap() {
        this.minimapDOM.style.display = 'block';
        this.stageInfo.style.opacity = '1';
    }

    hideMinimap() {
        this.minimapDOM.style.display = 'none';
        this.stageInfo.style.opacity = '0';
    }
    
    hasModal() {
        const currentUI = document.querySelector('.uiContainer');
        if (currentUI) {
            return true;
        }
        return false;
    }

    showStageInfo(text) {
        this.stageInfo.style.opacity = '1';
        this.stageInfo.innerText = text;
    }

    showStageTitle(text) {
        let tt = this.displayLayer.querySelector('.stageTitle');
        const stageTitle = new MakeDom('h2', 'stageTitle');

        if(this.displayLayer.querySelector('.stageTitle')) {
            stageTitle.innerText = text; 
            this.displayLayer.removeChild(tt);
            this.displayLayer.appendChild(stageTitle);   
        } else {
            this.displayLayer.appendChild(stageTitle);   
            stageTitle.innerText = text; 
        }
        this.showStageInfo(text);
    }
    
    showDialog(script, callback) {
        const pane = this.createContainer();
        const dialog = new Dialog(pane, 700, 140, script);
        Sound.playSound('dialog_1.wav', { singleInstance: true });
    
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
        Sound.playSound('modal_1.wav', { singleInstance: true });
    }

    showUseItemModal(text, items, result) {
        const pane = this.createContainer();
        const confirmModal = new SystemModal(pane, 300, 240, text, true, result);

        confirmModal.dom.style.top = '50%';
        confirmModal.dom.style.marginTop = 240 * -0.5 + 'px';

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
        this.recipeUI = new RecipeUI(pane, 420, 440, callback);
        
        for (const input of inputs) {
            this.recipeUI.tabs.push({category: input.category});
            this.recipeUI.inputs = inputs;
        }
    
        if (inputs.length > 0) {
            this.recipeUI.select(inputs[0].category);
        }
        this.recipeUI.moveToLeft(110);
    }

    showCraftUI(itemId, result) {
        const pane = this.createContainer();
        pane.classList.add('screen');

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
        Sound.playSound('anvil_1.wav', { singleInstance: true });
        const loading = new ProgressUI(modal.dom, interval, (onComplete)=>{
            itemText.innerText = "아이템 조합 성공!"
            this.removeContainer(pane);
            result(itemId);
        });
    
        loading.moveToCenter(130);
        
        modal.dom.appendChild(itemText);
        modal.dom.appendChild(loading.dom);
    }

    showBlackScreen() {
        console.log('showBlackScreen');
        this.displayLayer.style.backgroundColor = 'rgba(0,0,0,1)';
    }
    hideBlackScreen() {
        console.log('hideBlackScreen');
        this.displayLayer.style.backgroundColor = 'transparent';
    }

    // 아이템 획득
    showItemAcquire(text, inputs, result) {
        const pane = this.createContainer();
        const acquire = new ItemAcquire(pane, text, inputs, (response) => {
            this.removeContainer(pane);

            if (result) {
                result();
            }
        });
        Sound.playSound('modal_1.wav', { singleInstance: true });
    }
    
    // 퀘스트 모달
    showQuestModal(inputs, quest){
        

        // console.log();
        if(inputs.length === 0) {
            // 진행할 수 있는 퀘스트가 없고, 신규로 받을 수 있는 퀘스트도 없는 상태.. 
            this.showConfirmModal('현재 새로운 퀘스트가 없습니다.', false, ()=>{});
            return;
        }
        const pane = this.createContainer();
        const questModal = new QuestModal(pane, inputs, quest, (result) => {
            if(result.type === 'Acceptable') {
                this.emit('addQuest', result.id);
            } else {
                this.emit('completeQuest', result.id);
            }
        });

        
        this.hideQuest(close);
    }

    showInventory(inputs, inven_gold) {
        const pane = this.createContainer();
        const inventory = new Inventory(pane, inputs);
    
        if (inven_gold) {
            inventory.gold.innerText = inven_gold;
        }

        inventory.moveToRight(70);
        inventory.onTabSelected(inventory.tabs[0].category);
    }

    showParty(inputs, partyinputs){
        const pane = this.createContainer();
        const party = new PartyUI(pane, inputs, partyinputs, (id, result) => {
            if (id === 'buttoncallback') {
                if (result === 'partyConfirm') {
                    this.showConfirmModal('파티구성이 완료되었습니다.', false, ()=>{
                        this.emit(result);    
                        this.removeContainer(pane);
                    });
                }
            } else {
                this.emit('setParty', id, result);
            }
        });
    }

    showCharacterSelect(inputs) {
        const avatar = this.player.controlCharacter;
        const pane = this.createContainer();
        pane.classList.add('screen');
        const characterSelect = new CharacterSelect(pane, inputs, avatar, (result, option) => {
            if(result === 'characterDetail') {
                this.showCharacterDatail(option);
            } else if(result === 'setMainAvatar'){
                this.emit('setMainAvatar', option);
                characterSelect.avatar = this.player.controlCharacter;
            }
        });
        
        // consumables
        this.emit('playerInvenData', {category: 'consumables'});
        characterSelect.consumablesData = this.playerInvenData;

        const useItem = ((selected) => {
            if (selected !== null) {
                this.showUseItemModal('포션을 사용하시겠습니까?', selected, (confirmed) => {
                    if (confirmed === "ok") {
                        if( characterSelect.selected.health === characterSelect.selected.maxHealth) {
                            this.showConfirmModal('full--hp.....', false, ()=>{});
                            console.log('full--hp');
                        } else {
                            this.emit('useItem', selected.data.id, 1, characterSelect.selected);
                            characterSelect.updateStatus(characterSelect.selected);
                            this.emit('playerInvenData', {category:'consumables'});
                            characterSelect.consumablesData = this.playerInvenData;
                            characterSelect.createConsumablesItem(useItem);
                        }
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

                characterDetail.selected = this.character;
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
