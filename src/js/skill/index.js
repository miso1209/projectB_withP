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

export default class Skill {
    static factory = {};
    static Register(name, generator_func) {
        Skill.factory[name] = generator_func;
    }

    static New(name, ...args) {
        const func = Skill.factory[name];
        return func(...args);
    }
}

// Hector
Skill.Register("crouch", () => {
    return new Crouch();
});
Skill.Register("runaway", () => {
    return new Runaway();
});

// Warrior
Skill.Register("slash", () => { 
    return new Slash(); 
});
Skill.Register("shieldAttack", () => {
    return new ShieldAttack();
});
Skill.Register("doubleAttack", () => {
    return new DouobleAttack();
});

// Wizzard
Skill.Register("fireBolt", () => { 
    return new FireBolt(); 
});
Skill.Register("fireRain", () => { 
    return new FireRain(); 
});

// Archer
Skill.Register("shotArrow", () => { 
    return new ShotArrow(); 
});
Skill.Register("arrowOfTracker", () => { 
    return new ArrowOfTracker(); 
});

// Healer
Skill.Register("wandAttack", () => {
    return new WandAttack();
});
Skill.Register("heal", () => {
    return new Heal();
});