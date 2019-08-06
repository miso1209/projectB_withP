import Panel from "./panel";
import ItemImage from './itemimage';
import MakeDom from './makedom';
import StatusBar from './statusbar'


class ListCell {
    constructor(cellData, cellType){
        this.cell = document.createElement('li');
        this.cell.classList.add('list-cell');
        this.cell.classList.add('disabled');

        this.cellData = cellData;
        this.index = null;

        // 타입별로 리스트의 셀 스타일을 교체함.
        if ( cellType === 'recipe') {
            this.showRecipeCell();
        } else if ( cellType === 'character') {
            this.showCharacterCell();
        } else {
            console.log('리스트 박스 셀은 각각 데이터별로 만들어야할 듯... ');
        }
    }
  
    showRecipeCell() {
        // console.log(this.cellData);

        if (this.cellData.available === 1) {
            this.cell.classList.remove('disabled');
            this.cell.classList.add('isAvailable');
        }

        const imgData = this.cellData.data.image;
        this.cellImg = new ItemImage(imgData.texture, imgData.x, imgData.y);
        
        this.cellData1 = new MakeDom('p', 'recipe_name');
        this.cellData2 = new MakeDom('p', 'recipe_rank');
        // this.cellData3 = new MakeDom('p', 'recipe_owned');
        this.cellData4 = new MakeDom('p', 'recipe_level');
        this.cellData5 = new MakeDom('p', 'availableIcon');
    
        this.cellData1.innerText = this.cellData.data.name;
        this.cellData2.innerText = this.cellData.data.rank;
        // this.cellData3.innerText = `${this.cellData.owned}`;
        this.cellData4.innerText = `Lv.${this.cellData.level}`;

        this.cell.appendChild(this.cellImg.dom);
        this.cell.appendChild(this.cellData1);
        this.cell.appendChild(this.cellData2);
        // this.cell.appendChild(this.cellData3);
        this.cell.appendChild(this.cellData4);
        // this.cell.appendChild(this.cellData5);
    }

    showCharacterCell(){
        this.cell.classList.remove('disabled');

        this.cellImg = document.createElement('img');
        this.cellImg.src = `/src/assets/${this.cellData.data.portrait}`;
        this.cellData1 = document.createElement('p');
        this.cellData2 = document.createElement('p');
        this.cellData3 = document.createElement('div');
    
        this.cellData1.innerText = this.cellData.data.displayname;
        this.cellData2.innerText = `DPS : ${this.cellData.totalPowerFigure}`;

        const datawrap = document.createElement('section');
        const statWrap = new MakeDom('div', 'statwrap');
        this.hp = new StatusBar(this.cellData.health, this.cellData.maxHealth);
        this.hp.dom.removeChild(this.hp.barName);

        statWrap.appendChild(this.hp.dom);
        datawrap.appendChild(this.cellData1);
        datawrap.appendChild(this.cellData2);
        datawrap.appendChild(statWrap);

        this.cell.appendChild(this.cellImg);
        this.cell.appendChild(datawrap);
    }
}
  
export default class ListBox extends Panel {
    constructor(_viewWidth, _viewHeight, callback) {
      super();
  
      let viewHeight = _viewHeight + 'px';
      let viewWidth = _viewWidth + 'px';
  
      // IE 스크롤바 이슈 대응
      const scrollView = document.createElement('div');
      scrollView.className = 'scrollView';
      scrollView.style.width = viewWidth;
  
      const scrollBlind = document.createElement('div');
      scrollBlind.className = 'scrollBlind';
      scrollBlind.style.height = viewHeight;
  
      this.list = document.createElement('ul');
      this.list.classList.add('list-box');
      this.list.classList.add('scrollbox');
      this.list.style.width = viewWidth;
  
      scrollView.appendChild(scrollBlind);
      scrollBlind.appendChild(this.list);
  
      this.dom = scrollView;
      this.callback = callback;
    }
  
    update (listData, celltype) {
        this.list.scrollTop = 0;
        
        if (listData.length < 1) {
            this.list.innerHTML = '데이터가 없습니다.';
            return;
        } else {
            this.list.innerHTML = '';
    
            let selectedCell = null;
            let index = -1;
    
            for (const data of listData) {
                ++index;
        
                let listCell = new ListCell(data, celltype);
                listCell.available = data.available;
                listCell.index = index;
        
                if (index === 0) {
                    listCell.cell.classList.add('active');
                    selectedCell = listCell.cell;
                }
        
                listCell.cell.addEventListener('click', function () {
                    if (selectedCell) {
                        selectedCell.classList.remove('active');
                    }
                    listCell.cell.classList.add('active');
                    selectedCell = listCell.cell;
                });
                listCell.cell.addEventListener('click', this.setData.bind(this, data));
                this.list.appendChild(listCell.cell);
            }
        }
    }
  
    setData(data){
        this.callback(data);
    }
}
  