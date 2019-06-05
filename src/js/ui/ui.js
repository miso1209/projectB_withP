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

export default class DomUI extends EventEmitter {
    constructor() {
        super();
        
        this.gamePane = document.getElementById('canvas');
        this.screenWidth = this.gamePane.screenWidth;
        this.screenHeight = this.gamePane.screenHeight;

        // theatreUI 를 설정한다
        this.theaterUI = document.createElement('div');
        this.theaterUI.id = 'theater';
        this.theaterUI.style.top = this.gamePane.offsetTop + 'px';
        document.body.appendChild(this.theaterUI);

        // 메인 ui 를 설정한다
        this.gnbContainer = document.createElement('div');
        this.gnbContainer.className = 'gnbContainer';
        this.gnbContainer.style.top = this.gamePane.offsetTop + 'px';
        this.gnbContainer.style.opacity = '0';
        document.body.appendChild(this.gnbContainer);

        const gnb = document.createElement('div');
        gnb.className = 'gnb';
        this.gnbContainer.appendChild(gnb);

        const menuData = [
            {name:'캐릭터', event: "characterselect"},
            {name:'보관함', event: "inventory"},
            {name:'퀘스트', event: "quest"},
            {name:'설정', event: "options"}
        ];
        
        menuData.forEach(menu => {
            let btn = new Button(menu.name, 'tabBtn');
            gnb.appendChild(btn.dom);
            btn.dom.addEventListener('click', () => {
                this.emit(menu.event);
            });
        });

        this.zoomBtn = document.createElement('button');
        this.zoomBtn.classList.add('buttonS');
        this.zoomBtn.classList.add('zoomBtn');
        this.zoomBtn.innerText = 'x2';

        this.gnbContainer.appendChild(this.zoomBtn);

        this.showZoomBtn();
        this.zoomBtn.addEventListener('click', () => {
            this.emit('zoomInOut');
        });
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

    showDialog(script, callback) {
        const pane = this.createContainer();
        const dialog = new Dialog(pane, 700, 140, script);
    
        dialog.setText(script[0].text);
        if (script[0].speaker) {
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
    showConsumableItems(text, items, result) {
        const pane = this.createContainer();
        const confirmModal = new SystemModal(pane, 300, 250, text, result);
        confirmModal.dom.style.top = '50%';
        confirmModal.dom.style.marginTop = 250 * -0.5 + 'px';

        const options = new MakeDom('div', 'contents-option', null);
        items.forEach((item) => {
            console.log(item);
            let option = new ItemImage(item.data.image.texture, item.data.image.x, item.data.image.y);
            let count = new MakeDom('span', null, null);
            count.innerText = `x${item.owned}`;
            
            options.appendChild(option.dom);
            options.appendChild(count);
        });

        confirmModal.contents.appendChild(options);
        confirmModal.contents.style.margin = '10% auto';
        confirmModal.contents.style.fontSize = '1.1rem';
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

    showItemAquire(item, result) {
        const pane = this.createContainer();
        const domHeight = 300;
        const itemAcquire = new Modal(pane, 360, domHeight, () => {
            this.removeContainer(pane);
            if (result) {
                result();
            }
        });
        
        itemAcquire.addTitle('아이템 획득');
        itemAcquire.addCloseButton();
        itemAcquire.addConfirmButton('확인');
    
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

        itemAcquire.moveToCenter(0);
        itemAcquire.dom.style.top = '50%';
        itemAcquire.dom.style.marginTop = domHeight * -0.5 + 'px';

        itemAcquire.dom.appendChild(itemText);
        itemAcquire.dom.appendChild(itemSprite);
    }

    showInventory(inputs) {
        const pane = this.createContainer();
        const inven = new Inventory(pane, inputs);

        inven.moveToRight(70);
        inven.onTabSelected(inven.tabs[0].category);
    }

    showCharacterSelect(inputs, inven) {
        const pane = this.createContainer();
        // 물약데이터
        const characterSelect = new CharacterSelect(pane, inputs, inven, (info) => {
            if (typeof(info) === "object") {
                this.showCharacterDatail(info);
            } else {
                this.showConsumableItems('포션을 사용해서 체력을 회복하시겠습니까?', inven, (confirmed) => {
                    if (confirmed === "ok") {
                        console.log('포션 쓰기');
                    } 
                });
            }
        });
    }

    showCharacterDatail(player) {
        const pane = this.createContainer();
        const characterDetail = new CharacterDetail(pane, player);
    }
}
