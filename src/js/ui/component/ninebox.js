import Panel from "./panel";

export default class NineBox extends Panel {
    constructor(pane, _width, _height, _type) {
        super();
    
        const nineBox = document.createElement('div');
        nineBox.innerHTML = this.render();
        nineBox.classList.add('pixelBox');
        nineBox.style.width = _width + 'px';
        nineBox.style.height = _height + 'px';
    
        this.dom = nineBox;
        pane.appendChild(this.dom);
    
        for (let i = 0; i < nineBox.children.length; i++) {
            var pixel = nineBox.children[i];
            let gap;
      
            if (_type === 'dialog') {
                pixel.classList.add('dialog');
                gap = 16;
            } else {
                gap = 26;
            }
      
            if (pixel.classList.contains('_width')) {
                pixel.style.width = (_width - gap) + 'px';
            }
            if (pixel.classList.contains('_height')) {
                pixel.style.height = (_height - gap) + 'px';
            }
        }
    }
  
    render() {
        return `
            <div class="pixel"></div>
            <div class="pixel _width"></div>
            <div class="pixel"></div>
            <div class="pixel _height"></div>
            <div class="pixel _width _height"></div>
            <div class="pixel _height"></div>
            <div class="pixel"></div>
            <div class="pixel _width"></div>
            <div class="pixel"></div>
        `;
    }
}