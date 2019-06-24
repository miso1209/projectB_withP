import Stage  from "./stage";
import path from 'path';

const MAP_DATA = {
    EMPTY: '   ',
    ROOM: ' ▨ ',
    PASSAGE: ' # ',
    BOSS: ' B ',
    PORTAL: ' P ',
    HALL: ' H ',
    INPUT: ' ● ',
    OUTPUT: ' ◎ ',
    STAIR: ' N ',
};

// Seed값을 가지고 랜덤생성 하던가, 데이터를 가지고 있어야 할 것 같다. 인스턴스로 다 들고있으니 너무 무식하고, 메모리 낭비가 심할 것.
export default class MapGenerator {
    constructor() {
    }

    // Input 방향을 입력받는다.
    async createMap(input) {
        // 한 층의 룸의 갯수는 기본적으로 6개이고 5개 층마다 1개씩 늘어난다.
        // 6 + Math.floor(this.currentFloor / 5)
        const roomCount = 3;
        const bossFloor = (this.currentFloor % 5 === 0)?true : false;
        let width = 500;
        let height = 500;
        const map = [];

        for (let y = 0; y < height; y++) {
            map.push([]);
            for (let x = 0; x < width; x++) {
                map[y].push(MAP_DATA.EMPTY);
            }
        }

        const startPosition = {
            x: Math.floor(width / 2),
            y: Math.floor(height / 2)
        };
        map[startPosition.y][startPosition.x] = MAP_DATA.HALL;

        if(input === 'left') {
            // hall 의 right가 비어있어야 함.
            map[startPosition.y][startPosition.x + 1] = MAP_DATA.INPUT;
        } else if(input === 'up') {
            // hall 의 down이 비어있어야 함.
            map[startPosition.y + 1][startPosition.x] = MAP_DATA.INPUT;
        }

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

        if (bossFloor) {
            // Stair Flow
            const bossRoomPos = this.getBossRoomPos(map, rooms);
            map[bossRoomPos.y - 1][bossRoomPos.x] = MAP_DATA.PASSAGE;
            map[bossRoomPos.y - 2][bossRoomPos.x] = MAP_DATA.BOSS;
            map[bossRoomPos.y - 3][bossRoomPos.x] = MAP_DATA.OUTPUT;
        } else {
            // Stair Flow
            const stairRoomPos = this.getStairRoomPos(map, rooms);
            map[stairRoomPos.y][stairRoomPos.x] = MAP_DATA.STAIR;
            const outputPos = {
                x: null,
                y: null
            };
            
            if (map[stairRoomPos.y][stairRoomPos.x-1] === MAP_DATA.EMPTY) {
                outputPos.x = stairRoomPos.x - 1;
                outputPos.y = stairRoomPos.y;
            }
            if (map[stairRoomPos.y-1][stairRoomPos.x] === MAP_DATA.EMPTY && (outputPos.x === null || Math.random() < 0.5)) {
                outputPos.x = stairRoomPos.x;
                outputPos.y = stairRoomPos.y - 1;
            }
            map[outputPos.y][outputPos.x] = MAP_DATA.OUTPUT;
        }

        // 포탈 붙인다.
        const defaultRooms = this.getDefaultRooms(map);
        const portal = defaultRooms[Math.round(Math.random()*(defaultRooms.length-1))];
        map[portal.y][portal.x] = MAP_DATA.PORTAL;

        // 축소작업
        this.smallizeMap(map);
        
        for(let y=0;y<map.length;y++) {
            console.log(map[y].toString().replace(/,/g,''));
        }

        this.map = map;
        this.realMap = await this.loadMap();
        this.setPortal();

        return this.realMap;
    }

    getHall() {
        return this.hall;
    }

