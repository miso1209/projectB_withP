import Panel from "./component/panel";
import Modal from "./component/modal";
import ItemImage from "./component/itemimage";
import MakeDom from "./component/makedom";

export default class Inventory extends Panel {
    
    constructor(pane, inputs) {
        super();

        this.inputs = inputs;
        const inventory = new Modal(pane, 800, 440);
        this.dom = inventory.dom;
        this.dom.classList.add('inventory');

        inventory.addTitle('인벤토리');
        inventory.addCloseButton();
        pane.classList.add('screen');
    
        this.tabs = [
            {category: 'weapon', display: '무기'},
            {category: 'armor', display: '갑옷'},
            {category: 'accessory', display: '악세사리'},
            {category: 'material', display: '재료'},
            {category: 'consumables', display: '포션'},
            {category: 'recipes', display: '레시피'}
        ];
        
        inventory.addTab(this.tabs, this.tabs[0].category, this.onTabSelected.bind(this));
    
        const wrapper = document.createElement('div');
        wrapper.classList.add('flexWrap');
        wrapper.classList.add('contents');
        
        const statContent = new MakeDom('div', 'flex-left');
        statContent.classList.add('statContent');

        const itemDetail = new MakeDom('div', 'inventory-detail');
        this.itemImg = new ItemImage('items@2.png', 0, 0);
        this.rankbg = new MakeDom('div', 'rankBg');
        this.itemRank = new ItemImage('icon_rank@2.png', "C", 0);
        this.itemRank.dom.classList.add('rank');

        itemDetail.appendChild(this.itemImg.dom);
        this.rankbg.appendChild(this.itemRank.dom);
        itemDetail.appendChild(this.rankbg);

        const itemInfo = new MakeDom('div', 'itemInfoWrap');
        this.itemCat = new MakeDom('p', 'itemCategory');
        this.itemCat.innerText = `${this.tabs[0].category}`;

        this.itemName = document.createElement('p');
        this.itemDesc = document.createElement('p');
        this.itemOptions = document.createElement('ul');
        
        this.itemName.className = 'itemImg';
        this.itemName.className = 'itemName';
        this.itemDesc.className = 'itemDesc';
        this.itemOptions.className = 'itemOptions';

        itemInfo.appendChild(this.itemName);
        itemInfo.appendChild(this.itemCat);

        itemInfo.appendChild(this.itemOptions);
        itemInfo.appendChild(this.itemDesc);

        statContent.appendChild(itemDetail);
        statContent.appendChild(itemInfo);

        const costswrap = new MakeDom('div', 'costswrap');
        this.gold = new MakeDom('div', 'gold', 0);
        costswrap.appendChild(this.gold);

        // # stat
        const invenWrap = new MakeDom('div', 'flex-right');
        
        let scrollHeight = '280px';

        // IE 스크롤바 이슈 대응
        const scrollView = document.createElement('div');
        scrollView.classList.add('scrollView');
        scrollView.style.top = statContent.clientHeight + 100 + 'px';

        const scrollBlind = document.createElement('div');
        scrollBlind.className = 'scrollBlind';
    
        this.storageContent = document.createElement('ul');
        this.storageContent.classList.add('slot-list-box');
        this.storageContent.classList.add('scrollbox');
        this.storageContent.style.height = scrollHeight;

        // 스크롤 이벤트 추가
        // storageContent.addEventListener('scroll', this.scrolled.bind(this, storageContent));
        this.slotSize = 24;

        scrollView.appendChild(scrollBlind);
        scrollBlind.appendChild(this.storageContent);

        wrapper.appendChild(statContent);
        wrapper.appendChild(invenWrap);

        invenWrap.appendChild(scrollView);
        invenWrap.appendChild(costswrap);
        
        inventory.dom.appendChild(wrapper);
    }

    scrolled(event) {
        //visible height + pixel scrolled = total height 
        if (event.offsetHeight + event.scrollTop == event.scrollHeight) {
            console.log(event.scrollTop);
        } 
    }

    onTabSelected(category) {
        this.itemCat.innerText = category;

        // 탭정보를 모두 지운다
        while (this.storageContent.firstChild) {
            this.selectedItemDetail(null);
            this.storageContent.removeChild(this.storageContent.firstChild);   
        }

        for (const input of this.inputs) {
            if (input.category === category) {
                // 탭에 아이템이 있으면 최초 아이템 정보를 뿌려준다
                this.selectedItemDetail(input.items[0]);

                let selected = null;
                let index = -1;

                // 여기서 아이템을 가져온다
                for (const item of input.items) {
                    ++index;

                    const itemImage = new ItemImage(item.data.image.texture, item.data.image.x, item.data.image.y);
                    const iconRank = new ItemImage('icon_rank.png', item.data.rank, 0);

                    const slot = document.createElement('li');
                    slot.classList.add('slot');
                    slot.appendChild(itemImage.dom);
                    slot.appendChild(iconRank.dom);
                    
                    const num = document.createElement('span');
                    num.className = 'inventory-itemCount';
                    num.innerText = item.owned;
                    
                    slot.appendChild(num);

                    if (index === 0) {
                        slot.classList.add('active');
                        selected = slot;
                    }
                    slot.addEventListener('click', function(){
                        if (selected ) {
                            selected .classList.remove('active');
                        }
                        slot.classList.add('active');
                        selected = slot;
                    });

                    slot.addEventListener('click', this.selectedItemDetail.bind(this, item));
                    this.storageContent.appendChild(slot);
                }
            }
        }

        let total = this.storageContent.childNodes.length;
        let emptySlot = this.slotSize - total; 

        if (total === 0) {
            emptySlot = this.slotSize;
            this.addSlot(emptySlot);
        } else {
            if (total > this.slotSize) {
                let page = Math.ceil(total/this.slotSize); 
                this.addSlot(this.slotSize*page);
            } else {
                this.addSlot(emptySlot);
            }
        }
    }

    selectedItemDetail(item) {
        if (item !== null) {
            this.itemImg.updateImage(item.data.image.x, item.data.image.y);
            this.itemName.innerText = item.data.name;
            this.itemDesc.innerText = item.data.description;
            this.itemRank.updateIcon(item.data.rank);
            // this.itemRank.dom.style.display = 'block';
            this.rankbg.style.display = 'block';

            if (this.itemOptions.children !== 0) {
                this.itemOptions.innerHTML = '';
            }

            item.data.options.forEach(option => {
                let li = document.createElement('li');
                li.innerText = option;
                this.itemOptions.appendChild(li);
            });
        } else {
            this.rankbg.style.display = 'none';

            this.itemImg.updateImage(0,0);
            this.itemName.innerHTML = '';
            this.itemDesc.innerHTML = '';
            this.itemOptions.innerHTML = '';
        }
    }

    addSlot(size) {
        // let selected = null;
        for (let i = 0; i < size; i++) {
            let slot = document.createElement('li');
            slot.classList.add('slot');
            this.storageContent.appendChild(slot);
            // slot.addEventListener('click', function(){
            //     if (selected) {
            //         selected.classList.remove('active');
            //     }
            //     slot.classList.add('active');
            //     selected = slot;
            // });
        }

    }
}

