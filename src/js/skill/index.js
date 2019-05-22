import Slash from './slash';
import FireBolt from './firebolt';
import ShotArrow from './shotarrow';
import ShieldAttack from './shieldattack';
import DouobleAttack from './doubleattack';
import WandAttack from './wandattack';
import Crouch from './crouch';

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

// Archer
Skill.Register("shotArrow", () => { 
    return new ShotArrow(); 
});

// Healer
Skill.Register("wandAttack", () => {
    return new WandAttack();
});