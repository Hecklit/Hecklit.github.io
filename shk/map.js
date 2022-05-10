class Map {

    constructor() {
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

    getTile(xi, yi) {
        return this.tiles[xi][yi];
    }

    getTileAtPx(x, y) {
        const l = this.getTileSize();
        const xi = Math.floor(x / l);
        const yi = Math.floor(y / l);
        if (this.tiles[xi]) {
            return this.tiles[xi][yi];
        }
    }

    configureMiniMap() {
        const ex = this.tiles.length - 1;
        const ey = this.tiles[0].length - 1;
        const redBase = "hsl(0, 70%, 60%)";
        const blueBase = "hsl(240, 70%, 60%)";
        const goldMine = "hsl(60, 70%, 50%)";
        const monster = "hsl(120, 10%, 50%)";

        // red base
        this.tiles[0][ey].config(redBase, "B");
        this.tiles[0][ey - 1].config(redBase, "B");
        this.tiles[1][ey].config(redBase, "B");
        this.tiles[1][ey - 1].config(redBase, "B");

        // blue base
        this.tiles[ex][ey].config(blueBase, "B");
        this.tiles[ex][ey - 1].config(blueBase, "B");
        this.tiles[ex - 1][ey].config(blueBase, "B");
        this.tiles[ex - 1][ey - 1].config(blueBase, "B");

        // Goldmine
        this.tiles[3][1].config(goldMine, "G2");
        this.tiles[ex - 3][1].config(goldMine, "G2");
        this.tiles[7][2].config(goldMine, "G5");

        // Monster
        this.tiles[2][0].config(monster, "M1");
        this.tiles[4][0].config(monster, "M1");
        this.tiles[ex - 2][0].config(monster, "M1");
        this.tiles[ex - 4][0].config(monster, "M1");
        this.tiles[5][2].config(monster, "M1");
        this.tiles[ex - 5][2].config(monster, "M1");
        this.tiles[3][ey].config(monster, "M1");
        this.tiles[ex - 3][ey].config(monster, "M1");

        this.tiles[0][0].config(monster, "M2");
        this.tiles[ex][0].config(monster, "M2");
        this.tiles[7][0].config(monster, "M2");
        this.tiles[7][ey].config(monster, "M2");

    }

    generateSquareMap(width, height, tileSize, mapType) {
        this.width = width;
        this.height = height;

        for (let x = 0; x < width; x++) {
            this.tiles.push([]);
            for (let y = 0; y < height; y++) {
                const tile = new Tile(x * tileSize, y * tileSize,
                    tileSize, x, y, this);
                this.tiles[x].push(tile);
            }
        }

        switch (mapType) {

            case MapType.FixMini:
                this.configureMiniMap();
                break;

        }
    }


    forEach2D(func) {

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                func(x, y);
            }
        }

    }

    flatTiles() {
        return this.tiles.reduce((acc, c) => {
            c.forEach(b => acc.push(b));
            return acc;
        }, []);
    }

    draw() {
        this.forEach2D((x, y) => {
            this.tiles[x][y].draw();
        });
    }


    getPossibleFightsPerPlayer(pl) {
        return pl.units.reduce((acc, cur) => {
            return acc.concat(this.getPossibleFightsPerUnit(cur));
        }, []);
    }

    getPossibleFightsPerUnit(unit) {
        if (!unit || unit.cantAttackAnymore()) {
            return [];
        }
        if (unit.reach === 0 && unit.tile.getEnemy(unit.player)) {
            return [unit.tile.getEnemy(unit.player)]
        }
        if (unit.reach > 0) {
            return this.getEnemiesInRange(unit.tile, unit.reach, unit.player);
        }
        return [];
    }

    getPossibleMovementPerUnit(unit) {
        if (!unit || unit.cantMoveAnymore()) {
            return [];
        }
        const ts = this.getTilesInRange(unit.tile, unit.getMovementLeftThisRound());
        return ts.filter(t => t !== unit.tile && !t.hasPlayerOnIt(unit.player));
    }

    getTilesInRange(root, range) {
        // TODO: Make this more performant
        return this.flatTiles().filter(t => Map.dist(root, t) <= range);
    }

    getUnitsInRange(root, range, playerFilter) {
        const allTiles = this.getTilesInRange(root, range);
        return allTiles.reduce((acc, cur) => {
            const unit = cur.units.filter(u => u.player === playerFilter || !playerFilter)[0];
            if (unit) {
                acc.push(unit);
            }
            return acc;
        }, []);
    }

    getEnemiesInRange(root, range, playerFilter) {
        const allTiles = this.getTilesInRange(root, range);
        return allTiles.reduce((acc, cur) => {
            const unit = cur.units.filter(u => u.player !== playerFilter || !playerFilter)[0];
            if (unit) {
                acc.push(unit);
            }
            return acc;
        }, []);
    }

    drawOverlay(curUnit, attackOnly) {
        if (!curUnit) {
            return;
        }

        if (!attackOnly) {
            const inReach = this.getPossibleMovementPerUnit(curUnit);
            inReach.forEach(ir => ir.drawOverlay("rgba(0, 255, 0, 0.3)"));
        }

        if (attackOnly) {
            const pfs = this.getPossibleFightsPerUnit(curUnit).map(pf => pf.tile);
            pfs.forEach(ir => ir.drawOverlay("rgba(255, 0, 0, 0.3)"));
            if (curUnit.reach > 0) {
                pfs.forEach(ir => arrow(curUnit.tile.cx, curUnit.tile.cy, ir.cx, ir.cy, curUnit.player.color));
            }
        }

    }
}