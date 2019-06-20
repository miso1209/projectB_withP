import Panel from "./panel";
import ItemImage from "./itemimage";

export default class Button extends Panel {
    constructor(value, type, onclick) {
        super();
    
        const button = document.createElement('button');
        button.innerText = value;
        button.style.textShadow = '1px 2px 2px #444'
        button.style.position = 'absolute';
    
        if (type !== undefined) {
            button.classList.add(type);
        } else {
            button.className = 'button';
        }
    
        this.dom = button;
        // if(onclick !== null) {
        //     this.dom.addEventListener('click', onclick);
        // }
    }
}

  