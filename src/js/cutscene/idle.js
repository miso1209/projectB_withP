import EventEmitter from 'events';

export default class idle extends EventEmitter {
    play() {
        // 다음프레임에 바로 종료한다
        requestAnimationFrame(() => {
            this.emit('complete');
        });
    }
}