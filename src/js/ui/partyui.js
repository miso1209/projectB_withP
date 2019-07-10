import Panel from "./component/panel";
import Modal from "./component/modal";
import MakeDom from "./component/makedom";
import Button from "./component/button";
import Avatar from "./component/avatar";
import ListBox from "./component/listbox";
import SystemModal from "./systemmodal";


const PARTY_SIZE = 6;

export default class PartyUI extends Panel {
  constructor(pane, inputs, partyinputs, result) {
    super();
    
    pane.classList.add('screen');

    this.inputs = inputs; // input 캐릭터 데이터
    this.party = partyinputs; // input 파티 데이터
    this.result = result; // 콜백
    this.selected = null; // 리스트에서 선택된 캐릭터

    this.members = []; 

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
    
    // todo 변수명을 바꿔야할듯.
    // 캐릭터 리스트 wrap
    this.ownedCharacters = new MakeDom('div', 'ownedCharacters');
    this.ownedCharacters.classList.add('flex-right');
    this.ownedCharacters.style.height = '340px';
    this.ownedCharacters.style.position = 'relative';

    this.totaldps = new MakeDom('p', 'totaldps');
    
    // 확인 버튼 콜백
    const submitButton = new Button('파티구성', 'submit');
    submitButton.moveToCenter(15);
    submitButton.moveToBottom(15);

    submitButton.dom.addEventListener('click', (ok)=> {
      pane.parentNode.removeChild(pane);
      return this.result('buttoncallback', 'partyConfirm');
    });

    modal.closeBtn.addEventListener('click', this.closeModal.bind(this, 'partyCancel'));

    this.ownedCharacters.appendChild(submitButton.dom);
    this.ownedCharacters.appendChild(this.totaldps);

    // 파티 리스트
    // characterList
    const characterListWrap = new MakeDom('div', 'characterListWrap');
    characterListWrap.classList.add('flex-left');

    this.characterList = new MakeDom('div', 'characterList');
    this.characterList.classList.add('party');
    this.characterList.style.width = '410px';

    characterListWrap.appendChild(this.characterList);
    
    wrapper.appendChild(characterListWrap);
    wrapper.appendChild(this.ownedCharacters);
    this.dom.appendChild(wrapper);

    pane.appendChild(this.dom);

    this.updateMembers();
    this.initList();
  }

  closeModal(callback) {
    if(this.result) {
      this.result('buttoncallback', callback)
    }
  }

  initList(){
    // 캐릭터 리스트 
    this.list = new ListBox(270, 200, this.select.bind(this));
    this.list.dom.style.top = '100px';
    this.ownedCharacters.appendChild(this.list.dom);
    this.list.update(this.inputs, 'character');
  }

  updateMembers(){
    let totalhealth = 0;
    let selectedavatar = null;

    this.totaldps.innerText = `${this.party.totalPowerFigure}`;
    this.characterList.innerHTML = '';

    for (let i = 0; i < PARTY_SIZE; i++) {
      this.members[i] = {
          character: this.party.members[i]?this.party.members[i]:null,
          x: i % 3,
          y: Math.floor(i / 3)
      };
    }
    
    this.members.forEach(member => {
      if(member.character !== null) {
        totalhealth+=member.character.health;
      }

      let avatar = new Avatar(member.character);

      if(avatar.dom.hasChildNodes('img')) {
        avatar.dom.classList.remove('empty');
      }

      this.characterList.appendChild(avatar.dom);

      avatar.dom.addEventListener('click', function(){
        if(selectedavatar) {
          selectedavatar.classList.remove('active');

          if (selectedavatar.classList.contains('isCrew')) {
            
            // 파티멤버 뺄 때-hp 체크
            if(member.character) {
              if ((totalhealth - member.character.health) < 1) {
                return;
              } 
              totalhealth -= member.character.health;
            }

            avatar.dom.innerHTML = '';
            avatar.dom.classList.remove('isCrew');
            avatar.dom.classList.add('empty');

            member.character = null;
          }
        }
        avatar.dom.classList.add('active');
        selectedavatar = avatar.dom;
      });

      avatar.dom.addEventListener('click', this.compose.bind(this, member));
    });
    // console.log('totalhealth '+ totalhealth);
  }

  select(data) {
    if(this.selected !== null) {
      this.selected.character = data;
      this.members.forEach(member => {
        if (member.x === this.selected.x && member.y === this.selected.y) {
          // 사망한 캐릭터를 파티에 넣을 때 남은 멤버의 hp의 합이 0이 되면 파티 수정 안되도록 막음..
          if(this.selected.character.health === 0) {
            console.log('사망한 캐릭터! ');
            return;
          }
          member = this.selected;
        }
      });

      const index = this.selected.y * 3 + this.selected.x;

      this.result(index, this.selected.character);
      this.updateMembers();
    }
  }
  
  compose(member) {
    // 현재 선택된 멤버의 좌표를 저장-
    // console.log('b');
    if(member.character === null) {
      const index = member.y * 3 + member.x;
      this.result(index, member.character);
      this.totaldps.innerText = `${this.party.totalPowerFigure}`;
    }
    this.selected = member;
  }
}