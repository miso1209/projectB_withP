/*
    예전에 발생하던 오류(워닝)은 정책이 변경되면서, 사용자 Interaction이 없는 페이지에서 사운드 에셋을 출력할 수 없도록 변경되었다.
    따라서 사용자의 Interaction이 생긴 이후에 오디오를 출력해야 오류가 생기지 않는다.

    자동 재생 정책 변경사항 참조 : https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio
*/
export default class Sound {
    constructor() {
        // Path 설정에 Require 들어가면 오류 생기는데.. webpack 한번 봐야할듯하다..
        // 왜 오류가 발생하는가를 파악해야 할 것.
        this.basePath = 'static/src/assets/sounds/';
    }

    init() {
        this.pixiSound = require("pixi-sound").default;
    }

    setMute(mute) {
        this.pixiSound.muteAll = mute;
    }

    setSpeed(speed) {
        this.pixiSound.speedAll = speed;
    }

    setVolume(volume) {
        this.pixiSound.volumeAll = volume;
    }

    playBGM(fileName) {
        const sound = this.pixiSound.Sound.from(this.basePath + fileName);
        sound.play();
    }

    playSound(fileName) {
        const sound = this.pixiSound.Sound.from(this.basePath + fileName);
        sound.play();
    }
}