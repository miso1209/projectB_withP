import Panel from "./panel";
import ItemImage from './itemimage';

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
        } else {
            this.showCharacterCell();
        }
    }
  
    showRecipeCell() {
        if (this.cellData.available === 1) {
            this.cell.classList.remove('disabled');
            this.cell.classList.add('isAvailable');
        }
        const imgData = this.cellData.data.image;
        this.cellImg = new ItemImage(imgData.texture, imgData.x, imgData.y);
        
        this.cellData1 = document.createElement('p');
        this.cellData2 = document.createElement('p');
        this.cellData3 = document.createElement('p');
    
        this.cellData1.innerText = this.cellData.data.name;
        this.cellData2.innerText = this.cellData.owned;
        this.cellData3.className = 'availableIcon';
    
        this.cell.appendChild(this.cellImg.dom);
        this.cell.appendChild(this.cellData1);
        this.cell.appendChild(this.cellData2);
        this.cell.appendChild(this.cellData3);
    }

    showCharacterCell(){
        this.cell.classList.remove('disabled');

        this.cellImg = document.createElement('img');
        this.cellImg.src = `/src/assets/${this.cellData.data.portrait}`;
        this.cellData1 = document.createElement('p');
        this.cellData2 = document.createElement('p');
        this.cellData3 = document.createElement('p');
    
        this.cellData1.innerText = this.cellData.data.displayname;
        this.cellData2.innerText = this.cellData.data.class;
        this.cellData3.innerText = `DPS : ${this.cellData.totalPowerFigure}`;
    
        this.cell.appendChild(this.cellImg);
        this.cell.appendChild(this.cellData1);
        this.cell.appendChild(this.cellData2);
        this.cell.appendChild(this.cellData3);
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
  
      const scrollBlind = document.createElement('div');
      scrollBlind.className = 'scrollBlind';
      scrollBlind.style.height = viewHeight;
      scrollBlind.style.width = viewWidth + '20px';
  
      scrollView.style.width = viewWidth;
  
      this.list = document.createElement('ul');
      this.list.classList.add('list-box');
      this.list.style.margin = '10px 0';
      this.list.style.height = viewHeight;
      this.list.style.width = viewWidth;
  
      scrollView.appendChild(scrollBlind);
      scrollBlind.appendChild(this.list);
  
      this.dom = scrollView;
      this.callback = callback;
    }
  
    update (listData, celltype) {
        if (listData.length < 1) {
            // this.list.innerHTML = '해당 카테고리 레시피가 없습니다.';
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
  