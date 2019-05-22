export default class QuestTable {
    init(data) {
        this.data = {};
        for (const q of data) {
            this.data[q.id] = q;
        }
    }

    getData(itemId) {
        return this.data[itemId];
    }

}