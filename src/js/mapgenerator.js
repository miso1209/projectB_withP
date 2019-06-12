import Stage  from "./stage";
import path from 'path';

const MAP_DATA = {
    EMPTY: '   ',
    ROOM: ' ▨ ',
    PASSAGE: ' # ',
    BOSS: ' B ',
    PORTAL: ' P ',
    HALL: ' H '
};

// Seed값을 가지고 랜덤생성 하던가, 데이터를 가지고 있어야 할 것 같다. 인스턴스로 다 들고있으니 너무 무식하고, 메모리 낭비가 심할 것.
export default class MapGenerator {
    constructor() {
    }

    async createMap(roomCount) {
        const width = 200;
        const height = 200;
        const map = [];

        for (let y = 0; y < height; y++) {
            map.push([]);
            for (let x = 0; x < width; x++) {
                map[y].push(MAP_DATA.EMPTY);
            }
        }

        const startPosition = {
            x: Math.round(Math.random() * (width - 1)),
            y: Math.round(Math.random() * (height - 1))
        };
        map[startPosition.y][startPosition.x] = MAP_DATA.HALL;

        const rooms = [startPosition];

        while(rooms.length < roomCount) {
            const emptyPassages = this.getEmptyPassages(map,rooms);
            const nextPassge = emptyPassages[Math.round(Math.random() * (emptyPassages.length - 1))];

            map[nextPassge.y][nextPassge.x] = MAP_DATA.PASSAGE;
            
            switch(nextPassge.dir) {
                case 'left' :
                    if (map[nextPassge.y][nextPassge.x - 1] === MAP_DATA.EMPTY) {
                        rooms.push({
                            x: nextPassge.x - 1,
                            y: nextPassge.y
                        });
                    }
                    map[nextPassge.y][nextPassge.x - 1] = MAP_DATA.ROOM;
                break;

                case 'right' :
                    if (map[nextPassge.y][nextPassge.x + 1] === MAP_DATA.EMPTY) {
                        rooms.push({
                            x: nextPassge.x + 1,
                            y: nextPassge.y
                        });
                    }
                    map[nextPassge.y][nextPassge.x + 1] = MAP_DATA.ROOM;
                break;

                case 'up' :
                    if (map[nextPassge.y - 1][nextPassge.x] === MAP_DATA.EMPTY) {
                        rooms.push({
                            x: nextPassge.x,
                            y: nextPassge.y - 1
                        });
                    }
                    map[nextPassge.y - 1][nextPassge.x] = MAP_DATA.ROOM;
                break;

                case 'down' :
                    if (map[nextPassge.y + 1][nextPassge.x] === MAP_DATA.EMPTY) {
                        rooms.push({
                            x: nextPassge.x,
                            y: nextPassge.y + 1
                        });
                    }
                    map[nextPassge.y + 1][nextPassge.x] = MAP_DATA.ROOM;
                break;
            }
        }

        // 보스방 붙인다.
        const leafRooms = this.getLeafRooms(map,rooms);
        if (leafRooms.length > 0) {
            const bossRoom = leafRooms[Math.round(Math.random()*(leafRooms.length-1))];
            map[bossRoom.y][bossRoom.x] = MAP_DATA.BOSS;
        }

        // 포탈 붙인다.
        const defaultRooms = this.getDefaultRooms(map);
        const portal = defaultRooms[Math.round(Math.random()*(defaultRooms.length-1))];
        map[portal.y][portal.x] = MAP_DATA.PORTAL;

        // 축소작업
        this.smallizeMap(map);

        for (let y = 0; y < map.length; y++) {
            console.log(map[y].toString().replace(/,/g,''));
        }

        this.map = map;
        this.realMap = await this.loadMap();
        this.setPortal();

        return map;
    }

    getHall() {
        return this.hall;
    }
    
