// import { DIRECTIONS } from "./define";

// 무비클립 관리 클래스
export class Movies {
    constructor() {
        this.movies = [];
    }

    push(movieClip) {
        this.movies.push(movieClip);
    }

    hasMovie() {
        return this.movies.length > 0;
    }

    update() {
        let len = this.movies.length;
        for (let i = 0; i < len; i++) {
            const movie = this.movies[i];
            movie.update();
            if (!movie._playing) {
                this.movies.splice(i, 1);
                i--; len--;
            }
        }
    }
}

// 배틀에 사용될 큐
export class Queue {
    constructor() {
        this.items = [];
    }

    peak() {
        return this.items[0];
    }

    hasItem() {
        return this.items.length > 0;
    }

    enqueue(item) {
        this.items.push(item);
    }

    dequeue() {
        let result = this.items.shift();
        return result;
    }

    getLength() {
        return this.items.length;
    }

    insert(item, index) {
        if (index < this.getLength()) {
            this.items.splice(index, 0, item);
        } else {
            this.enqueue(item);
        }
    }

    delete(item) {
        let index = this.items.indexOf(item);

        if (index >= 0) {
            this.items.splice(index, 1);
        }
    }
}

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