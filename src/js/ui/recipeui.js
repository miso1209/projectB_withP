import Modal from './component/modal';
import Panel from './component/panel';
import Button from './component/button';
import ListBox from './component/listbox';
import ItemImage from './component/itemimage';
import MakeDom from './component/makedom';
import DropDown from './component/dropdown';
import { parsingOption } from '../utils';


class CombinerUI extends Panel {
    constructor(pane, width, height, callback) {
        super();
        
        const combineModal = new Modal(pane, width, height);
        this.dom = combineModal.dom;
        this.callback = callback;
        
        this.recipe = null;
        this.materialsData = null;
        this.count = 1;


        const contents = document.createElement('div');
        contents.classList.add('contents');

        const combineItem = document.createElement('div');
        combineItem.className = 'combineItem';
    
        this.itemName = document.createElement('div');
        this.itemName.className = 'title';
    
        this.itemDesc = document.createElement('p');
        this.itemDesc.className = 'itemDesc';
    
        this.itemImg = new ItemImage('items@2.png', 21, 14);
        this.itemImg.dom.classList.add('itemImg');
        this.comment = new MakeDom('p', 'comment');
        
        const rankWrap = new MakeDom('div', 'rankBg');
        combineItem.appendChild(rankWrap);

        this.itemRank = new ItemImage('icon_rank.png', 'c', 0);
        this.itemRank.dom.classList.add('rank');
        rankWrap.appendChild(this.itemRank.dom);

        const combineItemInfo = new MakeDom('div', 'combineItemInfo');
        contents.appendChild(combineItemInfo);

        // 아이템 옵션
        this.options = document.createElement('ul');
        this.options.classList.add('options');
    
        // 재료 리스트
        this.materialInfo = document.createElement('ul');
        this.materialInfo.classList.add('materialInfo');

        
        const totalCount = new MakeDom('section', 'total');
        // 수량선택
        const selectCountWrap = new MakeDom('div', 'countWrap');
        const countText = new MakeDom('strong', 'text', '수량');
        this.selectNum = new DropDown(1, 9, (result)=>{
            // console.log('select----' + result);
            this.updateCount(result);
        });

        selectCountWrap.appendChild(countText);
        selectCountWrap.appendChild(this.selectNum.dom);
    
        const costswrap = new MakeDom('div', 'costswrap');
        this.costs = new MakeDom('div', 'gold', '0');
        costswrap.appendChild(this.costs);

        totalCount.appendChild(selectCountWrap);
        totalCount.appendChild(costswrap);

        this.availableCount = new MakeDom('p', 'availableCount', 0);
        
        const buttonWrap = new MakeDom('div', 'buttonWrap');
        const combineButton = new Button('제작', 'submit');
        combineButton.dom.classList.add('wide');
        combineButton.dom.classList.add('disabled');
        
        this.button = combineButton.dom;
        this.button.removeEventListener('click', this.doCombineItem.bind(this));

        contents.appendChild(this.itemName);
        contents.appendChild(this.comment);
        contents.appendChild(this.itemDesc);
        
        combineItem.appendChild(this.itemImg.dom);
        combineItem.appendChild(this.options);
        // combineItemInfo.appendChild(this.options);
        combineItemInfo.appendChild(this.materialInfo);

        // 하단 영역 고정 - 가격, 버튼
        // buttonWrap.appendChild(costswrap);
        buttonWrap.appendChild(this.button);

        contents.appendChild(combineItem);
        contents.appendChild(this.availableCount);
        contents.appendChild(combineItemInfo);

        contents.appendChild(totalCount);
        contents.appendChild(buttonWrap);
        this.dom.appendChild(contents);
    }

    checkReason() {
        let reasons = this.recipe.reason;
        // console.log(reasons);

        this.comment.style.display = 'none';
        this.costs.classList.remove('disabled');

        reasons.forEach(reason => {
            if(reason.level === false) {
                this.comment.innerText = '제작에 필요한 레벨이 부족합니다. ';
                this.comment.style.display = 'block';
            } else if (reason.gold === false) {
                this.costs.classList.add('disabled');
            } 
        });
    }

