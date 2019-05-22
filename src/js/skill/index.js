import Melee from './melee';

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

Skill.Register("melee", () => { 
    return new Melee(); 
});

