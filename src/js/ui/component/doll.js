import MakeDom from "./makedom";

export default class Doll {
  constructor(item){ //캐릭터데이터-input
    const doll = document.createElement('div');
    doll.classList.add('doll');

    this.path = '/src/assets/sprite/';
    this.path = `${this.path}${item.data.name}/${item.data.name}_idle_sw.png`;

    const name = new MakeDom('p', 'name', item.data.displayname);
    const imgWrap = new MakeDom('p', 'imgWrap', null);
    const profile = new MakeDom('img', 'profileImg', null);
    profile.src = this.path;

    imgWrap.style.width = '64px';
    imgWrap.style.height = '96px';

    this.stage = new MakeDom('p', 'tilebg', null);
    imgWrap.appendChild(profile);
    // equipments
    doll.appendChild(this.stage);
    doll.appendChild(name);
    doll.appendChild(imgWrap);

    this.dom = doll;
  }
}