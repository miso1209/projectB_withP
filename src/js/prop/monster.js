import PropBase from './propbase';
import AnimatedCharacter from '../animatedcharacter';
import { getDirectionFromName } from '../utils';

export default class Monster extends PropBase {
    constructor(x, y, options) {
        super(x,y, options);

        this.isInteractive = true;

        // 몬스터는 에디터에서 정의된 것이 아니므로 별도로 필요한 옵션을 작성해준다
        const monster = options.src;
        const field = monster.fieldCharacter;
        // 이 오브젝트는 일반적인 타일 데이터를 쓰지 않고 캐릭터외형 정보를 가져와서 출력한다
        const fieldChar = new AnimatedCharacter(monster.fieldCharacter.character);
        fieldChar.changeVisualToDirection(getDirectionFromName(field.direction));
        fieldChar.animate('idle', true);
        this.addChild(fieldChar);

        this.tileTexture = fieldChar.anim;

        // TODO : 출력위치는 조정해야한다.
        this.src = monster;
    }

    touch(game) {
        // 전투를 시작한다
        game.enterBattle(this.src);
    }
}