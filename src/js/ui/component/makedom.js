
export default class MakeDom {
  constructor(element, classname, value) {
    const dom = document.createElement(element);

    if(classname && classname !== null) {
      dom.classList.add(classname);
    }
    if(value && value !== null) {
      dom.innerText = value;
    }
    this.dom = dom;
    return this.dom;
  }
  setText(text) {
    this.dom.innerText = text;
  }

  addClass(_name) {
    this.dom.classList.add(_name);
  }

  removeClass(_name) {
    this.dom.classList.remove(_name);
  }

  addID(_name) {
    this.dom.id = _name;
  }
}
