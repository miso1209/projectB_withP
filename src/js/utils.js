import { DIRECTIONS } from './define';
import ScriptParser from './scriptparser';

export function loadAniTexture(name, count) {
    const frames = [];  
    for (let i = 0; i < count; i++) {
        frames.push(PIXI.Texture.fromFrame(name + i + '.png'));
    }
    return frames;
}

export function getDirectionName(dir) {
    if (dir === DIRECTIONS.SE) {
        return 'se';
    } else if (dir === DIRECTIONS.NW) {
        return 'nw';
    } else if (dir === DIRECTIONS.NE) {
        return 'ne';
    } else if (dir === DIRECTIONS.SW) {
        return 'sw';
    }
}

export function getDirectionFromName(dir) {
    if (dir === 'se') {
        return DIRECTIONS.SE;
    } else if (dir === 'nw') {
        return DIRECTIONS.NW;
    } else if (dir === 'ne') {
        return DIRECTIONS.NE;
    } else if (dir === 'sw') {
        return DIRECTIONS.SW;
    }
}

export function $sleep(time) {
    return new Promise((resolve) => {
        resolve(time);
    });
}

export function parsingOption(option) {
    if (option === "") return '';
    const data = new ScriptParser(option);
    data.name = data.name.toLowerCase();

    const statMap = {
        strength: '힘',
        stamina: '지구력',
        intellect: '지능',
        agility: '민첩',
        critical: '치명타 확률',
        speed: '속도',
        maxhealth: '체력',
        healthrecovery: '체력 회복',
        recovery: '부활'
    };
    
    let text = statMap[data.name];
    switch(data.name) {
        case 'recovery' : case 'critical' : case 'healthrecovery' :
            let arg = Number(data.args[0]) * 1000;
            if (arg % 10 > 0) {
                text += `(${(arg / 10).toFixed(1)}%)`
            } else {
                text += `(${(arg / 10).toFixed(0)}%)`
            }
            break;
        default:
            text += `(${data.args[0]})`
            break;
    }

    return text;
}

export function ParsingNumber(input) {
    if(input === '') return '';
    const text = input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return text;
}