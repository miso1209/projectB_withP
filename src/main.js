import App from './js/app';
import Tweens from './lib/tweens';
import Updater from './lib/updater';
import RNG from './lib/rng';

// 유틸리티성 라이브러리의 글로벌 스코프 설정
const global = window || global;
global.Tweens = Tweens;
global.Updater = Updater;
global.RNG = RNG;

// 게임 앱 구동
const app = new App();
app.showIntro();

