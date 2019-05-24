import Panel from "./component/panel";
import Modal from "./component/modal";
import MakeDom from "./component/makedom";
import ItemImage from "./component/itemimage";
import Button from "./component/button";


export default class CharacterSelect extends Panel {
  constructor(pane, inputs, result) {
    super();

    // todo 현재 배틀용 캐릭터 데이터를 받아와서 작업. 이후 정제된 데이터로 수정한다.
    this.inputs = inputs;
    const pickme = new Modal(pane, 400, 460, result);
    this.dom = pickme.dom;
    this.dom.classList.add('pickme');

    pickme.addTitle('캐릭터 선택창');
    pickme.addCloseButton();
    pickme.addConfirmButton('자세히보기','submit');
    pane.classList.add('screen');

    this.prevButton = new Button('Prev', 'buttonS');
    this.prevButton.moveToBottom(20);
    this.prevButton.moveToLeft(20);
    this.nextButton = new Button('Next', 'buttonS');
    this.nextButton.moveToBottom(20);
    this.nextButton.moveToRight(20);
    
    pickme.dom.appendChild(this.prevButton.dom);
    pickme.dom.appendChild(this.nextButton.dom);
    

    const wrap = document.createElement('div');
    wrap.className = 'contents';
    wrap.style.top = '50px';
    this.dom.appendChild(wrap);

    // characterDetail 
    const characterDesc = new MakeDom('div', 'descWrap', null);
    characterDesc.classList.add('characterDesc');
    this.descName = document.createElement('p');
    
    // characterList
    const characterList = new MakeDom('div', 'characterList', null);

    let selected = null;
    let index = 0;
    let n = 0;

    inputs.forEach(input => {
      let doll = new Doll(input);
      doll.dom.classList.add('doll');

      if (index === 0) {
        doll.dom.classList.add('active');
        selected = doll.dom;
        this.select(input);
      }
      
      if (n >= 4) {
        n = 0;
        // todo 타일용 index 따로 만들자.
      }

      let posX = -70 * n;

      ++index;
      ++n;

      doll.stage.style.backgroundPosition = `${posX}px 0`;

      doll.dom.addEventListener('click', function(){
        if(selected) {
          selected.classList.remove('active');
        }
        doll.dom.classList.add('active');
        selected = doll.dom;
      });

      doll.dom.addEventListener('click', this.select.bind(this, input));
      characterList.appendChild(doll.dom);
    });

    // paging

    // button
    characterDesc.appendChild(this.descName);
    wrap.appendChild(characterDesc);
    wrap.appendChild(characterList);

    pane.appendChild(this.dom);
  }

  select(current) {
    this.descName.innerText = current.data.displayname;
  }
}

class Doll {
  constructor(item){ //캐릭터데이터-input
    const doll = document.createElement('div');
    doll.classList.add('doll');

    this.path = '/src/assets/';
    this.path = `${this.path}${item.data.name}/${item.data.name}_idle_sw.png`;

    if(item.data.name === 'hector') {
      this.path = '/src/assets/night/idle_sw.png';
    }
    const name = new MakeDom('p', 'name', item.data.displayname);
    const profile = new MakeDom('img', 'profileImg', null);
    profile.src = this.path;

    // profile.style.width = '32px';
    // profile.style.height = '48px';

    this.stage = new MakeDom('p', 'tilebg', null);
    
    // equipments
    doll.appendChild(this.stage);
    doll.appendChild(name);
    doll.appendChild(profile);

    this.dom = doll;
  }
}



