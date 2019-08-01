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
import Setting from "./setting";
import Portal from "./portal";
import { ParsingNumber } from "../utils";


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
        this.settingBtn = new Button('', 'settingBtn');
        gnb.appendChild(this.settingBtn.dom);
        this.settingBtn.dom.addEventListener('click', ()=>{
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
        this.questData = null;
        this.portals = null;
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

    showQuestStatus(currentQuest) {
        setTimeout(() => {
            // class 제거 함수랑 동시에 호출되는 경우가 생기면 비동기 호출로 적용이 되지 않는 경우가 생겨서 딜레이 걸어둠. 
            // TOOD async...then.... 수정...음음..
            this.questStatus.innerHTML = '';
            this.questStatus.classList.remove('show');

            const frag = document.createDocumentFragment();
            const title = new MakeDom('p', 'quest_name', currentQuest.title);
            const desc = new MakeDom('p', 'quest_desc', `퀘스트`);
            frag.appendChild(title);
            frag.appendChild(desc);

            title.innerText = currentQuest.title;

            if (currentQuest.success) {
                desc.innerText = `퀘스트가 완료되었습니다.`;
            } else {
                desc.innerText = `신규 퀘스트가 추가되었습니다.`;
            }
            this.questStatus.appendChild(frag);
            this.questStatus.classList.add('show');

            if(this.questWrap) {
                this.hideQuest(close);
            }
        }, 10);
    }
    resetQuestStatus() {
        this.questStatus.classList.remove('show');
    }

    showSetting() {
        // input : 현재 설정정보.
        const pane = this.createContainer();
        pane.classList.add('screen');

        const settingModal = new Setting(pane, (type, value)=>{
            this.emit('setVolume', type, value);
        });
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
        Sound.playSound('modal_1.wav', { singleInstance: true });
    }

    showUseItemModal(text, items, result) {
        const pane = this.createContainer();
        const confirmModal = new SystemModal(pane, 300, 240, text, true, result);

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

    showCraftUI(itemCount, result) {
        const pane = this.createContainer();
        pane.classList.add('screen');

        let domHeight = 240;
        
        const modal = new Modal(pane, 360, domHeight);
        modal.addTitle('아이템 조합중');

        const itemText = document.createElement('div');
        itemText.className = 'contents';
        itemText.innerText = "아이템을 조합중입니다.";
        itemText.style.top = '60px';

        const interval = 4;
        Sound.playSound('anvil_1.wav', { singleInstance: true });
        const loading = new ProgressUI(modal.dom, interval, (onComplete)=>{
            itemText.innerText = "아이템 조합 성공!"
            this.removeContainer(pane);
            result();
        });
    
        loading.moveToCenter(130);
        
        modal.dom.appendChild(itemText);
        modal.dom.appendChild(loading.dom);
    }

    showBlackScreen() {
        console.log('showBlackScreen');
        // this.displayLayer.style.backgroundColor = 'rgba(0,0,0,1)';
    }
    hideBlackScreen() {
        console.log('hideBlackScreen');
        // this.displayLayer.style.backgroundColor = 'transparent';
    }

    // 아이템 획득
    showItemAcquire(text, inputs, result) {
        const pane = this.createContainer();
        pane.classList.add('screen');

        const acquire = new ItemAcquire(pane, text, inputs, (response) => {
            this.removeContainer(pane);

            if (result) {
                result();
            }
        });
        Sound.playSound('modal_1.wav', { singleInstance: true });
    }

    // 포털 리스트 모달
    showPortals(inputs, callback) {
        const portaldom = document.querySelector('.portal');

        if (this.portals && portaldom) {
            this.portals.showSelectableList(inputs);
        } else {
            const pane = this.createContainer();
            pane.classList.add('screen');
            const portals = new Portal(pane, inputs, callback);
            this.portals = portals;
        }
    }

    // 퀘스트 모달
    showQuestModal(inputs, quest){
        if(this.questWrap) {
            this.hideQuest(close);
        }

        if (inputs.length === 0) {
            // 진행할 수 있는 퀘스트가 없고, 신규로 받을 수 있는 퀘스트도 없는 상태.. 
            this.showConfirmModal('현재 새로운 퀘스트가 없습니다.', false, ()=>{});
            return;
        }
        const pane = this.createContainer();
        pane.classList.add('screen');
        const questModal = new QuestModal(pane, inputs, quest, (status, result) => {

            if (status === 'checkNotify') {
                this.emit(status, result.id);
            } else {
                if (result.type === 'Acceptable') {
                    this.emit('addQuest', result.id);
                } else {
                    this.emit('completeQuest', result.id);
                }

                questModal.questData = this.questData;
                questModal.updateList();
            }
        });
        // this.hideQuest();
    }

    showInventory(inputs, inven_gold) {
        const pane = this.createContainer();
        const inventory = new Inventory(pane, inputs);
        pane.classList.add('screen');

        if (inven_gold) {
            inventory.gold.innerText = ParsingNumber(inven_gold);
        }

        inventory.moveToRight(70);
        inventory.onTabSelected(inventory.tabs[0].category);
    }

    showParty(inputs, partyinputs){
        const pane = this.createContainer();
        pane.classList.add('screen');

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
                            // this.showConfirmModal('Full HP.....', false, ()=>{});
                            // 피가 만땅일때 포션은 사용되지 않음. TODO 모달 외에 표현방법을 찾아보자
                            return;
                        } else {
                            this.emit('useItem', selected.data.id, 1, characterSelect.selected);
                            characterSelect.updateStatus(characterSelect.selected);

                            if(characterSelect.selected.health === characterSelect.selected.maxHealth) {
                                characterSelect.recoveryAvatar();
                            }

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
            
            if (characterDetail.pauseData !== null && characterDetail.pauseData.category === result.category) {
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
