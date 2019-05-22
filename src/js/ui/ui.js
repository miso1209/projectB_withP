import { EventEmitter } from "events";
import Button from './component/button';
import Modal from "./component/modal";
import SystemModal from "./systemmodal";
import Dialog from "./dialog";
import RecipeUI from "./recipeui";
import ProgressUI from "./progressui";
import Inventory from "./inventory";

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
    }

    hideMenu() {
        // 기본 ui 를 가린다
        this.gnbContainer.style.opacity = '0';
    }

    showTheaterUI(){
        this.theaterUI.classList.add('show');
    }

    hideTheaterUI(){
        this.theaterUI.classList.remove('show');
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
        confirmModal.contents.style.fontSize = '1.1rem';
        confirmModal.contents.style.margin = '10% auto 0';
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
        const modal = new Modal(pane, 360, 300, () => {
            result(itemId);
            this.removeContainer(pane);
        });
    
        modal.addTitle('아이템 조합중');
        modal.addCloseButton();
        modal.addConfirmButton('조합완료');
    
        const itemText = document.createElement('div');
        itemText.className = 'contents';
        itemText.innerText = "아이템을 조합중";
        itemText.style.top = '60px';
    
        const loading = new ProgressUI(modal.dom, 2, (onComplete)=>{
            itemText.innerText = "아이템 조합 성공!"
        });
    
        loading.moveToCenter(130);

        modal.dom.appendChild(itemText);
        modal.dom.appendChild(loading.dom);
    }

    showItemAquire(itemId, result) {
        const pane = this.createContainer();
        let domHeight = 300;
        const itemAcquire = new Modal(pane, 360, domHeight, () => {
            this.removeContainer(pane);
            if (result) {
                result();
            }
        });
        
        itemAcquire.addTitle('NEW ITEM');
        itemAcquire.addCloseButton();
        itemAcquire.addConfirmButton('확인');
    
        let acquireText;
        const itemText = document.createElement('div');
        itemText.className = 'contents';
    
        if (itemId === 1) {
            acquireText = "[열쇠조각 A]를 얻었다";
        } else if (itemId === 2) {
            acquireText = "[열쇠조각 B]를 얻었다";
        } else if (itemId === 3) {
            acquireText = "[철문열쇠]를 얻었다";
        }

        itemText.innerText = acquireText;
        itemAcquire.dom.appendChild(itemText);
    
        const itemSprite = document.createElement('img');
        itemSprite.src = '/src/assets/items/item' + itemId + '.png';
        itemSprite.style.position = 'absolute';
        itemSprite.style.left = (itemAcquire.dom.clientWidth / 2 - 36) + 'px';
        itemSprite.style.top = itemText.offsetTop + itemText.offsetHeight / 2 + 25 + 'px';

        itemAcquire.dom.style.top = '50%';
        itemAcquire.dom.style.marginTop = domHeight * -0.5 + 'px';
        itemAcquire.dom.appendChild(itemSprite);
    }

    showInventory(inputs) {
        const pane = this.createContainer();
        const inven = new Inventory(pane, inputs);

        inven.moveToRight(70);
        inven.onTabSelected(inven.tabs[0].category);
    }
}

