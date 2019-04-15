export default class ResourceManager {
    constructor() {
        this.cache = {};
        this.loader = this.getNewLoader();
    }

    getNewLoader() {
        const loader = new PIXI.loaders.Loader();
        loader.pre(this.memoryMiddleware.bind(this));
        return loader;
    }

    memoryMiddleware(resource, next) {
        // if cached, then set data and complete the resource
        if (this.cache[resource.url]) {
            resource.data = this.cache[resource.url];
            resource.complete(); // marks resource load complete and stops processing before middlewares
        }
        // if not cached, wait for complete and store it in the cache.
        else {
            resource.onComplete.once(() => {
                this.cache[resource.url] = resource.data;
            });
        }

        next();
    }

    add(name, url) {
        if (url) {
            this.loader.add(name, require('../' + url));
        } else {
            this.loader.add(require('../' + name));
        }
    }

    load(onLoadComplete) {
        const loader = this.loader;
        this.loader = this.getNewLoader();

        loader.load((_, resources) => {
            onLoadComplete(resources);
        });
    }
}