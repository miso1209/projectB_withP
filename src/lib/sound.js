/*
    예전에 발생하던 오류(워닝)은 정책이 변경되면서, 사용자 Interaction이 없는 페이지에서 사운드 에셋을 출력할 수 없도록 변경되었다.
    따라서 사용자의 Interaction이 생긴 이후에 오디오를 출력해야 오류가 생기지 않는다.

    자동 재생 정책 변경사항 참조 : https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio
*/
export default class Sound {
    constructor() {
        this._soundTypesMap = {};
        this.options = {
            masterVolume: 1,
            default: 1
        };
    }

    init() {
        this.pixiSound = require("pixi-sound").default;
    }

    setSpeed(speed) {
        this.pixiSound.speedAll = speed;
    }

    setVolume(type, volume) {
        this.options[type] = volume;
        const fileName = this._soundTypesMap[type];
        const sound = this.pixiSound.find(fileName);

        if (sound) {
            sound.volume = this.options[type];
        }
    }

    setDefaultVolume(volume) {
        this.options['default'] = volume;
    }

    setMasterVolume(volume) {
        this.options.masterVolume = volume;
        this.pixiSound.volumeAll = this.options.masterVolume;
    }

    _addSound(fileName, options) {
        const filePath = require('assets/sounds/' + fileName);

        this.pixiSound.add(fileName, {
            url: filePath,
            preload: true,
            loaded: (err, sound, soundInstance) => {
                this.playSound(fileName, options);
            }
        });
    }

    _removeSound(fileName) {
        this.pixiSound.remove(fileName);
    }

    // 비교하고 다르면 제거하는 함수.
    _compareAndRemoveSound(deleteFileName, compareFileName) {
        if (deleteFileName && deleteFileName !== compareFileName) {
            this._removeSound(deleteFileName);
        }
    }

    playSound(fileName, options) {
        // BGM 같은 것은 중복되어 실행되면 안된다. => 따라서 type을 두고
        // 해당 타입으로 다른 이름의 sound가 들어오면 이전의 sound를 제거한다.
        if (options && options.type) {
            const prevFileName = this._soundTypesMap[options.type];

            this._compareAndRemoveSound(prevFileName, fileName);
            this._soundTypesMap[options.type] = fileName;

            if (this.options[options.type] !== undefined) {
                options = Object.assign(options, { volume: this.options[options.type] });
            } else {
                options = Object.assign(options, { volume: this.options['default'] });
            }
        }

        if (!this.pixiSound.find(fileName)) {
            this._addSound(fileName, options);
        } else if (!this.pixiSound.find(fileName).isPlaying) {
            this.pixiSound.play(fileName, options);
        } else if (options && options.singleInstance) {
            this.pixiSound.play(fileName, options);
        }
    }
}