import Modal from './component/modal';
import Panel from './component/panel';
import Button from './component/button';
import ListBox from './component/listbox';
import ItemImage from './component/itemimage';
import MakeDom from './component/makedom';


class CombinerUI extends Panel {
    constructor(pane, width, height, callback) {
        super();
        
        const combineModal = new Modal(pane, width, height);
        this.dom = combineModal.dom;
        this.callback = callback;
    
        this.recipe = null;
        this.materialsData = null;

    
        const contents = document.createElement('div');
        contents.classList.add('contents');
        contents.classList.add('combineItemInfo');
    
        const combineItem = document.createElement('div');
        combineItem.className = 'combineItem';
    
        this.itemName = document.createElement('div');
        this.itemName.className = 'title';
    
        this.itemDesc = document.createElement('p');
        this.itemDesc.className = 'itemDesc';
    
        this.itemImg = new ItemImage('items@2.png', 21, 14);
        this.itemImg.dom.classList.add('itemImg');
    
        combineItem.appendChild(this.itemImg.dom);
        combineItem.appendChild(this.itemDesc);
        contents.appendChild(this.itemName);
        contents.appendChild(combineItem);
    
        this.comment = new MakeDom('p', 'comment');
        

        // 아이템 옵션
        this.options = document.createElement('ul');
        this.options.classList.add('options');
    
        // 재료 리스트
        this.materialInfo = document.createElement('ul');
        this.materialInfo.classList.add('materialInfo');
    
        const costswrap = new MakeDom('div', 'costswrap');
        this.costs = new MakeDom('div', 'gold', '0');
        // this.costs.classList.add('disabled');
        costswrap.appendChild(this.costs);

        const combineButton = new Button('제작');
        combineButton.moveToCenter(10);
        combineButton.moveToBottom(15);
        combineButton.dom.classList.add('disabled');
        
        this.button = combineButton.dom;
    
        contents.appendChild(this.options);
        contents.appendChild(this.materialInfo);
        
        contents.appendChild(costswrap);
        contents.appendChild(this.comment);

        this.dom.appendChild(contents);
        this.dom.appendChild(this.button);
    
        this.button.removeEventListener('click', this.doCombineItem.bind(this));
    }

    checkReason(){
        // 제작할 수 없는 원인 췍
    }

    update() {
        if (this.recipe !== null) {
            if (this.recipe.available === 1) {
                this.costs.classList.remove('disabled');
                this.comment.style.display = 'none';

                this.button.classList.remove('disabled');
                this.button.classList.add('isAvailable');
                this.button.addEventListener('click', this.doCombineItem.bind(this));
            } else {
                this.costs.classList.add('disabled');
                this.comment.innerText = '제작에 필요한 레벨이 부족합니다. ';
                this.comment.style.display = 'block';

                this.button.classList.add('disabled');
                this.button.classList.remove('isAvailable');
                this.button.removeEventListener('click', this.doCombineItem.bind(this));
            }
    
            // 기존데이터 초기화
            this.materialInfo.innerHTML = '';
            this.options.innerHTML = '';

            // this.recipe.data
            this.costs.innerText = this.recipe.gold;
            this.itemImg.updateImage(this.recipe.data.image.x, this.recipe.data.image.y);
            this.itemName.innerText = this.recipe.data.name;
            this.itemDesc.innerText = this.recipe.data.description;
            this.materialsData = this.recipe.materials;
            

            // 아이템 효과는 배열로 전달된다.
            for (const option of this.recipe.data.options ) {
                let node = document.createElement('li');
                node.className = 'li';
                node.innerText = option.toString();
                this.options.appendChild(node);
            }
            
            this.materialsData.forEach(mat => {
                let node = document.createElement('li');
                node.className = 'li';
        
                let material1 = new ItemImage(mat.data.image.texture, mat.data.image.x, mat.data.image.y);
                let material2 = document.createElement('p');
                let material3 = document.createElement('p');
                
                if ((mat.owned - mat.count) < 0) {
                    material3.style.color = 'red';
                }
                
                material2.innerText = `${mat.data.name}`;
                material3.innerText = `${mat.owned} / ${mat.count}`;
        
                node.appendChild(material1.dom);
                node.appendChild(material2);
                node.appendChild(material3);
            
                this.materialInfo.appendChild(node);
            });
        } 
    }
  
    doCombineItem() {
        if(this.recipe !== null) {
            this.callback(this.recipe);
            this.recipe = null;
        }
    }
}


export default class RecipeUI extends Panel {
    constructor(pane, width, height, callback) {
        super();
    
        this.recipeModal = new Modal(pane, width, height);
        this.recipeModal.addCloseButton();
        this.recipeModal.addTitle('아이템 레시피');
        this.combinerUI = null;
    
        this.pane = pane;
        this.dom = this.recipeModal.dom;
        this.callback = callback;
        this.category = null;
        this.recipes = null;
        this.tabs = [];
    
        this.list = new ListBox(320, 320, this.updateCombiner.bind(this));
        this.list.dom.style.top = '100px';
        this.dom.appendChild(this.list.dom);
    }
  
    select(category) {
        for(const input of this.inputs) {
            if (input.category === category) {
                this.category = input.category;
                this.recipes = input.recipes;
            }
        }
        this.update();
    }
  
    update(){
        this.recipeModal.setSubTitle(this.category);
        this.list.update(this.recipes, 'recipe');
        this.recipeModal.addTab(this.tabs, this.category, this.select.bind(this));
    
        if(this.recipes.length > 0) {
            // 아이템 조합창
            this.combinerUI = new CombinerUI(this.pane, 360, 460, this.onCombine.bind(this));
            this.combinerUI.moveToRight(100);
            
            // 최초실행 시 제일 처음 레시피 데이터로 업데이트
            this.updateCombiner(this.recipes[0]);
        } else {
            if ( this.combinerUI !== null ){
                this.remove(this.combinerUI.dom);
                this.combinerUI = null;
            }
        }
    }
  
    updateCombiner(data){
        this.combinerUI.recipe = data;
        this.combinerUI.update();
    }
  
    onCombine(combine){
        if(combine) {
            this.callback(combine);
            this.onClose();
        }
    }
  
    onClose() {
        this.remove(this.pane);
    }
}
  