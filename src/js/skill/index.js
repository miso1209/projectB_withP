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
Skill.Register("breath", (...arg) => {
    return new Breath(...arg);
});

// Hector
Skill.Register("crouch", (...arg) => {
    return new Crouch(...arg);
});
Skill.Register("runaway", (...arg) => {
    return new Runaway(...arg);
});

// Warrior
Skill.Register("slash", (...arg) => { 
    return new Slash(...arg); 
});
Skill.Register("shieldattack", (...arg) => {
    return new ShieldAttack(...arg);
});
Skill.Register("doubleattack", (...arg) => {
    return new DouobleAttack(...arg);
});

// Wizard
Skill.Register("firebolt", (...arg) => { 
    return new FireBolt(...arg); 
});
Skill.Register("firecape", (...arg) => { 
    return new FireCape(...arg); 
});
Skill.Register("firerain", (...arg) => { 
    return new FireRain(...arg); 
});

// Archer
Skill.Register("shotarrow", (...arg) => { 
    return new ShotArrow(...arg); 
});
Skill.Register("criticalattack", (...arg) => { 
    return new CriticalAttack(...arg); 
});
Skill.Register("arrowoftracker", (...arg) => { 
    return new ArrowOfTracker(...arg); 
});

// Healer
Skill.Register("wandattack", (...arg) => {
    return new WandAttack(...arg);
});
Skill.Register("antipower", (...arg) => {
    return new AntiPower(...arg);
});
Skill.Register("heal", (...arg) => {
    return new Heal(...arg);
});