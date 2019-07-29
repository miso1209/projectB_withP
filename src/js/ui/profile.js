import Panel from './component/panel';
import MakeDom from './component/makedom';
import Button from './component/button';
import { ParsingNumber } from '../utils';

export default class Profile extends Panel {
    constructor(player, callback){

    super();
    
    this.player = player;
    const profileWrap = new MakeDom('div', 'profileWrap');
    const imageWrap = new MakeDom('div', 'imageWrap');
    const button = new Button('아바타 변경', 'textButton');
    
    profileWrap.addEventListener('click', ()=> {
      callback();
    });

    this.profileImg = new MakeDom('img', 'profile_img');
    imageWrap.appendChild(this.profileImg);
    imageWrap.appendChild(button.dom);

    const infoWrap = new MakeDom('div', 'infoWrap');
    this.avatar_dps = new MakeDom('div', 'statBox', 0);
    this.avatar_gold = new MakeDom('div', 'statBox', 0);
    
    infoWrap.appendChild(this.avatar_dps);
    infoWrap.appendChild(this.avatar_gold);

    profileWrap.appendChild(imageWrap);
    profileWrap.appendChild(infoWrap);

    this.dom = profileWrap;
  }

  updateAvatar(cid, player){
    const avatar = player.characters[cid];

    this.profileImg.src = `/src/assets/${avatar.data.portrait}`;
    this.avatar_dps.innerText = ParsingNumber(player.party.totalPowerFigure);
    this.avatar_gold.innerText = ParsingNumber(player.inventory.gold);
  }
}