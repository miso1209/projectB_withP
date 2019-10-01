import quests from "./quests";
import Items from "./items";
import { EventEmitter } from "events";
import ScriptParser from "./scriptparser";
import {ConvertRankToItemIdBase} from './utils';

export default class Quest extends EventEmitter {
    constructor(questid) {
        super();

        this.questid = questid;
        this.origin = Object.assign({}, quests[questid]);
        this.copy = this.origin.objectives.map((objective) => { return Object.assign({}, objective)});
        this.objectiveEventsList = [];
        this.data = {};
        this.isInitData = {};

        // 이벤트가 일어날 시 Quest가 가지고있는 Objective랑 비교하는 것 인데..
        // 그렇다면 Objective에 존재하는 이벤트가 이미 발생하고 -> 껏다 켰을 경우 퀘스트 클리어 처리는 어떻게 하는가?.. 못할 것 같은데?
        // 수정해보자.
        for(let i = 0; i < this.copy.length; ++i) {
            const objective = this.copy[i];
            const handler = (param) => {
                this.emit('checkQuestCondition', objective, objective.conditionScript, true, param);
            };

            this.objectiveEventsList.push({
                events: objective.event,
                handler: handler,
            });
        }
    }

    get isStoryQuest() {
        return this.origin.isStoryQuest;
    }
    
    get isIterable() {
        return this.origin.isIterable;
    }

    get isSuccess() {
        return this.data.isSuccess;
    }

    set isSuccess(bool) {
        this.data.isSuccess = bool;
    }

    setObjective(objective, conditionResult) {
        let isChanged = false;
        for (let key in conditionResult) {
            isChanged |= objective[key] !== conditionResult[key];
            objective[key] = conditionResult[key];
        }
        
        return isChanged;
    }

    load() {
        // Load시 모든 컨디션 한번 체크.
        for(let i = 0; i < this.copy.length; ++i) {
            const objective = this.copy[i];
            this.emit('checkQuestCondition', objective, objective.conditionScript, false);
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

        for(let i = 0; i < this.copy.length; ++i) {
            completed &= this.copy[i].success;
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

    get success() {
        return this.isAllObjectivesCompleted();
    }

    get objectives() {
        const result = [];
        for(let i = 0; i < this.copy.length; ++i) {
            const objective = this.copy[i];

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
            const parser = new ScriptParser(reward.script);
            let item = null;
            let count = 0;

            if(parser.name === "addItem") {
                let itemId = parser.args[0];
                if (/^\D/.test(itemId)) {
                    const stringItemId = String(itemId);
                    const rank = stringItemId.substring(0, 1);
                    itemId = Number(stringItemId.substring(1)) + ConvertRankToItemIdBase(rank);
                }
                count = parser.args[1];
                item = Object.assign({}, Items[itemId]);
            }

            result.push({
                text: reward.text,
                script: reward.script,
                itemData : {
                    item: item,
                    count: count
                }
            });
        }

        return result;
    }
}