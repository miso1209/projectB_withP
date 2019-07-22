import MakeDom from "./makedom";

export default class DropDown {
  constructor(min, max, result) {
    const wrap = new MakeDom('div', 'selectWrap');
    const select = new MakeDom('select', 'dropDown');
    
    for (let i = min; i < max+1; i++) {
      const option = new MakeDom('option', 'option', i);
      select.appendChild(option);
      option.addEventListener('change', ()=>{
        console.log(option);
        result(i);
      });
    }

    wrap.appendChild(select);
    this.dom = wrap;
  }

  onSelected() {

  }
}