import Panel from "./panel";
// import ItemImage from "./itemimage";

export default class Button extends Panel {
    constructor(value, type) {
        super();
        const button = document.createElement('button');
        button.innerText = value;
    
        if (type !== undefined) {
            button.classList.add(type);
        } else {
            button.className = 'button';
        }

        this.dom = button;
    }
}

  