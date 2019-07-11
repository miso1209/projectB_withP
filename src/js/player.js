import Inventory from './inventory';
import Party from './party';
import Character from './character';
import Quest from './quest';
import Quests from './quests';

// 플레이어랑 필드캐릭터랑 나중에 분리해야 한다 
// 왜냐하면  필드캐릭터는 계속 변경이 될수 있는데, 플레이어는 안바뀌니까 ...

export default class Player {
    constructor() {
        // 보유하고 있는 아이템 목록
        this.inventory = new Inventory();
        // 자신이 가지고 있는 캐릭터 목록
        this.characters = {};
        // 파티 클래스를 만들어서 처리를 한다
        this.party = new Party();         
        
        this.quests = {};
        this.completedQuests = {};

        // 대표 캐릭터 자신이 가지고 있는 캐릭터 중에 하나를 골라서 필드 캐리터로 사용한다
        this.controlCharacter = null;
        
        // 태그정보
        this.tags = [];
    }

    // 임시 설정.
    addCharacter(id) {
        this.characters[id] = new Character(id);
    }

    getAllQuests() {
        return this.getAcceptableQuests().concat(this.getAcceptedQuests());
    }

    getAcceptableQuests() {
        const acceptableQuests = [];

        for (let ID in Quests) {
            const newQuest = new Quest(ID);
            newQuest.load();
            let success = !Quests[ID].isStoryQuest;

            // 이미 Accept한 Quest제거.
            for (let acceptedID in this.quests) {
                success &= (acceptedID !== ID);
            }

            // 이미 완료한 퀘스트는 Iterable, Time 체크해서 success판정.
            for (let completedID in this.completedQuests) {
                const quest = this.completedQuests[completedID];
                const endDate = quest.data.clearDate;

                if (completedID === ID && Quests[ID].isIterable) {
                    const diff = (new Date() - new Date(endDate)) / 1000;
                    success &= diff > Quests[ID].secForNextIterable;
                } else if(completedID === ID) {
                    success &= false;
                }
            }

            if (success) {
                acceptableQuests.push({
                    id: ID,
                    title: newQuest.title,
                    type: 'Acceptable',
                    description: newQuest.description,
                    objectives: newQuest.objectives,
                    rewards: newQuest.rewards,
                    success: newQuest.isAllObjectivesCompleted()
                });
            }
        }

        return acceptableQuests;
    }

    getAcceptedQuests() {
        const accpetedQuests = [];
        
        for (let ID in this.quests) {
            const quest = this.quests[ID];
            accpetedQuests.push({
                id: ID,
                title: quest.title,
                type: 'Accepted',
                description: quest.description,
                objectives: quest.objectives,
                rewards: quest.rewards,
                success: quest.isAllObjectivesCompleted()
            });
        }

        return accpetedQuests;
    }

    isCompletedQuest(id) {
        return this.completedQuests[id];
    }

    addTag(tag) {
        if (this.tags.indexOf(tag) < 0) {
            this.tags.push(tag);
        }
    }

    setControlCharacter(id) {
        this.controlCharacter = id;
    }

    hasQuest(questId) {
        return this.quests[questId] !== undefined;
    }

    hasTag(tag) {
        return this.tags.indexOf(tag) >= 0;
    }
}