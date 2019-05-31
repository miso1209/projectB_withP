export default class AutoMap {
    constructor(width, height) {
        this._width = width;
        this._height = height;

        this._options = {
			cellWidth: 3,
            cellHeight: 3,
            roomWidth: 3, 
            roomHeight: 3
		};

    }

    _fillMap(value) {
		let map = [];
		for (let i=0;i<this._width;i++) {
			map.push([]);
			for (let j=0;j<this._height;j++) { map[i].push(value); }
		}
		return map;
    }

    create(callback) {
		this.map = this._fillMap(1);
		this.rooms = [];
		this.connectedCells = [];

		this._initRooms();
		this._connectRooms();
		this._connectUnconnectedRooms();
		this._createRandomRoomConnections();
		this._createRooms();
		this._createCorridors();

		if (callback) {
			for (let i = 0; i < this._width; i++) {
				for (let j = 0; j < this._height; j++) {
					callback(i, j, this.map[i][j]);
				}
			}
		}

		return this;
	}
    

    _initRooms() {
		// create rooms array. This is the "grid" list from the algo.
		for (let i = 0; i < this._options.cellWidth; i++) {
			this.rooms.push([]);
			for (let j = 0; j < this._options.cellHeight; j++) {
				this.rooms[i].push({"x":0, "y":0, "width":0, "height":0, "connections":[], "cellx":i, "celly":j});
			}
		}
    }
    
    _connectRooms() {
		//pick random starting grid
		let cgx = getUniformInt(0, this._options.cellWidth-1);
		let cgy = RNG.getUniformInt(0, this._options.cellHeight-1);

		let idx;
		let ncgx;
		let ncgy;

		let found = false;
		let room;
		let otherRoom;
		let dirToCheck;

		// find  unconnected neighbour cells
		do {

			//dirToCheck = [0, 1, 2, 3, 4, 5, 6, 7];
			dirToCheck = [0, 2, 4, 6];
			dirToCheck = RNG.shuffle(dirToCheck);

			do {
				found = false;
				idx = dirToCheck.pop();

				ncgx = cgx + DIRS[8][idx][0];
				ncgy = cgy + DIRS[8][idx][1];

				if (ncgx < 0 || ncgx >= this._options.cellWidth) { continue; }
				if (ncgy < 0 || ncgy >= this._options.cellHeight) { continue; }

				room = this.rooms[cgx][cgy];

				if (room["connections"].length > 0) {
					// as long as this room doesn't already coonect to me, we are ok with it.
					if (room["connections"][0][0] == ncgx && room["connections"][0][1] == ncgy) {
						break;
					}
				}

				otherRoom = this.rooms[ncgx][ncgy];

				if (otherRoom["connections"].length == 0) {
					otherRoom["connections"].push([cgx, cgy]);

					this.connectedCells.push([ncgx, ncgy]);
					cgx = ncgx;
					cgy = ncgy;
					found = true;
				}

			} while (dirToCheck.length > 0 && found == false);

		} while (dirToCheck.length > 0);

    }
    
    _connectUnconnectedRooms() {
		//While there are unconnected rooms, try to connect them to a random connected neighbor
		//(if a room has no connected neighbors yet, just keep cycling, you'll fill out to it eventually).
		let cw = this._options.cellWidth;
		let ch = this._options.cellHeight;

		this.connectedCells = RNG.shuffle(this.connectedCells);
		let room;
		let otherRoom;
		let validRoom;

		for (let i = 0; i < this._options.cellWidth; i++) {
			for (let j = 0; j < this._options.cellHeight; j++)  {

				room = this.rooms[i][j];

				if (room["connections"].length == 0) {
					let directions = [0, 2, 4, 6];
					directions = RNG.shuffle(directions);
					validRoom = false;

					do {

						let dirIdx = directions.pop();
						let newI = i + DIRS[8][dirIdx][0];
						let newJ = j + DIRS[8][dirIdx][1];

						if (newI < 0 || newI >= cw || newJ < 0 || newJ >= ch) { continue; }

						otherRoom = this.rooms[newI][newJ];
						validRoom = true;

						if (otherRoom["connections"].length == 0) { break; }

						for (let k = 0; k < otherRoom["connections"].length; k++) {
							if (otherRoom["connections"][k][0] == i && otherRoom["connections"][k][1] == j) {
								validRoom = false;
								break;
							}
						}

						if (validRoom) { break; }

					} while (directions.length);

					if (validRoom) {
						room["connections"].push([otherRoom["cellx"], otherRoom["celly"]]);
					} else {
						console.log("-- Unable to connect room.");
					}
				}
			}
		}
    }
    
    _createRandomRoomConnections() {
		// Empty for now.
	}

	_createRooms() {
		let w = this._width;
		let h = this._height;

		let cw = this._options.cellWidth;
		let ch = this._options.cellHeight;

		let cwp = Math.floor(this._width / cw);
		let chp = Math.floor(this._height / ch);

		let roomw;
		let roomh;
		let roomWidth = this._options["roomWidth"];
		let roomHeight = this._options["roomHeight"];
		let sx;
		let sy;
		let otherRoom;

		for (let i = 0; i < cw; i++) {
			for (let j = 0; j < ch; j++) {
				sx = cwp * i;
				sy = chp * j;

				if (sx == 0) { sx = 1; }
				if (sy == 0) { sy = 1; }

				roomw = RNG.getUniformInt(roomWidth[0], roomWidth[1]);
				roomh = RNG.getUniformInt(roomHeight[0], roomHeight[1]);

				if (j > 0) {
					otherRoom = this.rooms[i][j-1];
					while (sy - (otherRoom["y"] + otherRoom["height"] ) < 3) {
						sy++;
					}
				}

				if (i > 0) {
					otherRoom = this.rooms[i-1][j];
					while(sx - (otherRoom["x"] + otherRoom["width"]) < 3) {
						sx++;
					}
				}

				let sxOffset = Math.round(RNG.getUniformInt(0, cwp-roomw)/2);
				let syOffset = Math.round(RNG.getUniformInt(0, chp-roomh)/2);

				while (sx + sxOffset + roomw >= w) {
					if(sxOffset) {
						sxOffset--;
					} else {
						roomw--;
					}
				}

				while (sy + syOffset + roomh >= h) {
					if(syOffset) {
						syOffset--;
					} else {
						roomh--;
					}
				}

				sx = sx + sxOffset;
				sy = sy + syOffset;

				this.rooms[i][j]["x"] = sx;
				this.rooms[i][j]["y"] = sy;
				this.rooms[i][j]["width"] = roomw;
				this.rooms[i][j]["height"] = roomh;

				for (let ii = sx; ii < sx + roomw; ii++) {
					for (let jj = sy; jj < sy + roomh; jj++) {
						this.map[ii][jj] = 0;
					}
				}
			}
		}
	}
}