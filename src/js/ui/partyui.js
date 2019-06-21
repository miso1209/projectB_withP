import Panel from "./component/panel";
import Modal from "./component/modal";
import MakeDom from "./component/makedom";
import ItemImage from "./component/itemimage";
import Button from "./component/button";
import Doll from "./component/doll";
import ListBox from "./component/listbox";

export default class PartyUI extends Panel {
  constructor(pane, inputs, members, result) {
    super();
    
    pane.classList.add('screen');

    this.inputs = inputs; // 보유 캐릭터 리스트
    this.members = members; // 현재 파티 데이터
    this.result = result; // 파티구성 완성 콜백
    this.selected = null; // 리스트에서 선택된 캐릭터
    // this.isPartyMember = -1; // 현재 파티 구성원인 경우 인덱스값 저장..

    const modal = new Modal(pane, 800, 460, null);
    this.dom = modal.dom;
    this.dom.classList.add('party');
    
    modal.addTitle('파티 조합');
    modal.addCloseButton();
    
    // 전체 컨텐츠 wrapper
    const wrapper = document.createElement('div');
    wrapper.classList.add('contents');
    wrapper.classList.add('flexWrap');
    wrapper.style.top = '70px';
    
    // 확인 버튼 콜백
    const submitButton = new Button('파티구성', 'submit');
    submitButton.moveToCenter(0);
    submitButton.moveToBottom(15);

    submitButton.dom.addEventListener('click', (ok)=> {
      pane.parentNode.removeChild(pane);
      return this.result(this.members);
    });

    wrapper.appendChild(submitButton.dom);
    
    this.ownedMembers = new MakeDom('div', 'members', null);
    this.ownedMembers.classList.add('flex-right');

    // characterList
    const characterListWrap = new MakeDom('div', 'characterListWrap', null);
    characterListWrap.classList.add('flex-left');

    this.characterList = new MakeDom('div', 'characterList', null);
    this.characterList.style.width = '410px';

    characterListWrap.appendChild(this.characterList);
    
    wrapper.appendChild(characterListWrap);
    wrapper.appendChild(this.ownedMembers);
    this.dom.appendChild(wrapper);

    pane.appendChild(this.dom);
    
    this.initMembers();
    this.initList();
  }
  
  
  initList(){
    // 캐릭터 리스트 
    this.list = new ListBox(280, 320, this.select.bind(this));
    this.list.dom.style.top = '100px';
    this.ownedMembers.appendChild(this.list.dom);
    this.list.update(this.inputs, 'character');
  }

  initMembers(){
    let selectedDoll = null;
    let index = 0;
    let n = 0;

    // 파티 구성 배치도 그리기
    this.members.forEach(member => {
      let doll = new Doll(member.character);
      doll.dom.classList.add('doll');

      if (index === 0) {
        doll.dom.classList.add('active');
        selectedDoll = doll.dom;
        this.select(member);
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

      doll.dom.addEventListener('click', this.select.bind(this, member.character));
      this.characterList.appendChild(doll.dom);
    });
  } 
  
  select(data) {
    console.log(data);
    let index = -1;
    // this.members[index].push(data);
    // this.initMembers();
  }
}


