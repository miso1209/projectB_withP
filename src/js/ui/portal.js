import Panel from './component/panel';
import Modal from './component/modal';
import MakeDom from './component/makedom';
import Button from './component/button';


export default class Portal extends Panel {
  constructor(pane, inputs, result){
    super();

    this.data = inputs;
    this.callback = result;

    const modal = new Modal(pane, 360, 320);
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

    // IE 스크롤바 이슈 대응
    const scrollView = document.createElement('div');
    scrollView.classList.add('scrollView');
    
    const scrollBlind = document.createElement('div');
    scrollBlind.className = 'scrollBlind';

    this.list = document.createElement('ul');
    this.list.classList.add('list-box');
    this.list.classList.add('scrollbox');

    scrollView.appendChild(scrollBlind);
    scrollBlind.appendChild(this.list);

    contents.appendChild(scrollView);

    this.showSelectableList();
  }

  showSelectableList(){
    this.list.innerHTML = '';
    for (const fid in this.data) {
      let liwrap = new MakeDom('li', 'li');
      const linkBtn = new Button(`${this.data[fid]}`, 'nav');
      liwrap.appendChild(linkBtn.dom);
      linkBtn.dom.addEventListener('click', this.moveToFloor.bind(this, fid));

      this.list.appendChild(liwrap);
    }
  }

  moveToFloor(floor){
    this.callback(floor);
    this.onClose();
  }

  onCancel(){
    this.callback('cancel');
    this.onClose();
  }

  onSubmit(){
    this.callback('ok');
    // this.onClose();
  }

  onClose(){
    this.pane.parentNode.removeChild(this.pane);
  }
}