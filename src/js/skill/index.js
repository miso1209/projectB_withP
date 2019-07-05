import Slash from './slash';
import FireBolt from './firebolt';
import ShotArrow from './shotarrow';
import ShieldAttack from './shieldattack';
import DouobleAttack from './doubleattack';
import WandAttack from './wandattack';
import Crouch from './crouch';
import Runaway from './runaway';
import FireRain from './firerain';
import Heal from './heal';
import ArrowOfTracker from './arrowoftracker';
import CriticalAttack from './criticalattack';
import AntiPower from './antipower';
import FireCape from './firecape';
import Breath from './breath';
import BleedSlash from './bleedslash';

const skills = require('json/skills.json');

export default class Skill {
    static factory = {};
    static Register(name, generator_func) {
        Skill.factory[name] = generator_func;
    }

    static New(name, ...args) {
        const func = Skill.factory[name];
        // 데이터를 넣어본다..
        return func(skills[name], ...args);
    }
}
// BOSS
Skill.Register("breath", (...args) => {
    return new Breath(...args);
});

// Hector
Skill.Register("crouch", (...args) => {
    return new Crouch(...args);
});
Skill.Register("runaway", (...args) => {
    return new Runaway(...args);
});

// Assassin
Skill.Register("bleedslash", (...args) => {
    return new BleedSlash(...args);
})

// Warrior
Skill.Register("slash", (...args) => { 
    return new Slash(...args); 
});
Skill.Register("shieldattack", (...args) => {
    return new ShieldAttack(...args);
});
Skill.Register("doubleattack", (...args) => {
    return new DouobleAttack(...args);
});

// Wizard
Skill.Register("firebolt", (...args) => { 
    return new FireBolt(...args); 
});
Skill.Register("firecape", (...args) => { 
    return new FireCape(...args); 
});
Skill.Register("firerain", (...args) => { 
    return new FireRain(...args); 
});

// Archer
Skill.Register("shotarrow", (...args) => { 
    return new ShotArrow(...args); 
});
Skill.Register("criticalattack", (...args) => { 
    return new CriticalAttack(...args); 
});
Skill.Register("arrowoftracker", (...args) => { 
    return new ArrowOfTracker(...args); 
});

// Healer
Skill.Register("wandattack", (...args) => {
    return new WandAttack(...args);
});
Skill.Register("antipower", (...args) => {
    return new AntiPower(...args);
});
Skill.Register("heal", (...args) => {
    return new Heal(...args);
});