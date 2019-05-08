import FieldCharacter from './fieldcharacter';
import BattleCharacter from './battlecharacter';
import CharacterSpec from './characterspec';
import Player from './player';


export default class CharacterFactory {
    static resources;
    static isLoaded = false;

    // 초기에 호출하여 캐릭터 정보를 전부 load해 두어야 그 후에 찍어낼 때 문제가 없다.
    static loadCharacterJson(callback) {
        if(!CharacterFactory.isLoaded) {
            const loader = new PIXI.loaders.Loader();
            const resources = [
                'hector',
                'elid',
                'miluda',
                'warrior',
                'healer'
            ];

            CharacterFactory.isLoaded = true;

            for(const resource of resources) {
                loader.add(require(`../assets/json/${resource}.json`));
            }
            
            loader.load((_, resources) => { 
                CharacterFactory.resources = resources;
                if (callback) {
                    callback();
                }
            });
        }
    }

    // Spec을 만들고 이 Spec을 Field Character, Battle Character가 공유.
    static createCharacterSpec(name) {
        return new CharacterSpec(CharacterFactory.resources[require(`../assets/json/${name}.json`)].data);
    }

    static createBattleCharacter(spec) {
        return new BattleCharacter(spec);
    }

    static createFieldCharacter(spec) {
        return new FieldCharacter(spec);
    }
    
    // 음.. Player의 대펴 캐릭터( 걸어다니는 캐릭터 ) 는 변경 가능해야하지 않을까..?
    // JSon의 이름을 받게 처리를 해야할까..? 아니면 생성된 character를 받아서 player가 내부에 avatar로 가지고 있어야 할까..?
    // 
    // ex 1.) createPlayer('hector')
    // 
    // ex 2.) const avartar = createHector();
    //        createPlayer(avatar)
    // 
    static createPlayer(spec) {
        return new Player(spec);
    }
}