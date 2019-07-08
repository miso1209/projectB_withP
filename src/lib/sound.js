/*
    예전에 발생하던 오류(워닝)은 정책이 변경되면서, 사용자 Interaction이 없는 페이지에서 사운드 에셋을 출력할 수 없도록 변경되었다.
    따라서 사용자의 Interaction이 생긴 이후에 오디오를 출력해야 오류가 생기지 않는다.

    자동 재생 정책 변경사항 참조 : https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio
*/
export default class Sound {
    constructor() {
        this.BGM = null;
    }

    init() {
        this.pixiSound = require("pixi-sound").default;
    }

    setSpeed(speed) {
        this.pixiSound.speedAll = speed;
    }

    setVolume(volume) {
        this.pixiSound.volumeAll = volume;
    }

    _addSound(fileName) {
        const filePath = require('assets/sounds/' + fileName);
        this.pixiSound.add(fileName, this.pixiSound.Sound.from(filePath));
    }

    _removeSound(fileName) {
        this.pixiSound.remove(fileName);
    }

    playSound(fileName, options) {
        // 사운드 등록이 안되어 있다면 등록.
        if (!this.pixiSound.find(fileName)) {
            this._addSound(fileName);
        }

        // 재생한다.
        this.pixiSound.play(fileName, options);
    }

    playBGM(fileName, options) {
        // 같은 BGM을 틀려는 경우만 아니라면, 이전의 BGM은 제거한다.
        if (this.pixiSound.find(this.BGM) && this.BGM !== fileName) {
            this._removeSound(this.BGM)
        }
        
        this.playSound(fileName, options);
        this.BGM = fileName;
    }
}