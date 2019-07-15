import Panel from './panel';
import MakeDom from './makedom';

export default class StatBox extends Panel{
  constructor(type, value){
    super();

    // statBox
    const wrap = new MakeDom('div', 'infowrap');
    
    this.value = 0;
  }

  update(){

  }
}