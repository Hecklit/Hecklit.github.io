class Map {

    constructor() {
        this.id = IdGen.get();
        State.a(new UpdateEntityAction(this, {
            widthInTiles: 0,
            heightInTiles: 0,
        }));
    }

    static tileSize = 60;

    static dist(a, b) {
        if (!a || !b) {
            return Infinity;
        }
        return Math.abs(b.xi - a.xi) + Math.abs(b.yi - a.yi);
    }

    getTileSize() {
        return this.getTile(0, 0).l;
    }

    getTile(xi, yi) {
        const tile = State.getTile(this, xi, yi);
        return tile ? tile : null;
    }

    getTileAtPx(x, y) {
        const l = this.getTileSize();
        const xi = Math.floor(x / l);
        const yi = Math.floor(y / l);
        return this.getTile(xi, yi);
    }

    getTriggerableMonsterDen(player) {
        const flatTiles = State.getAllTiles(this);
        return flatTiles.filter(tile => player.hero.alive && Map.dist(player.hero.tile, tile) <= 1
            && tile.isMonsterDen && !tile.monsterDenWasTriggered);
    }


    setRenderWidth(width) {
        const curState = State.e(this);
        const numX = curState.widthInTiles;
        const numY = curState.heightInTiles;
        Map.tileSize = Math.floor(width / Math.max(numX, numY));
    }


    configureMap(config, monsterPlayer) {
        const redBase = "hsl(0, 70%, 60%)";
        const blueBase = "hsl(240, 70%, 60%)";
        const goldMine = "hsl(60, 70%, 50%)";
        const monster = "hsl(120, 10%, 50%)";

        config.specialTiles.forEach(st => {
            const tile = this.getTile(st.x, st.y);
            switch (st.type) {
                case "Base":
                    const pl = st.ofPlayer;
                    tile.config(pl === 1 ? redBase : blueBase, "B");
                    const player = State.getPlayers()[pl - 1];
                    State.a(new AddBaseTileToPlayerAction(tile, player));
                    break;
                case "Goldmine":
                    tile.config(goldMine, "G" + st.tier);
                    State.a(new AddTileToGoldmineRelAction(
                        new Goldmine(st.tier), tile));
                    break;
                case "Monster":
                    if (monsterPlayer) {
                        tile.makeMonsterDen(AssetManager.getAllMonstersOfLevel(st.lvl).GameSample());
                        tile.config(monster, "M" + st.lvl)
                    }
                    break;
            }
        });
    }

    generateTiles(widthInTiles, heightInTiles) {
        State.a(new UpdateEntityAction(this, {
            widthInTiles,
            heightInTiles
        }));

        for (let x = 0; x < widthInTiles; x++) {
            for (let y = 0; y < heightInTiles; y++) {
                const tile = new Tile(x, y, this);
                State.a(new AddTileToMapAction(this, tile));
            }
        }

    }

    generateSquareMap(config, monsterPlayer) {
        this.generateTiles(config.width, config.height);
        this.configureMap(config, monsterPlayer);
    }

    forEach2D(func) {
        const curState = State.e(this);
        for (let x = 0; x < curState.widthInTiles; x++) {
            for (let y = 0; y < curState.heightInTiles; y++) {
                func(x, y);
            }
        }

    }

    flatTiles() {
        return State.getAllTiles(this);
    }

    getPossibleForcedFightsPerPlayer(pl) {
        const units = State.getUnitsByPlayer(pl);
        return units.reduce((acc, cur) => {
            return acc.concat(this.getPossibleFightsPerUnit(cur).filter(
                enemy => State.onSameTile(enemy, cur)
            ));
        }, []);
    }

    getPossibleFightsPerUnit(unit) {
        if (!unit || unit.attacksThisTurn >= 1
            || (unit.mobility === MobileAttackType.BorA && unit.movedThisTurn > 0)) {
            return [];
        }
        const enemiesOnSameTile = State.getEnemiesOnSameTile(unit);
        if (unit.reach === 0 && enemiesOnSameTile.length > 0) {
            return enemiesOnSameTile;
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
        const tile = State.getTileByUnit(unit);
        return this.getFloodFillTiles(unit, tile, unit.getMovementLeftThisRound() - 1);
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

    getAllValidNeighbours(unit, tile) {
        const neighbours = this.getTilesInRange(tile, 1);
        const player = State.getPlayerByUnit(unit);
        return neighbours.filter(t => t !== tile && !t.hasPlayerOnIt(player));
    }

    getPossibleAnnexedGoldminesPerPlayer(player) {
        const units = State.getUnitsByPlayer(player);
        return units.filter(u => {

            const tile = State.getTileByUnit(u);
            const unitsOnTile = State.getUnitsOnTile(tile);
            const goldmine = State.getGoldmineByAnnexerUnit(u);
            const ownerOfGoldmine = State.getPlayerByGoldmine(goldmine);
            return goldmine
                && unitsOnTile.length === 1
                && (unitsOnTile[0].type === "H" || unitsOnTile[0].num > 1)
                && !goldmine.annexProcessStarted
                && (!ownerOfGoldmine || ownerOfGoldmine.id !== player.id)
        }).map(u => State.getTileByUnit(u));
    }

    getTilesInRange(root, range) {
        // TODO: Make this more performant
        return this.flatTiles().filter(t => Map.dist(root, t) <= range);
    }

    getEnemiesInRange(root, range, playerFilter) {
        const allTiles = this.getTilesInRange(root, range);
        return allTiles.reduce((acc, cur) => {
            const unit = State.getUnitsOnTile(cur)
                .filter(u => State.getPlayerByUnit(u).id !== playerFilter.id || !playerFilter)[0];
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

    moveInDirection(unit, start, end) {
        let [targetTile, pref] = this.lerp(start, end, unit.mov);
        if (pref && targetTile.getEnemy(State.getPlayerByUnit(unit))) {
            [targetTile] = this.lerp(start, end, unit.mov, pref === "X" ? 'Y' : 'X');
        }
        return this.move(unit, targetTile);
    }

    move(unit, tile) {
        const validTiles = this.getPossibleMovementPerUnit(unit);
        const onlyTiles = validTiles.map(o => o.t);
        const d = Map.dist(State.getTileByUnit(unit), tile);
        if (onlyTiles.includes(tile) && !tile.getUnitOf(State.getPlayerByUnit(unit))) {
            const goldmine = State.getGoldmineByAnnexerUnit(unit);
            if (goldmine) {
                goldmine.reset();
            }


            State.a(new RemoveUnitFromTileAction(unit, State.getTileByUnit(unit)));
            State.a(new UpdateEntityAction(unit, old => ({
                movedThisTurn: old.movedThisTurn + d
            })))
            State.a(new AddUnitToTileAction(unit, tile));
            return tile;
        }
    }

    moveIdx(unit, ix, iy) {
        const neighbour = State.getTileByUnit(unit).getNeighbour(ix, iy);
        if (neighbour) {
            return this.move(unit, neighbour);
        }
    }

    cantMoveAnymore(unit) {
        const possibleMovements = this.getPossibleMovementPerUnit(unit);
        if (possibleMovements.length === 0) {
            return true;
        }
        return unit.movedThisTurn >= unit.mov;
    }

    cantAttackAnymore(unit) {
        if (unit.mobility === MobileAttackType.BorA && unit.movedThisTurn > 0) {
            return true;
        }
        const possibleFights = this.getPossibleFightsPerUnit(unit);
        if (possibleFights.length === 0) {
            return true;
        }
        return unit.attacksThisTurn >= 1;
    }


    fight(attacker, defender) {
        const prevDefNum = defender.num;
        const prevDefTotalHp = defender.totalHp;
        const prevAttackerNum = attacker.num;
        const prevAttackerTotalHp = attacker.totalHp;
        const attackerRolls = this.attack(attacker, defender);
        let defenderRolls = [];
        if (defender.alive && defender.revenge && attackerRolls.length > 0) {
            defenderRolls = this.attack(defender, attacker, true);
        }

        State.a(new RecordFightAction({
            attacker, defender, attackerRolls, defenderRolls,
            prevDefNum, prevDefTotalHp, prevAttackerNum, prevAttackerTotalHp
        }));
        console.log("onAttack", {
            attacker, defender, attackerRolls, defenderRolls,
            prevDefNum, prevDefTotalHp, prevAttackerNum, prevAttackerTotalHp
        });
        // TODO: Figure out a way you can emit that. Maybe we can make it based on
        // the actions that are happening
        // this.onAttack.emit(attacker, defender, attackerRolls, defenderRolls,
        //     prevDefNum, prevDefTotalHp, prevAttackerNum, prevAttackerTotalHp);
        return {
            attacker, defender, attackerRolls, defenderRolls,
            prevDefNum, prevDefTotalHp, prevAttackerNum, prevAttackerTotalHp
        }
    }

    attack(attacker, defender, revenge = false) {
        if (this.cantAttackAnymore(attacker) && !revenge) {
            return [];
        }

        // check if its in range
        const attackerTile = State.getTileByUnit(attacker);
        const defenderTile = State.getTileByUnit(defender);
        const distance = Map.dist(attackerTile, defenderTile);
        if (attacker.reach < distance) {
            return [];
        }

        // has to attack unit on same field if not alone
        const unitsOnTile = State.getUnitsOnTile(attackerTile);
        if (attacker.reach > 0 && unitsOnTile.length > 1 && attackerTile !== defenderTile) {
            return [];
        }

        // we are in range
        if (!revenge) {
            State.a(new UpdateEntityAction(attacker, old => ({
                attacksThisTurn: old.attacksThisTurn +1
            }) ))
        }
        let rolls = [];
        const prevNum = defender.num;
        for (let i = 0; i < attacker.num * attacker.numAttacks; i++) {
            const diceRoll = Game.throwDice();
            const successBelow = attacker.dmg - defender.def + 1;
            if (diceRoll < successBelow) {
                defender.takeDmg(1);
            }
            rolls.push({
                n: diceRoll,
                h: diceRoll < successBelow,
            });
        }
        const numEnemiesDied = prevNum - defender.num;
        if (numEnemiesDied > 0) {
            const attackingPlayer = State.getPlayerByUnit(attacker);
            attackingPlayer.onEnemiesKilled(defender, numEnemiesDied);
            if (defender.gold) {
                State.a(new UpdateEntityAction(attackingPlayer, old => ({
                    gold: old.gold + defender.gold * numEnemiesDied
                })))
            }
        }

        return rolls;
    }

}