    updateCount(num) {
        // 제작가능한 수량 계산
        if (this.recipe !== null) {
            this.costs.innerText = this.recipe.gold * num;
            this.count = num;
            this.updatematerialInfo();
        }
    }

    updatematerialInfo(){
        this.materialInfo.innerHTML = '';

        this.recipe.materials.forEach(mat => {
            let node = new MakeDom('li', 'li');
            let material1 = new ItemImage(mat.data.image.texture, mat.data.image.x, mat.data.image.y);
            let material2 = new MakeDom('p', 'mat_name');
            let material3 = new MakeDom('p', 'mat_count');

            // 스타일이 적용되는 타겟이 각각 생성되므로, ui 단계에서 체크
            if (mat.owned - mat.count < 0) {
                material3.classList.add('unavailable')
            }
            
            material2.innerText = `${mat.data.name}`;
            material3.innerText = `${mat.owned} / ${mat.count * this.count}`;

            node.appendChild(material1.dom);
            node.appendChild(material2);
            node.appendChild(material3);
        
            this.materialInfo.appendChild(node);
        });
    }

    update() {
        if (this.recipe !== null) {
            if (this.recipe.available === 1) {
                this.comment.style.display = 'none';
                this.costs.classList.remove('disabled');

                this.button.classList.remove('disabled');
                this.button.classList.add('isAvailable');
                this.button.addEventListener('click', this.doCombineItem.bind(this));
                
            } else {
                this.checkReason();

                this.button.classList.add('disabled');
                this.button.classList.remove('isAvailable');
                this.button.removeEventListener('click', this.doCombineItem.bind(this));
            }

            // 기존데이터 초기화
            this.materialInfo.innerHTML = '';
            this.options.innerHTML = '';

            // 제작가능한 수량
            // 드롭다운에 최대값 재설정
            this.selectNum.update(1, this.recipe.maxCount);
            this.availableCount.innerHTML = `제작가능 <em>[${this.recipe.maxCount}]</em>`;
            // 드롭다운 선택값 * 골드 

            // this.recipe.data
            this.costs.innerText = this.recipe.gold;
            this.itemImg.updateImage(this.recipe.data.image.x, this.recipe.data.image.y);
            this.itemName.innerText = this.recipe.data.name;
            this.itemDesc.innerText = this.recipe.data.description;
            this.itemRank.updateIcon(this.recipe.data.rank);

            // 아이템 효과는 배열로 전달된다.
            for (const option of this.recipe.data.options ) {
                let node = new MakeDom('li', 'li');
                node.innerText = parsingOption(option);
                this.options.appendChild(node);
            }
            this.updatematerialInfo();
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
        this.recipeModal.dom.classList.add('recipe');
        this.recipeModal.addCloseButton();
        this.recipeModal.addTitle('아이템 레시피');
        this.combinerUI = null;
    
        this.pane = pane;
        this.dom = this.recipeModal.dom;
        this.callback = callback;
        this.category = null;
        this.recipes = null;
        this.tabs = [];
        
        this.recipeCategory = new MakeDom('p', 'recipe-category', 'recipe');

        const contents = new MakeDom('div', 'contents');
        this.list = new ListBox((width - 40), 320, this.updateCombiner.bind(this));
        this.list.dom.classList.add('recipeList');

        contents.appendChild(this.recipeCategory);
        contents.appendChild(this.list.dom);
        this.dom.appendChild(contents);
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
        this.recipeCategory.innerText = this.category;

        this.list.update(this.recipes, 'recipe');
        this.recipeModal.addTab(this.tabs, this.category, this.select.bind(this));
    
        if(this.recipes.length > 0) {
            // 아이템 조합창
            this.combinerUI = new CombinerUI(this.pane, 360, 440, this.onCombine.bind(this));
            this.combinerUI.dom.classList.add('combiner');
            this.combinerUI.moveToRight(80);
            
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
            // console.log(this.combinerUI.count);
            this.callback(combine, this.combinerUI.count);
            this.onClose();
        }
    }
    onClose() {
        this.remove(this.pane);
    }
}
  