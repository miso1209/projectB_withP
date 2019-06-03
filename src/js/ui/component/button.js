import Panel from "./panel";
import ItemImage from "./itemimage";

export default class Button extends Panel {
    constructor(value, type, onclick) {
        super();
    
        const button = document.createElement('button');
        const btnText = document.createElement('span');
        btnText.innerText = value;
        btnText.style.textShadow = '1px 2px 2px #444'
    
        button.appendChild(btnText);
        button.style.position = 'absolute';
    
        if (type !== undefined) {
            button.classList.add(type);
        } else {
            button.className = 'button';
        }
    
        this.dom = button;

        if(onclick !== null) {
            this.dom.addEventListener('click', onclick);
        }
    }
}

  