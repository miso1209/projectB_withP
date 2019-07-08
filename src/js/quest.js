import quests from "./quests";

export default class Quest {
    constructor(questid) {
        this.questid = questid;
        this.origin = quests[questid];
        this.data = {};
        this.events = [];

        // 이벤트가 일어날 시 Quest가 가지고있는 Objective랑 비교하는 것 인데..
        // 그렇다면 Objective에 존재하는 이벤트가 이미 발생하고 -> 껏다 켰을 경우 퀘스트 클리어 처리는 어떻게 하는가?.. 못할 것 같은데?
        // 수정해보자.
        for(let i = 0; i < this.origin.objectives.length; ++i) {
            const objective = this.origin.objectives[i];
            const handler = (...args) => {
                console.log(args);
                // 인자가 일치하면 카운트를 올린다
                const srcArgs = objective.args || [];
                let success = true;
                for(let k = 0; k < srcArgs.length; ++k) {
                    success &= (srcArgs[k] === args[k]);
                }

                // 미션이 성공하면 데이터를 업데이트하고 저장을 하자
                if (success) {
                    this.data[i] = (this.data[i] || 0) + 1;
                }
            };
            this.events.push({
                event: objective.event,
                handler: handler,
            });
        }
    }

    refresh(data) {
        this.data = data;
    }

    foreEachEvent(callback) {
        for(const event of this.events) {
            callback(event.event, event.handler);
        }
    }

    isAllObjectivesCompleted() {
        let completed = true;
        for(let i = 0; i < this.origin.objectives.length; ++i) {
            const objective = this.origin.objectives[i];
            const count = this.data[i] || 0;
            const maxcount = objective.count || 1;

            completed &= (maxcount <= count);
        }
        return completed;
    }

    get title() {
        return this.origin.title;
    }

    get description() {
        return this.origin.description;
    }

    get questId() {
        return this.origin.id;
    }

    get objectives() {
        const result = [];
        for(let i = 0; i < this.origin.objectives.length; ++i) {
            const objective = this.origin.objectives[i];
            const count = this.data[i] || 0;
            // 횟수가 없는 것은  1회성 이벤트인것으로 인식한다
            const maxcount = objective.count || 1;

            result.push({
                text: objective.text,
                count: Math.min(count, maxcount), 
                maxcount: maxcount,
            });
        }
        return result;
    }

    get rewards() {
        const result = [];
        for(const reward of this.origin.rewards) {
            result.push({
                text: reward.text,
                script: reward.script
            });
        }
        return result;
    }
}