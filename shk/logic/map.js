class Map {

    constructor(game) {
        this.tiles = [];
        this.baseTiles = [[], []];
        this.width = 0;
        this.height = 0;
        this.game = game;
    }

    static tileSize = 60;

    static dist(a, b) {
        if (!a || !b) {
            return Infinity;
        }
        return Math.abs(b.xi - a.xi) + Math.abs(b.yi - a.yi);
    }

    getTileSize() {
        return this.tiles[0][0].l;
    }

    getTiles(selector) {
        return selector.map(s => this.tiles[s[0]][s[1]]);
    }

    getTile(xi, yi) {
        return this.tiles[xi] ? this.tiles[xi][yi] : null;
    }

    getTileAtPx(x, y) {
        const l = this.getTileSize();
        const xi = Math.floor(x / l);
        const yi = Math.floor(y / l);
        if (this.tiles[xi]) {
            return this.tiles[xi][yi];
        }
    }

    getTriggerableMonsterDen(player) {
        return this.flatTiles().filter(tile => player.hero.alive && Map.dist(player.hero.tile, tile) <= 1
            && tile.isMonsterDen && !tile.monsterDenWasTriggered);
    }


    setRenderWidth(width) {
        const numX = this.tiles.length;
        const numY = this.tiles[0].length;
        Map.tileSize = Math.floor(width / Math.max(numX, numY));
    }


    configureMap(config, monsterPlayer) {
        const redBase = "hsl(0, 70%, 60%)";
        const blueBase = "hsl(240, 70%, 60%)";
        const goldMine = "hsl(60, 70%, 50%)";
        const monster = "hsl(120, 10%, 50%)";

        config.specialTiles.forEach(st => {
            switch (st.type) {
                case "Base":
                    const pl = st.ofPlayer;
                    this.tiles[st.x][st.y].config(pl === 1 ? redBase : blueBase, "B");
                    this.baseTiles[pl-1].push(this.tiles[st.x][st.y])
                    break;
                case "Goldmine":
                    this.tiles[st.x][st.y].config(goldMine, "G"+st.tier);
                    this.tiles[st.x][st.y].goldmine = new Goldmine(this.tiles[st.x][st.y], st.tier);
                    break;
                case "Monster":
                    if(monsterPlayer){
                        this.tiles[st.x][st.y].makeMonsterDen(AssetManager.getAllMonstersOfLevel(st.lvl).sample());
                        this.tiles[st.x][st.y].config(monster, "M"+st.lvl)
                    }
                    break;
            }
        });
    }

    generateTiles(width, height) {
        this.width = width;
        this.height = height;

        for (let x = 0; x < width; x++) {
            this.tiles.push([]);
            for (let y = 0; y < height; y++) {
                const tile = new Tile(x, y, this);
                this.tiles[x].push(tile);
            }
        }

    }

    generateSquareMap(config, monsterPlayer) {
        this.generateTiles(config.width, config.height);
        this.configureMap(config, monsterPlayer);
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

    getPossibleFightsPerPlayer(pl) {
        return pl.units.reduce((acc, cur) => {
            return acc.concat(this.getPossibleFightsPerUnit(cur));
        }, []);
    }

    getPossibleForcedFightsPerPlayer(pl) {
        return pl.units.reduce((acc, cur) => {
            return acc.concat(this.getPossibleFightsPerUnit(cur).filter(
                enemy => enemy.tile.id === cur.tile.id
            ));
        }, []);
    }

    getPossibleFightsPerUnit(unit) {
        if (!unit || unit.attacksThisTurn >= unit.numAttacks
            || (unit.mobility === MobileAttackType.BorA && unit.movedThisTurn > 0)) {
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
        if (!unit || unit.movedThisTurn >= unit.mov) {
            return [];
        }
        return this.getFloodFillTiles(unit, unit.tile, unit.getMovementLeftThisRound() - 1);
    }

    recursiveFloorFill(unit, tilePool, tile, lvl, maxLvl = 1000) {
        if (lvl > maxLvl) {
            return tilePool;
        }
        if (tile.id in tilePool && tilePool[tile.id].dtg > lvl) {
            return tilePool;
        }

        const validNeighbours = this.getAllValidNeighbours(unit, tile);

        validNeighbours.forEach(t => {
            const isWorseThanOtherSolution = tilePool[t.id]?.dtg < (lvl + 1);
            tilePool[t.id] = isWorseThanOtherSolution ? tilePool[t.id] : {t, dtg: lvl + 1}
            if (!t.hasEnemyOnIt(unit.player) && !isWorseThanOtherSolution) {
                const result = this.recursiveFloorFill(unit, tilePool, t, lvl + 1, maxLvl);
                tilePool = this.mergeTilePools(tilePool, result);
            }
        });

        return tilePool;
    }

    mergeTilePools(a, b) {
        const res = Object.entries(a).reduce((acc, [k, {t, dtg}]) => {
            acc[k] = {t, dtg: Math.min(dtg, b[k]?.dtg || 1000)};
            return acc;
        }, {});
        return Object.entries(b).reduce((acc, [k, {t, dtg}]) => {
            acc[k] = {t, dtg: Math.min(dtg, res[k]?.dtg || 1000)};
            return acc;
        }, {});
    }

    getFloodFillTiles(unit, end, reach = 1000) {
        let tilePool = {};
        tilePool = this.recursiveFloorFill(unit, tilePool, end, 0, reach);
        return Object.values(tilePool);
    }

    getShortestValidPath(unit, start, end) {
        const tilePool = {};

        this.recursiveFloorFill(unit, tilePool, end, 0, unit.reach);

        return [];
    }

    getAllValidNeighbours(unit, tile) {
        const neighbours = this.getTilesInRange(tile, 1);
        return neighbours.filter(t => t !== tile && !t.hasPlayerOnIt(unit.player));
    }

    getPossibleAnnexedGoldminesPerPlayer(player) {
        return player.units.filter(u => u.tile.goldmine
            && u.tile.units.length === 1
            && (u.tile.units[0].type === "H" || u.tile.units[0].num > 1)
            && !u.tile.goldmine.annexProcessStarted
            && (!u.tile.goldmine.player || u.tile.goldmine.player.id !== player.id))
            .map(u => u.tile);
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

    lerp(a, b, d, pref = null) {
        const dx = b.xi - a.xi;
        const dy = b.yi - a.yi;
        const absdx = Math.abs(dx);
        const absdy = Math.abs(dy);
        const dirx = absdx === 0 ? 1 : dx / absdx;
        const diry = absdy === 0 ? 1 : dy / absdy;

        const distanceToTravel = absdx + absdy;
        if (distanceToTravel <= d) {
            return [b, null];
        } else {
            if ((pref && pref === 'X') || (!pref && absdx > absdy)) {
                const whatsLeftMag = d - absdx <= 0 ? 0 : (d - absdx);
                return [
                    this.getTile(a.xi + (d - whatsLeftMag) * dirx, a.yi + whatsLeftMag * diry),
                    'X']
            } else {
                const whatsLeftMag = d - absdy <= 0 ? 0 : (d - absdy);
                return [
                    this.getTile(a.xi + whatsLeftMag * dirx, a.yi + (d - whatsLeftMag) * diry),
                    'Y']
            }
        }
    }

}