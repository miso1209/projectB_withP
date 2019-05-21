import Panel from "./component/panel";
import Modal from "./component/modal";
import ItemImage from "./component/itemimage";

export default class Inventory extends Panel {
    
    constructor(pane, inputs) {
        super();

        this.inputs = inputs;

        const inventory = new Modal(pane, 360, 460);
        this.dom = inventory.dom;
        
        inventory.addTitle('인벤토리');
        inventory.addCloseButton();
    
        this.tabs = [
            {category: 'weapon'},
            {category: 'armor'},
            {category: 'accessory'},
            {category: 'material'},
            {category: 'consumables'},
            {category: 'valuables'}
        ];
        
        inventory.addTab(this.tabs, this.tabs[0].category, this.onTabSelected.bind(this));
    
        // # stat
        const statContent = document.createElement('div');
        statContent.classList.add('contents-box');
        statContent.style.textAlign = 'left';
    
        inventory.dom.appendChild(statContent);
    
        // IE 스크롤바 이슈 대응
        const scrollView = document.createElement('div');
        scrollView.className = 'scrollView';
        scrollView.style.top = statContent.clientHeight + 100 + 'px';
    
        const scrollBlind = document.createElement('div');
        scrollBlind.className = 'scrollBlind';
    
        const storageContent = document.createElement('ul');
        storageContent.classList.add('contents-list');
        
        this.storageContent = storageContent;

        scrollView.appendChild(scrollBlind);
        scrollBlind.appendChild(storageContent);
        inventory.dom.appendChild(scrollView);
    }

    onTabSelected(category) {
        // 탭정보를 모두 지운다
        while (this.storageContent.firstChild) {
            this.storageContent.removeChild(this.storageContent.firstChild);
        }

        for (const input of this.inputs) {
            if (input.category === category) {
                // 여기서 아이템을 가져온다
                for (const item of input.items) {
                    const itemImage = new ItemImage(item.data.image.texture, item.data.image.x, item.data.image.y);
              
                    const slot = document.createElement('li');
                    slot.appendChild(itemImage.dom);
                    slot.style.height = '50px';
                    slot.addEventListener('click', function (event) {
                        // 아이템 클릭 이벤트를 추가
                    });

                    this.storageContent.appendChild(slot);
                }
            }
        }
    }
   
}