import Panel from "./component/panel";
import Modal from "./component/modal";
import Button from "./component/button";

export default class SystemModal extends Panel {
    constructor(pane, width, height, text, callback) {
      super();
        this.pane = pane;
        this.pane.classList.add('screen');
    
        const confirmModal = new Modal(this.pane, width, height);
        confirmModal.dom.id = 'SYSTEM';
    
        const descText = document.createElement('p');
        descText.className = 'contents';
        descText.innerText = text;
        confirmModal.dom.appendChild(descText);
    
        this.contents = descText;
        this.callback = callback;
    
        const okButton = new Button('OK', 'submit');
        const cancelButton = new Button('CANCEL');
    
        confirmModal.dom.appendChild(okButton.dom);
        confirmModal.dom.appendChild(cancelButton.dom);
    
        okButton.moveToLeft(20);
        cancelButton.moveToRight(20);
        okButton.moveToBottom(20);
        cancelButton.moveToBottom(20);
    
        okButton.dom.addEventListener('click', this.onSubmit.bind(this));
        cancelButton.dom.addEventListener('click', this.onCancel.bind(this));
    
        this.response = null;
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