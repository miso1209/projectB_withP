import Panel from './component/panel';
import Modal from './component/modal';
import MakeDom from './component/makedom';
import Button from './component/button';


export default class Portal extends Panel {
  constructor(pane, inputs, result){
    super();

    this.data = inputs;
    this.callback = result;

    const modal = new Modal(pane, 360, 360);
    modal.addTitle('포털');
    modal.dom.classList.add('portal');

    this.dom = modal.dom;
    this.pane = pane;

    const contents = new MakeDom('div', 'contents');
    modal.dom.appendChild(contents);

    const comment = new MakeDom('p', 'comment', '이동할 층을 고르세요.');
    contents.appendChild(comment);
    
    const buttonWrap = document.createElement('div');
    buttonWrap.className = 'buttonWrap';

    const okButton = new Button('리스트 갱신', 'submit');
    const cancelButton = new Button('취소');

    buttonWrap.appendChild(cancelButton.dom);
    buttonWrap.appendChild(okButton.dom);
    
    cancelButton.dom.addEventListener('click', this.onCancel.bind(this));
    okButton.dom.addEventListener('click', this.onSubmit.bind(this));
    contents.appendChild(buttonWrap)

    // 항상 이동가능한 선택지는 5개로 랜덤하게 보여줌. 
    this.list = document.createElement('ul');
    this.list.classList.add('portal_list');

    contents.appendChild(this.list);
    this.showSelectableList(this.data);
  }

  showSelectableList(data){
    this.list.innerHTML = '';
    for (const fid in data) {
      let liwrap = new MakeDom('li', 'li');
      const linkBtn = new Button(`${data[fid]}`, 'nav');
      liwrap.appendChild(linkBtn.dom);
      linkBtn.dom.addEventListener('click', this.onSelect.bind(this, fid));

      this.list.appendChild(liwrap);
    }
  }

  onSelect(floor){
    if(this.callback) {
      this.callback(floor);
      this.onClose();
    }
  }

  onCancel(){
    if(this.callback){
      this.callback('cancel');
      this.onClose();
    }
  }

  onSubmit(){
    if(this.callback) {
      this.callback('ok');
    }    
  }

  onClose(){
    this.pane.parentNode.removeChild(this.pane);
  }
}