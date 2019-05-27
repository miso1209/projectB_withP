import { DIRECTIONS } from './define';

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