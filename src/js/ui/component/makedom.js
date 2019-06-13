
export default class MakeDom {
  constructor(element, classname, value) {
    const dom = document.createElement(element);

    if (classname && classname !== null) {
      dom.classList.add(classname);
    }
    if (value && value !== null) {
      dom.innerText = value;
    }
    
    this.dom = dom;
    return this.dom;
  }
}
