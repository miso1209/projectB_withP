import PropBase from './propbase';
import AnimatedCharacter from '../animatedcharacter';
import { getDirectionFromName } from '../utils';
import { EventEmitter } from 'events';

export default class Monster extends PropBase {
    constructor(x, y, options) {
        super(x,y, options);

        this.isInteractive = true;
        this.isStop = false;

        // 몬스터는 에디터에서 정의된 것이 아니므로 별도로 필요한 옵션을 작성해준다
        const monster = options.src;
        const field = monster.fieldCharacter;
        // 이 오브젝트는 일반적인 타일 데이터를 쓰지 않고 캐릭터외형 정보를 가져와서 출력한다
        const fieldChar = new AnimatedCharacter(monster.fieldCharacter.character);
        fieldChar.changeVisualToDirection(getDirectionFromName(field.direction));
        fieldChar.animate('idle', true);
        this.addChild(fieldChar);
        this.tileTexture = fieldChar;

        this.emitter = new EventEmitter();
        this.hasEmitter = true;

        // TODO : 출력위치는 조정해야한다.
        this.src = monster;

        // name tag의 offset을 설정할 수 있도록 한다.
        this.nameTagOffset = {
            x: 0,
            y: (fieldChar.height / 2) + 5
        };
        // 초기에 이름을 보이고, hideName을 오버라이딩 하여, hide 하지 않도록 한다.
        this.showName();
    }

    touch(game) {
        // game.$enterBattle(this);
    }

    delete() {
        this.emit('delete');
    }

    move() {
        if (!this.tileTexture.isMoving) {
            this.isStop = false;
            this.emit('move');
        }
    }

    stop() {
        this.isStop = true;
    }

    emit(...arg) {
        this.emitter.emit(...arg);
    }

    on(...arg) {
        this.emitter.on(...arg);
    }

    hideName() {

    }

    showOutline() {
        // 움직이는 스프라이트에는 외곽선을 그릴수 없다..
    }

    showName() {
        if (!this.getName()) { 
            return; 
        }

        if (!this.nametag) {

            const style = new PIXI.TextStyle({fontSize: 1, fill : 0xffffff, align : 'center' });
            const name = new PIXI.Text(this.getName(), style);
            name.anchor.x = 0.5;
            name.anchor.y = 0.5;

            const dpsStyle = new PIXI.TextStyle({fontSize: 1, fill : 0xffffff, align : 'center' });
            const dps = new PIXI.Text(this.getDPS(), dpsStyle);
            dps.anchor.x = 0.5;
            dps.anchor.y = 0.5;
            dps.position.y += (name.height + dps.height)/2;

            // TODO : 이미지가 아니라 프랍자체에 붙여야 한다.
            this.nametag = new PIXI.Container();
            this.nametag.addChild(name);
            this.nametag.addChild(dps);
            this.nametag.position.x = (this.tileTexture.width / 2) + (this.nameTagOffset?this.nameTagOffset.x:0);
            this.nametag.position.y = -(this.tileTexture.height / 2) + (this.nameTagOffset?this.nameTagOffset.y:0);
            this.addChild(this.nametag);
            this.nametag.visible = false;

            const scale = 1 / 1.5;
            if (this.flipX) {
                this.nametag.scale.set(-scale, scale);
            } else {
                this.nametag.scale.set(scale, scale);
            }
        }

        this.nametag.visible = true;
    }

    // 가장 강한 녀석의 이름을 가져온다
    getName() {
        return "Monster";
    }

    // DPS는 파티의 DPS를 가져온다.
    getDPS() {
        return "전투력 100";
    }
}