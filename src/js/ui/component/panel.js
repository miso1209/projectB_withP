export default class Panel {
    

    moveToCenter(_top) {
        this.dom.style.position = 'absolute';
        this.dom.style.left = '0px';
        this.dom.style.right = '0px';
        this.dom.style.margin = `${_top}px auto 0`;
    }

    moveToLeft(_left) {
        this.dom.style.position = 'absolute';
        this.dom.style.left = `${_left}px`;
    }

    moveToRight(_right) {
        this.dom.style.position = 'absolute';
        this.dom.style.right = `${_right}px`;
    }

    moveToBottom(_bottom) {
        this.dom.style.position = 'absolute';
        this.dom.style.bottom = `${_bottom}px`;
        this.dom.style.top = 'auto';
    }

    setPosition(x, y) {
        this.dom.style.position = 'absolute';

        var offsetX = this.dom.offsetLeft;
        var offsetY = this.dom.offsetTop;

        this.dom.style.top = 'auto';
        this.dom.style.bottom = 'auto';

        this.dom.style.left = 'auto';
        this.dom.style.right = 'auto';
        this.dom.style.margin = '0';

        this.dom.style.left = offsetX + x + 'px';
        this.dom.style.top = offsetY + y + 'px';
    }

    setClass(dom, value) {
        return dom.classList.add(value);
    }

    remove(dom) {
        dom.parentNode.removeChild(dom);
    }

    destroy() {
        this.dom.parentNode.removeChild(this.dom);
    }
}