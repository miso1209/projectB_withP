import quests from "./quests";
import { EventEmitter } from "events";

export default class Quest extends EventEmitter {
    constructor(questid) {
        super();

        this.questid = questid;
        this.origin = quests[questid];
        this.objectiveEventsList = [];

        // 이벤트가 일어날 시 Quest가 가지고있는 Objective랑 비교하는 것 인데..
        // 그렇다면 Objective에 존재하는 이벤트가 이미 발생하고 -> 껏다 켰을 경우 퀘스트 클리어 처리는 어떻게 하는가?.. 못할 것 같은데?
        // 수정해보자.
        for(let i = 0; i < this.origin.objectives.length; ++i) {
            const objective = this.origin.objectives[i];
            const handler = () => {
                this.emit('checkQuestCondition', objective, objective.conditionScript);
            };

            this.objectiveEventsList.push({
                events: objective.event,
                handler: handler,
            });
        }
    }

    setObjective(objective, conditionResult) {
        for (let key in conditionResult) {
            objective[key] = conditionResult[key];
        }
    }

    load() {
        // Load시 모든 컨디션 한번 체크.
        for(let i = 0; i < this.origin.objectives.length; ++i) {
            const objective = this.origin.objectives[i];
            this.emit('checkQuestCondition', objective, objective.conditionScript);
        }
    }

    foreEachEvent(callback) {
        for(const objectiveEvent of this.objectiveEventsList) {
            for (const eventName of objectiveEvent.events) {
                callback(eventName, objectiveEvent.handler);
            }
        }
    }

    isAllObjectivesCompleted() {
        let completed = true;

        for(let i = 0; i < this.origin.objectives.length; ++i) {
            completed &= this.origin.objectives[i].success;
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

            result.push({
                text: objective.text,
                count: objective.count,
                maxCount: objective.maxCount,
                success: objective.success
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