    setFloor(currentFloor) {
        // 층 정보를 담는다.
        this.currentFloor = currentFloor;
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
        const middleBoss = 'castle_boss-middle';
        const stair = 'castle_room_stair';
        const portal = 'castle_portal';
        const hall = 'castle_hall';
        const UDPassage = 'castle_path_nesw';
        const LRPassage = 'castle_path_nwse';
        let realMap = [];

        for (let y=0; y<this.map.length;y++) {
            realMap.push([].concat(this.map[y]));
        }

        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                // 여기 스테이지 뚫어줄 때, Path 어디서 어디인지 생성 해야한다.
                const roomLength = 1;
                const roomNumber = Math.round(Math.random() * roomLength);
                const room = 'castle_room' + roomNumber;
                const neighbor = this.getNeighbor(x,y);
                if (this.map[y][x] === MAP_DATA.BOSS) {
                    const stageName = path.basename(`assets/mapdata/${middleBoss}.json`, ".json");
                    const stage = new Stage(neighbor);
                    await stage.$load(stageName);
                    stage.addMonster({x:45, y:70});
    
                    realMap[y][x] = stage;
                } else  if (this.map[y][x] === MAP_DATA.STAIR) {
                    const stageName = path.basename(`assets/mapdata/${stair}.json`, ".json");
                    const stage = new Stage(neighbor);
                    await stage.$load(stageName);
                    stage.randomPropGenerate();
    
                    realMap[y][x] = stage;
                } else  if (this.map[y][x] === MAP_DATA.PORTAL) {
                    const stageName = path.basename(`assets/mapdata/${portal}.json`, ".json");
                    const stage = new Stage(neighbor);
                    await stage.$load(stageName);
                    stage.randomPropGenerate();
    
                    realMap[y][x] = stage;
                } else if (this.map[y][x] === MAP_DATA.HALL) {
                    const stageName = path.basename(`assets/mapdata/${hall}.json`, ".json");
                    const stage = new Stage(neighbor);
                    await stage.$load(stageName);
                    stage.randomPropGenerate();
    
                    realMap[y][x] = stage;
                    this.hall = stage;
                } else if (this.map[y][x] === MAP_DATA.ROOM) {
                    const stageName = path.basename(`assets/mapdata/${room}.json`, ".json");
                    const stage = new Stage(neighbor);
                    await stage.$load(stageName);
                    stage.randomPropGenerate();
                    stage.addMonster();
                    // stage.addMonster();
    
                    realMap[y][x] = stage;
                } else if (this.map[y][x] === MAP_DATA.PASSAGE && ((this.map[y-1] && this.map[y-1][x] !== MAP_DATA.EMPTY && this.map[y-1][x] !== MAP_DATA.PASSAGE) || (this.map[y+1] && this.map[y+1][x] !== MAP_DATA.EMPTY && this.map[y+1][x] !== MAP_DATA.PASSAGE))) {
                    // 위아래 통로.
                    const stageName = path.basename(`assets/mapdata/${UDPassage}.json`, ".json");
                    const stage = new Stage(neighbor);
                    await stage.$load(stageName);
                    stage.randomPropGenerate();
    
                    realMap[y][x] = stage;
                } else if (this.map[y][x] === MAP_DATA.PASSAGE) {
                    // 좌우 통로
                    const stageName = path.basename(`assets/mapdata/${LRPassage}.json`, ".json");
                    const stage = new Stage(neighbor);
                    await stage.$load(stageName);
                    stage.randomPropGenerate();
    
                    realMap[y][x] = stage;
                } else if (this.map[y][x] === MAP_DATA.INPUT || this.map[y][x] === MAP_DATA.OUTPUT) {
                    realMap[y][x] = null;
                }
            }
        }

        return realMap;
    }

    getNeighbor(x,y) {
        const result = {
            input: '',
            output: '',
        };

        if (this.map[y][x-1] !== undefined && this.map[y][x-1] !== MAP_DATA.EMPTY && this.map[y][x-1] !== MAP_DATA.INPUT && this.map[y][x-1] !== MAP_DATA.OUTPUT) {
            result.left = true;
        } else if (this.map[y][x] === MAP_DATA.HALL && this.map[y][x-1] !== undefined && this.map[y][x-1] == MAP_DATA.INPUT) {
            result.input = 'left';
        } else if (this.map[y][x] === MAP_DATA.STAIR && this.map[y][x-1] !== undefined && this.map[y][x-1] == MAP_DATA.OUTPUT) {
            result.output = 'left';
        } else if (this.map[y][x] === MAP_DATA.BOSS && this.map[y][x-1] !== undefined && this.map[y][x-1] == MAP_DATA.OUTPUT) {
            result.output = 'left';
        }

        if (this.map[y][x+1] !== undefined && this.map[y][x+1] !== MAP_DATA.EMPTY && this.map[y][x+1] !== MAP_DATA.INPUT && this.map[y][x+1] !== MAP_DATA.OUTPUT) {
            result.right = true;
        } else if (this.map[y][x] === MAP_DATA.HALL && this.map[y][x+1] !== undefined && this.map[y][x+1] == MAP_DATA.INPUT) {
            result.input = 'right';
        } else if (this.map[y][x] === MAP_DATA.STAIR && this.map[y][x+1] !== undefined && this.map[y][x+1] == MAP_DATA.OUTPUT) {
            result.output = 'right';
        } else if (this.map[y][x] === MAP_DATA.BOSS && this.map[y][x+1] !== undefined && this.map[y][x+1] == MAP_DATA.OUTPUT) {
            result.output = 'right';
        }

        if (this.map[y-1] !== undefined && this.map[y-1][x] !== MAP_DATA.EMPTY && this.map[y-1][x] !== MAP_DATA.INPUT && this.map[y-1][x] !== MAP_DATA.OUTPUT) {
            result.up = true;
        } else if (this.map[y][x] === MAP_DATA.HALL && this.map[y-1] !== undefined && this.map[y-1][x] == MAP_DATA.INPUT) {
            result.input = 'up';
        } else if (this.map[y][x] === MAP_DATA.STAIR && this.map[y-1] !== undefined && this.map[y-1][x] == MAP_DATA.OUTPUT) {
            result.output = 'up';
        } else if (this.map[y][x] === MAP_DATA.BOSS && this.map[y-1] !== undefined && this.map[y-1][x] == MAP_DATA.OUTPUT) {
            result.output = 'up';
        }

        if (this.map[y+1] !== undefined && this.map[y+1][x] !== MAP_DATA.EMPTY && this.map[y+1][x] !== MAP_DATA.INPUT && this.map[y+1][x] !== MAP_DATA.OUTPUT) {
            result.down = true;
        } else if (this.map[y][x] === MAP_DATA.HALL && this.map[y+1] !== undefined && this.map[y+1][x] == MAP_DATA.INPUT) {
            result.input = 'down';
        } else if (this.map[y][x] === MAP_DATA.STAIR && this.map[y+1] !== undefined && this.map[y+1][x] == MAP_DATA.OUTPUT) {
            result.output = 'down';
        } else if (this.map[y][x] === MAP_DATA.BOSS && this.map[y+1] !== undefined && this.map[y+1][x] == MAP_DATA.OUTPUT) {
            result.output = 'down';
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

    getHallPos(map) {
        const hallPos = {
            x: null,
            y: null
        };

        for (let y=0; y<map.length; y++) {
            for (let x=0; x<map.length; x++) {
                const mapData = map[y][x];

                if(mapData == MAP_DATA.HALL) {
                    hallPos.x = x;
                    hallPos.y = y;
                }
            }
        }

        return hallPos;
    }

    getStairRoomPos(map, rooms) {
        const resultRooms = [];

        rooms.forEach((room) => {
            let count = 0;

            if (map[room.y][room.x] === MAP_DATA.HALL) {
                count = 2;
            }
            if (map[room.y-1] == undefined || map[room.y][room.x -1] == undefined) {
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

        const hallPos = this.getHallPos(map);
        const stairPos = {
            x: null,
            y: null
        };
        let dist = -1;

        resultRooms.forEach((room) => {
            const compareDist = (hallPos.x - room.x)**2 + (hallPos.y - room.y)**2;

            if (dist < compareDist) {
                dist = compareDist;
                stairPos.x = room.x;
                stairPos.y = room.y;
            }
        });

        return stairPos;
    }

    getBossRoomPos(map, rooms) {
        const resultRooms = [];

        rooms.forEach((room) => {
            let flag = true;

            if (map[room.y - 1] === undefined || map[room.y - 1] !== undefined && map[room.y - 1][room.x] === MAP_DATA.PASSAGE) {
                flag = false;
            }

            if (flag) {
                resultRooms.push(room);
            }
        });

        const hallPos = this.getHallPos(map);
        const bossPos = {
            x: null,
            y: null
        };
        let dist = -1;

        resultRooms.forEach((room) => {
            const compareDist = (hallPos.x - room.x)**2 + (hallPos.y - room.y)**2;

            if (dist < compareDist) {
                dist = compareDist;
                bossPos.x = room.x;
                bossPos.y = room.y;
            }
        });

        return bossPos;
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