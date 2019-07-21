import MakeDom from "./makedom";

export default class RadioButton {
  constructor(id, type, value) {
    const radio = new MakeDom('label', 'radioBtn');
    const checkmark = new MakeDom('i', 'checkmark');

    this.checked = false;

    this.option = document.createElement('input');
    this.option.setAttribute("type", "radio");
    this.option.id = id;
    this.option.name = type;
    this.option.value = value;
    
    radio.innerText = value;

    radio.appendChild(this.option);
    radio.appendChild(checkmark);

    this.option.addEventListener('click', this.onChanged.bind(this));
    this.dom = radio;

    return radio;
  }

  onChanged () {
    this.checked = true;
  }
}