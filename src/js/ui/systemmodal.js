import Panel from "./component/panel";
import Modal from "./component/modal";
import Button from "./component/button";

export default class SystemModal extends Panel {
    constructor(pane, width, height, text, cancelable, callback) {
      super();
        this.pane = pane;
        this.pane.classList.add('screen');
    
        const confirmModal = new Modal(this.pane, width, height);
        confirmModal.dom.id = 'SYSTEM';
    
        this.contents = document.createElement('p');
        this.contents.className = 'contents';
        this.contents.innerText = text;
        confirmModal.dom.appendChild(this.contents);
    
        this.callback = callback;
        this.cancelable = cancelable;

        const buttonWrap = document.createElement('div');
        buttonWrap.className = 'buttonWrap';

        const okButton = new Button('확인', 'submit');
        const cancelButton = new Button('취소');

        okButton.dom.style.position = 'static';
        cancelButton.dom.style.position = 'static';
        if(this.cancelable) {
            buttonWrap.appendChild(cancelButton.dom);
            cancelButton.dom.addEventListener('click', this.onCancel.bind(this));
        } else {
            okButton.moveToCenter(0);
            okButton.moveToBottom(20);
        }
        buttonWrap.appendChild(okButton.dom);
        okButton.dom.addEventListener('click', this.onSubmit.bind(this));
        
        confirmModal.dom.appendChild(buttonWrap);
        this.dom = confirmModal.dom;
    }
  
    onSubmit() {
        this.onclose();
        this.callback('ok');
    }
    onCancel() {
        this.onclose();
        this.callback('cancel');
    }
    onclose() {
        this.dom.parentNode.parentNode.removeChild(this.dom.parentNode);
    }
}