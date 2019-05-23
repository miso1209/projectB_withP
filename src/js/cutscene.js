import cutscenes from './cutscenes';

export default class Cutscene {

    static fromJSON(script) {
        const inst = new Cutscene();
        inst.script = script;
        inst.endIndex = script.length;
        inst .currentIndex = 0;
        return inst;
    }

    static fromData(id) {
        const inst = new Cutscene();
        const script = cutscenes[id];
        inst.script = script;
        inst.endIndex = script.length;
        inst .currentIndex = 0;
        return inst;
    }

    next() {
        if (this.currentIndex < this.endIndex) {
            const result = this.script[this.currentIndex]
            ++this.currentIndex;
            return result;
        } else {
            return null;
        }
    }
}