    setPortal() {
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x] !== MAP_DATA.EMPTY && this.realMap[y][x]) {
                    this.realMap[y][x].setStagePortal(this.getNeighborStage(x, y, this.realMap[y][x].neighbor));
                }
            }
        }
    }

    getNeighborStage(x, y, neighbor) {
        const result = {};
        
        if (neighbor.up) {
            result.up = this.realMap[y-1][x];
        }
        if (neighbor.left) {
            result.left = this.realMap[y][x-1];
        }
        if (neighbor.right) {
            result.right = this.realMap[y][x+1];
        }
        if (neighbor.down) {
            result.down = this.realMap[y+1][x];
        }

        return result;
    }

    async loadMap() {
        const room = 'castle_room';
        const UDPassage = 'castle_path_nesw';
        const LRPassage = 'castle_path_nwse';
        const realMap = [].concat(this.map);

        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                // 여기 스테이지 뚫어줄 때, Path 어디서 어디인지 생성 해야한다.
                const neighbor = this.getNeighbor(x,y);
                if (this.map[y][x] === MAP_DATA.BOSS) {
                    const stageName = path.basename(`assets/mapdata/${room}.json`, ".json");
                    const stage = new Stage(neighbor);
                    await stage.$load(stageName);
    
                    realMap[y][x] = stage;
                } else  if (this.map[y][x] === MAP_DATA.PORTAL) {
                    const stageName = path.basename(`assets/mapdata/${room}.json`, ".json");
                    const stage = new Stage(neighbor);
                    await stage.$load(stageName);
    
                    realMap[y][x] = stage;
                } else if (this.map[y][x] === MAP_DATA.HALL) {
                    const stageName = path.basename(`assets/mapdata/${room}.json`, ".json");
                    const stage = new Stage(neighbor);
                    await stage.$load(stageName);
    
                    realMap[y][x] = stage;
                    this.hall = stage;
                } else if (this.map[y][x] === MAP_DATA.ROOM) {
                    const stageName = path.basename(`assets/mapdata/${room}.json`, ".json");
                    const stage = new Stage(neighbor);
                    await stage.$load(stageName);
    
                    realMap[y][x] = stage;
                } else if (this.map[y][x] === MAP_DATA.PASSAGE && ((this.map[y-1] && this.map[y-1][x] !== MAP_DATA.EMPTY && this.map[y-1][x] !== MAP_DATA.PASSAGE) || (this.map[y+1] && this.map[y+1][x] !== MAP_DATA.EMPTY && this.map[y+1][x] !== MAP_DATA.PASSAGE))) {
                    // 위아래 통로.
                    const stageName = path.basename(`assets/mapdata/${UDPassage}.json`, ".json");
                    const stage = new Stage(neighbor);
                    await stage.$load(stageName);
    
                    realMap[y][x] = stage;
                } else if (this.map[y][x] === MAP_DATA.PASSAGE) {
                    // 좌우 통로
                    const stageName = path.basename(`assets/mapdata/${LRPassage}.json`, ".json");
                    const stage = new Stage(neighbor);
                    await stage.$load(stageName);
    
                    realMap[y][x] = stage;
                }
            }
        }

        return realMap;
    }

    getNeighbor(x,y) {
        const result = {};

        if (this.map[y][x-1] !== undefined && this.map[y][x-1] !== MAP_DATA.EMPTY) {
            result.left = true;
        }

        if (this.map[y][x+1] !== undefined && this.map[y][x+1] !== MAP_DATA.EMPTY) {
            result.right = true;
        }

        if (this.map[y-1] !== undefined && this.map[y-1][x] !== MAP_DATA.EMPTY) {
            result.up = true;
        }

        if (this.map[y+1] !== undefined && this.map[y+1][x] !== MAP_DATA.EMPTY) {
            result.down = true;
        }

        return result;
    }

    smallizeMap(map) {
        for (let y = map.length - 1; y >= 0; y--) {
            let count = 0;
            for (let x = 0; x < map[y].length;x++) {
                if (map[y][x] !== MAP_DATA.EMPTY) {
                    count++;
                }
            }

            if (count === 0) {
                map.splice(y, 1);
            }
        }

        for (let x = map[0].length - 1; x >= 0 ; x--) {
            let count = 0;
            for (let y = 0; y < map.length; y++) {
                if (map[y][x] !== MAP_DATA.EMPTY) {
                    count++;
                }
            }

            if (count === 0) {
                for (let y = 0; y < map.length; y++) {
                    map[y].splice(x, 1);
                }
            }
        }
    }

    getDefaultRooms(map) {
        const resultRooms = [];

        for (let y = map.length - 1; y >= 0; y--) {
            for (let x = 0; x < map[y].length;x++) {
                if (map[y][x] === MAP_DATA.ROOM) {
                    resultRooms.push({
                        x: x,
                        y: y
                    });
                }
            }
        }

        return resultRooms;
    }

    getLeafRooms(map, rooms) {
        const resultRooms = [];

        rooms.forEach((room) => {
            let count = 0;

            if (map[room.y][room.x] === MAP_DATA.HALL) {
                count = 2;
            }
            if (map[room.y][room.x - 1] !== undefined && map[room.y][room.x - 1] === MAP_DATA.PASSAGE) {
                count++;
            }
            if (map[room.y][room.x + 1] !== undefined && map[room.y][room.x + 1] === MAP_DATA.PASSAGE) {
                count++;
            }
            if (map[room.y - 1] !== undefined && map[room.y - 1][room.x] === MAP_DATA.PASSAGE) {
                count++;
            }
            if (map[room.y + 1] !== undefined && map[room.y + 1][room.x] === MAP_DATA.PASSAGE) {
                count++;
            }

            if (count === 1) {
                resultRooms.push(room);
            }
        });

        return resultRooms;
    }

    getEmptyPassages(map, rooms) {
        const emptyPassages = [];

        rooms.forEach((room) => {
            if (map[room.y][room.x - 1] !== undefined && map[room.y][room.x - 1] === MAP_DATA.EMPTY && map[room.y][room.x - 2] !== undefined && map[room.y][room.x - 2] !== MAP_DATA.HALL) {
                emptyPassages.push({
                    dir: 'left',
                    x: room.x - 1,
                    y: room.y
                });
            }
            if (map[room.y][room.x + 1] !== undefined && map[room.y][room.x + 1] === MAP_DATA.EMPTY && map[room.y][room.x + 2] !== undefined && map[room.y][room.x + 2] !== MAP_DATA.HALL) {
                emptyPassages.push({
                    dir: 'right',
                    x: room.x + 1,
                    y: room.y
                });
            }
            if (map[room.y - 1] !== undefined && map[room.y - 1][room.x] === MAP_DATA.EMPTY && map[room.y - 2] !== undefined && map[room.y - 2][room.x] !== MAP_DATA.HALL) {
                emptyPassages.push({
                    dir: 'up',
                    x: room.x,
                    y: room.y - 1
                });
            }
            if (map[room.y + 1] !== undefined && map[room.y + 1][room.x] === MAP_DATA.EMPTY && map[room.y + 2] !== undefined && map[room.y + 2][room.x] !== MAP_DATA.HALL) {
                emptyPassages.push({
                    dir: 'down',
                    x: room.x,
                    y: room.y + 1
                });
            }
        });

        return emptyPassages;
    }
}