import App from './js/app';
import Tweens from './lib/tweens';
import Updater from './lib/updater';
import RNG from './lib/rng';
import Sound from './lib/sound';

// 유틸리티성 라이브러리의 글로벌 스코프 설정
const global = window || global;
global.Tweens = Tweens;
global.Updater = Updater;
global.RNG = RNG;
global.Sound = new Sound();

/*
    예전에 발생하던 오류(워닝)은 정책이 변경되면서, 사용자 Interaction이 없는 페이지에서 사운드 에셋을 출력할 수 없도록 변경되었다.
    따라서 사용자의 Interaction이 생긴 이후에 오디오를 출력해야 오류가 생기지 않는다.

    자동 재생 정책 변경사항 참조 : https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio
*/

// 사용자 Click Interaction 발생 시, init한다.
const soundInit = (e) => {
    global.Sound.init();
    global.removeEventListener('click', soundInit);
};

global.addEventListener('click', soundInit);

// 게임 앱 구동
const app = new App();
app.showIntro();

