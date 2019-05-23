export default class ScriptParser {
    constructor(script) {
        // 옵션을 함수와 인자로 분리한다
        const re = /(\w+)\s*\((.*)\)\s*/g;
        const array = re.exec(script);
        
        this.name = array[1];
        this.args = array[2].split(/\s*\,\s*/);
    }
}