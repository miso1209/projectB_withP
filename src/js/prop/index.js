// factory 클래스
export default class Prop {
    static factory = {};
    static Register(name, generator_func) {
        Prop.factory[name] = generator_func;
    }

    static New(name, ...args) {
        let func = Prop.factory[name] || Prop.factory["default"];
        return func(...args);
    }
}

import Gate from './gate';
import ItemContainer from './itemcontainer';
import Stove from './stove';
import WorkTable from './worktable';
import StaticProp from './staticprop';
import Monster from './monster';
import Wizard from './wizard';
import Chest from './chest';
import Recipe from './recipe';
import PortalStone from './portal_stone';
import Archer from './archer';
import Warrior from './warrior';
import Dragon from './dragon';
import PortalWizard from './portal_wizard';

Prop.Register("light", (...args) => { return new StaticProp(...args); });
Prop.Register("default", (...args) => { return new StaticProp(...args); });
Prop.Register("gate", (...args) => { return new Gate(...args); });
Prop.Register("inventory", (...args) => { return new ItemContainer(...args); });
Prop.Register("stove", (...args) => { return new Stove(...args); });
Prop.Register("worktable", (...args) => { return new WorkTable(...args); });
Prop.Register("monster", (...args) => { return new Monster(...args); });
Prop.Register("dragon", (...args) => { return new Dragon(...args); });
Prop.Register("archer", (...args) => { return new Archer(...args); });
Prop.Register("wizard", (...args) => { return new Wizard(...args); });
Prop.Register("chest", (...args) => { return new Chest(...args); });
Prop.Register("recipe", (...args) => { return new Recipe(...args); });
Prop.Register("portal_stone", (...args) => { return new PortalStone(...args); })
Prop.Register("ally_warrior", (...args) => { return new Warrior(...args); })
Prop.Register("portalwizard", (...args) => { return new PortalWizard(...args); })
