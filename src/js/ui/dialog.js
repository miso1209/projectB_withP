import Panel from "./component/panel";
import NineBox from './component/ninebox';

export default class Dialog extends Panel {
    constructor(pane, width, height, script) {
        super();
    
        this.pane = pane;
    
        const dialog = new NineBox(this.pane, width, height, 'dialog');
        dialog.dom.className = 'dialog';
        dialog.moveToBottom(20);
        this.dom = dialog.dom;
    
        // dialogText
        const dialogText = document.createElement('p');
        this.dialogText = dialogText;
        this.dialogText.classList.add('contents');
        this.dom.appendChild(this.dialogText);
    
        // 캐릭터
        const speaker = document.createElement('img');
        speaker.className = 'dialog-speaker';
        dialog.dom.appendChild(speaker);
        this.speaker = speaker;
    
        // 캐릭터이름
        const speakerName = document.createElement('span');
        speakerName.className = 'name';
        dialog.dom.appendChild(speakerName);
        this.speakerName = speakerName;
    
        // 프람프트 
        const prompt = document.createElement('div');
        prompt.className = 'dialog-prompt';
        dialog.dom.appendChild(prompt);
        this.prompt = prompt;
    
        if (script !== null) {
            this.data = script;
            this.endIndex = this.data.length;
            this.currentIndex = 0;
        }
    
        this.onComplete = null;
        this.dom.addEventListener('click', this.nextDialog.bind(this));
    }

    nextDialog(event) {
        event.preventDefault();
    
        if (this.currentIndex < 0) {
            return;
        }
    
        if (this.dialogText.classList.contains('blinkAnim')) {
            return;
        } else {
            ++this.currentIndex;
            if (this.currentIndex === this.endIndex) {
                this.hideDialog();
        
                if (this.onComplete !== null) {
                    this.onComplete();
                    this.onComplete = null;
                }
                this.currentIndex = -1;
                this.dom.removeEventListener('click', this.nextDialog, true);
        
                return;
            }
            this.setText(this.data[this.currentIndex].text);
            this.showSpeaker(this.data[this.currentIndex].speaker);
        }
    }

    hidePrompt() {
        this.prompt.style.display = 'none';
    }
    
    showPrompt() {
        this.prompt.style.display = 'block';
    }
    
    showSpeaker(id) {
        if (id === 0) { // system dialog
            this.dom.classList.remove('portrait');
            return;
        }
        
        this.dom.classList.add('portrait');
        this.speaker.src = `/src/assets/player${id}.png`;
        this.speakerName.innerText = '헥터'; // todo - player name
    }
    
    setText(text) {
        this.dialogText.classList.add('blinkAnim');
        this.hidePrompt();
        this.dialogText.innerText = text;
    
        setTimeout(() => {
            if (this.dialogText.classList.contains('blinkAnim')) {
            this.dialogText.classList.remove('blinkAnim');
            this.showPrompt();
            }
        }, 700);
    }
    
    hideDialog() {
        this.pane.parentNode.removeChild(this.pane);
    }
}