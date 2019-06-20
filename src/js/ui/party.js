import Panel from "./component/panel";
import Modal from "./component/modal";
import MakeDom from "./component/makedom";
import ItemImage from "./component/itemimage";
import Button from "./component/button";
import Doll from "./component/doll";

export default class Party extends Panel {
  constructor(pane, inputs, result) {
    super();

    this.inputs = inputs; // 현재 파티 정보
    this.result = result; // 파티구성 데이터
    this.selected = null;
    this.members = []; 
       
    const modal = new Modal(pane, 800, 460, null);
    this.dom = modal.dom;
    this.dom.classList.add('party');

    modal.addTitle('파티 조합');
    modal.addCloseButton();
    pane.classList.add('screen');
    
    const wrap = document.createElement('div');
    wrap.classList.add('contents');
    wrap.classList.add('flexWrap');
    wrap.style.top = '70px';

    
    this.descClass = new MakeDom('span', 'stat_class', null);
    // 확인 버튼 콜백
    const submitButton = new Button('파티구성', 'submit');
    submitButton.moveToCenter(0);
    submitButton.moveToBottom(15);
    submitButton.dom.addEventListener('click', (ok)=> {
      pane.parentNode.removeChild(pane);
      return this.result(this.members);
    });


    wrap.appendChild(submitButton.dom);
    
    const ownedMembers = new MakeDom('div', 'members', null);
    ownedMembers.classList.add('flex-right');

    // characterList
    const characterListWrap = new MakeDom('div', 'characterListWrap', null);
    characterListWrap.classList.add('flex-left');

    const characterList = new MakeDom('div', 'characterList', null);
    characterList.style.width = '410px';
    
    let selectedDoll = null;
    let index = 0;
    let n = 0;

    // 캐릭터 데이터가 6개 넘어갈 때 - 처리는 페이징 해야하는데 그러려면. .
    inputs.forEach(input => {
      let doll = new Doll(input);
      doll.dom.classList.add('doll');

      if (index === 0) {
        doll.dom.classList.add('active');
        selectedDoll = doll.dom;
        this.select(input);
      }
      
      if (n >= 4) {
        n = 0; // todo 타일용 index 따로 만들자.
      }

      let posX = -70 * n;

      ++index;
      ++n;

      doll.stage.style.backgroundPosition = `${posX}px 0`;
      doll.dom.addEventListener('click', function(){
        if(selectedDoll) {
          selectedDoll.classList.remove('active');
        }
        doll.dom.classList.add('active');
        selectedDoll = doll.dom;
      });

      doll.dom.addEventListener('click', this.select.bind(this, input));
      characterList.appendChild(doll.dom);
    });

    characterListWrap.appendChild(characterList);
    
    wrap.appendChild(characterListWrap);
    wrap.appendChild(ownedMembers);
    this.dom.appendChild(wrap);

    pane.appendChild(this.dom);
  }

  select(current) {
    // this.selected = current;
    // const path = '/src/assets/';
    // this.descClass.innerText = current.data.displayname;
    // this.descName.innerText = current.name;
    // this.portrait.src = path + current.data.portrait;
    // this.level.innerText = 'Lv.' + current.level;

    // this.updateHealth();
    // this.updateStatus(current);
  }

  updateStatus(current){

  }
}


