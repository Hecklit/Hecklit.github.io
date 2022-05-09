class Map {

    constructor () {
        this.tiles = [];
        this.isSquareMap = true;
        this.width = 0;
        this.height = 0;
    }

    static dist(a, b) {
        return Math.abs(b.xi - a.xi) + Math.abs(b.yi - a.yi);
    }

    getTileSize() {
        return this.tiles[0][0].l;
    }

    getTiles(selector) {
        return selector.map(s => this.tiles[s[0]][s[1]]);
    }

    getTileAtPx(x, y) {
        const l = this.getTileSize();
        const xi = Math.floor(x/l);
        const yi = Math.floor(y/l);
        if(this.tiles[xi]) {
            return this.tiles[xi][yi];
        }
    }

    configureMiniMap() {
        const ex = this.tiles.length - 1;
        const ey = this.tiles[0].length - 1;

        // red base
        this.tiles[0][ey].config("red", "B");
        this.tiles[0][ey - 1].config("red", "B");
        this.tiles[1][ey].config("red", "B");
        this.tiles[1][ey - 1].config("red", "B");

        // blue base
        this.tiles[ex][ey].config("blue", "B");
        this.tiles[ex][ey - 1].config("blue", "B");
        this.tiles[ex-1][ey].config("blue", "B");
        this.tiles[ex-1][ey - 1].config("blue", "B");

        // Goldmine
        this.tiles[3][1].config("yellow", "G2");
        this.tiles[ex-3][1].config("yellow", "G2");
        this.tiles[7][2].config("yellow", "G5");

        // Monster
        this.tiles[2][0].config("darkgreen", "M1");
        this.tiles[4][0].config("darkgreen", "M1");
        this.tiles[ex-2][0].config("darkgreen", "M1");
        this.tiles[ex-4][0].config("darkgreen", "M1");
        this.tiles[5][2].config("darkgreen", "M1");
        this.tiles[ex-5][2].config("darkgreen", "M1");
        this.tiles[3][ey].config("darkgreen", "M1");
        this.tiles[ex-3][ey].config("darkgreen", "M1");

        this.tiles[0][0].config("darkgreen", "M2");
        this.tiles[ex][0].config("darkgreen", "M2");
        this.tiles[7][0].config("darkgreen", "M2");
        this.tiles[7][ey].config("darkgreen", "M2");

    }

    generateSquareMap(width, height, tileSize, mapType) {
        this.width = width;
        this.height = height;

        for(let x=0; x< width; x++) {
            this.tiles.push([]);
            for(let y=0; y<height; y++) {
                const tile = new Tile(x*tileSize, y*tileSize,
                    tileSize, x, y);
                this.tiles[x].push(tile);
            }
        }

        switch(mapType) {

            case MapType.FixMini:
                this.configureMiniMap();
                break;

        }


    }


    forEach2D(func) {

        for(let x=0; x<this.width; x++) {
            for(let y=0; y<this.height; y++) {
                func(x, y);
            }
        }

    }

    flatTiles() {
        return this.tiles.reduce((acc, c) => {
            c.forEach(b => acc.push(b));
            return acc; }, []);
    }

    draw() {
        this.forEach2D((x, y) => {
            this.tiles[x][y].draw();
        });
    }

    drawOverlay(curUnit){
        const ts = this.flatTiles();

        const inReach = ts.filter(t => Map.dist(t, curUnit.tile) <= curUnit.speed && t !== curUnit.tile && !t.hasPlayerOnIt(curUnit.player) && !t.hasEnemyOnIt(curUnit.player));

        inReach.forEach(ir => ir.drawOverlay("rgba(0, 255, 0, 0.3)"));

        const attackDistance = curUnit.reach > curUnit.speed ? curUnit.reach: curUnit.speed;
        const attack = ts.filter(t => Map.dist(t, curUnit.tile) <= attackDistance && t !== curUnit.tile && t.hasEnemyOnIt(curUnit.player));
        attack.forEach(ir => ir.drawOverlay("rgba(255, 0, 0, 0.3)"));

    }
}