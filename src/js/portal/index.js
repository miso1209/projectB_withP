// factory 클래스
export default class Portal {
    static factory = {};
    static Register(name, generator_func) {
        Portal.factory[name] = generator_func;
    }

    static New(name, ...args) {
        let func = Portal.factory[name] || Portal.factory["default"];
        return func(...args);
    }
}

import {doorIn, doorOut } from './door';
import Idle from './idle';

Portal.Register("default", (...args) => { return new Idle(...args); });
Portal.Register("doorin", (...args) => { return new doorIn(...args); });
Portal.Register("doorout", (...args) => { return new doorOut(...args); });
