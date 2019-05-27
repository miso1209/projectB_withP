import EventEmitter from 'events';
import { $sleep } from '../utils';

export default class idle {
    async $play() {
        await $sleep(1);
    }
}