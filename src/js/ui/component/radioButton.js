import MakeDom from "./makedom";

export default class RadioButton {
  constructor(id, type, value) {
    const rad = new MakeDom('label', 'radioBtn');
    const checkmark = new MakeDom('i', 'checkmark');
    
    this.option = document.createElement('input');
    this.option.setAttribute("type", "radio");
    this.option.id = id;
    this.option.name = type;
    this.option.value = value;

    rad.innerText = value;

    rad.appendChild(this.option);
    rad.appendChild(checkmark);

    // this.option.addEventListener('click', this.onChanged.bind(this));
    this.dom = rad;

    return rad;
  }

  // onChanged () {
  //   this.checked = this.option.value;
  // }
}