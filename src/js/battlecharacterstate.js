// 캐릭터 상태 State에 관련된 클래스 작성한다.
export class State {
    constructor() {
        // State 관계도 데이터로 빼고싶다. 우선 Default State만 만들고, 필요한 경우 함수 호출해서 State, Relation을 추가한다.
        this.states = ['idle', 'die', 'action', 'damaged', 'walk', 'groggy'];
        this.stateRelation = {
            idle: {
                idle: false,
                die: true,
                action: true,
                damaged: true,
                walk: true,
                groggy: true
            },
            die: {
                idle: false,
                die: false,
                action: false,
                damaged: false,
                walk: false,
                groggy: false
            },
            action: {
                idle: false,
                die: false,
                action: false,
                damaged: false,
                walk: false,
                groggy: false
            },
            damaged: {
                idle: true,
                die: true,
                action: false,
                damaged: false,
                walk: false,
                groggy: true
            },
            walk: {
                idle: true,
                die: true,
                action: true,
                damaged: true,
                walk: true,
                groggy: true
            },
            groggy: {
                idle: false,
                die: true,
                action: false,
                damaged: true,
                walk: false,
                groggy: false
            },
        }

        this.state = 'idle';
        this.prevState = null;
    }

    // 상태 처리 결과 왜 콜배으로 해야하는가?.. 콜백으로 할 필요가 없다. 기다리는게 아니거든.
    change(state) {
        let success = this.stateRelation[this.state][state];
        [this.prevState, this.state] = success? [this.state, state]: [this.prevState, this.state];
        return success;
    }

    rollback(callback) {
        let success = this.prevState !== null;
        [this.prevState, this.state] = success? [this.state, this.prevState]: [this.prevState, this.state];
        return success;
    }

    // 기본 State를 제외한 특수 State들은 전부 addState로 삽입하여 제작한다.
    add(state, entries, exits) {
        if (this.states.indexOf(state) < 0) {
            this.states.push(state);

            this.states.forEach((basicState) => {
                this.stateRelation[state][basicState] = false;
                this.stateRelation[basicState][state] = false;
            });
        }

        entries.forEach((entry) => {
            this.state[entry][state] = true;
        });

        exits.forEach((exit) => {
            this.state[state][exit] = true;
        });
    }
}