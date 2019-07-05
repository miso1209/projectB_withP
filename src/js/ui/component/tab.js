import ItemImage from './itemimage';

// 탭 클래스를 추가한다.
export default class Tab {
    constructor(tab, callback) {
        const iconMap = [
            {category: 'weapon', x:19, y:9},
            {category: 'armor', x:4, y:12},
            {category: 'accessory', x:11, y:3},
            {category: 'material', x:5, y:3},
            {category: 'consumables', x:10, y:0},
            {category: 'recipes', x:3, y:2}
        ];

        const tabButton = document.createElement('li');
        const tabImg = new ItemImage('items.png', 0, 0);
        
        for (const icon of iconMap) {
            if (icon.category === tab.category) {
                tabImg.updateImage(icon.x, icon.y);
                this.category = icon.category;
            }
        }
        
        this.dom = tabButton;
        this.callback = callback;
    
        tabButton.appendChild(tabImg.dom);
        this.dom.addEventListener('click', this.onclick.bind(this));
    }
  
    onclick(){
        if(this.callback !== null) {
            this.callback(this.category);
        }
    }
}
  