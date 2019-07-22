import MakeDom from "./makedom";

export default class DropDown {
  constructor(min, max, result) {
    this.callback = result;
    const wrap = new MakeDom('div', 'selectWrap');
    const select = new MakeDom('select', 'dropDown');

    for (let i = min; i < max + 1; i++) {
      const option = new MakeDom('option', 'option', i);
      option.setAttribute('value', i);
      select.appendChild(option);
    }
    select.addEventListener('change', (e)=> {
      this.callback(e.target.value);
    });

    wrap.appendChild(select);
    this.dom = wrap;
  }
}