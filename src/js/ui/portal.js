import Panel from './component/panel';
import Modal from './component/modal';
import MakeDom from './component/makedom';

export default class Portal extends Panel {
  constructor(pane, inputs, result){
    super();

    this.data = inputs;
    this.callback = result;

    const modal = new Modal(pane, 360, 360);
    modal.addTitle('포털');
    modal.dom.classList.add('portal');

    this.dom = modal.dom;

    pane.classLlist.add('screen');
    this.pane = pane;

    const contents = new MakeDom('div', 'contents');
    modal.dom.appendChild(contents);

    const comment = new MakeDom('p', 'comment', '이동할 층을 고르세요.');
    contents.appendChild(comment);

    
    const buttonWrap = document.createElement('div');
    buttonWrap.className = 'buttonWrap';

    const okButton = new Button('확인', 'submit');
    const cancelButton = new Button('취소');

    buttonWrap.appendChild(cancelButton.dom);
    buttonWrap.appendChild(okButton.dom);

    cancelButton.dom.addEventListener('click', this.onCancel.bind(this));
    okButton.dom.addEventListener('click', this.onSubmit.bind(this));
    contents.appendChild(buttonWrap)

    this.createList();
  }

  createList(){
    this.data.forEach(input => {
      
    });
  }
  updateList(){
    // 캐쉬 소모 후에 리스트 새로고침

  }

  onCancel(){
    this.callback('cancel');
    this.onClose();
  }

  onSubmit(){
    this.callback('ok');
    this.onClose();
  }

  onClose(){
    this.pane.parentNode.removeChild(this.pane);
  }
}