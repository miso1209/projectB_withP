
export default class MakeDom {
  constructor(element, classname, value) {
    const dom = document.createElement(element);
    dom.classList.add(classname);

    if(value !== null) {
      dom.innerText = value;
    }
    
    this.dom = dom;
    return this.dom;
  }

  addClassName(_name) {
    this.dom.classList.add(_name);
  }
  removeclassName(_name) {
    this.dom.classList.remove(_name);
  }
}
