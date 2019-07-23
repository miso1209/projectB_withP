import MakeDom from "./makedom";

export default class DropDown {
  constructor(min, max, result) {
    this.callback = result;
    const wrap = new MakeDom('div', 'selectWrap');
    this.select = new MakeDom('select', 'dropDown');

    wrap.appendChild(this.select);
    this.dom = wrap;

    this.update(min, max);
  }

  update(min, max){
    this.select.innerHTML = '';

    if (max === 0) {
      this.select.setAttribute('disabled', 'disabled');
    } else {
      this.select.removeAttribute('disabled');
    }

    for (let i = min; i < max + 1; i++) {
      const option = new MakeDom('option', 'option', i);
      option.setAttribute('value', i);
      this.select.appendChild(option);
    }
    this.select.addEventListener('change', (e)=> {
      this.callback(e.target.value);
    });
  }
}