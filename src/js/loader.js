const cache = {};

function memoryMiddleware(resource, next) {
    // if cached, then set data and complete the resource
    if (cache[resource.url]) {
        resource.data = cache[resource.url];
        resource.complete(); // marks resource load complete and stops processing before middlewares
    }
    // if not cached, wait for complete and store it in the cache.
    else {
        resource.onComplete.once(() => {
            cache[resource.url] = resource.data;
        });
    }

    next();
}

export default class Loader {
    constructor() {
        this.loader = new PIXI.loaders.Loader();
        this.loader.pre(memoryMiddleware);
    }
    
    add(name, url) {
        if (this.loader.resources[name]) {
            return;
        }

        if (url) {
            url = require('../' + url);
        } else {
            url = require('../' + name);
        }

        this.loader.add(name, url);
    }

    load(onLoadComplete) {
        this.loader.load((_, resources) => {
            onLoadComplete(resources);
        });
    }

    asyncLoad() {
        return new Promise((resolve, reject) => {
            this.loader.onError.add(() => reject);
            this.loader.load((_, resources) => {
                resolve(resources);
            });
        });
    }
}