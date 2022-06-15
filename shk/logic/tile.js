class Tile {

    constructor(xi, yi) {
        this.id = IdGen.get();
        State.a(new UpdateEntityAction(this, {
            xi: xi,
            yi: yi,
            color: "gray",
            text: "",
            isMonsterDen: false,
            goldmine: null,
        }));
    }

    get cx() {
        return this.x + Map.tileSize / 2;
    }

    get cy() {
        return this.y + Map.tileSize / 2;
    }

    get x(){
        const curState = State.e(this);
        return curState.xi * Map.tileSize;
    }

    get y(){
        const curState = State.e(this);
        return curState.yi * Map.tileSize;
    }

    get l(){
        return Map.tileSize;
    }

    makeMonsterDen(monsterConfig, repeatable=false) {
        State.a(new UpdateEntityAction(this, {
            isMonsterDen: true,
            monsterConfig: monsterConfig,
            monsterDenWasTriggered: false,
            monsterDenRepeatable: repeatable,
        }));
    }

    triggerMonsterDen(monsterPlayer, game) {
        let curState = State.e(this);
        if(!curState.monsterDenWasTriggered || curState.monsterDenRepeatable) {
            State.a(new UpdateEntityAction(this, {
                monsterDenWasTriggered: true
            }));
            Monster.spawnMonster(curState.monsterConfig, curState, monsterPlayer, game);
            curState = State.e(this);
            if(!curState.monsterDenRepeatable){
                curState.config("gray", "");
            }
        }
    }

    getNeighbour(dix, diy) {
        let curState = State.e(this);
        const ix = curState.xi + dix;
        const iy = curState.yi + diy;
        const map = State.getMapByTile(this);
        return State.getTile(map, ix, iy);
    }

    hasPlayerOnIt(pl) {
        const units = State.getUnitsOnTile(this);
        return units.filter(u => State.getPlayerByUnit(u).id === pl.id).length > 0;
    }

    hasEnemyOnIt(pl) {
        const units = State.getUnitsOnTile(this);
        return units.length === 1 && !this.hasPlayerOnIt(pl) || units.length > 1;
    }

    getEnemy(pl) {
        const units = State.getUnitsOnTile(this);
        if (this.hasEnemyOnIt(pl)) {
            return units.filter(u => State.getPlayerByUnit(u).id !== pl.id)[0];
        }
    }

    getUnitOf(pl) {
        const units = State.getUnitsOnTile(this);
        if (this.hasPlayerOnIt(pl)) {
            return units.filter(u => State.getPlayerByUnit(u).id === pl.id)[0];
        }
    }

    config(color, text) {
        State.a(new UpdateEntityAction(this, {
            color: color,
            text: text,
        }));
    }

}