class Tile {

    constructor(xi, yi, map) {
        this.units = [];
        this.id = IdGen.get();
        this.xi = xi;
        this.yi = yi;
        this.color = "gray";
        this.text = "";
        this.map = map;
        this.isMonsterDen = false;
        this.goldmine = null;
    }

    get cx() {
        return this.x + Map.tileSize / 2;
    }

    get cy() {
        return this.y + Map.tileSize / 2;
    }

    get x(){
        return this.xi * Map.tileSize;
    }

    get y(){
        return this.yi * Map.tileSize;
    }

    get l(){
        return Map.tileSize;
    }

    makeMonsterDen(monsterConfig, repeatable=false) {
        this.isMonsterDen = true;
        this.monsterConfig = monsterConfig;
        this.monsterDenWasTriggered = false;
        this.monsterDenRepeatable = repeatable;
    }

    triggerMonsterDen(monsterPlayer, game) {
        if(!this.monsterDenWasTriggered || this.monsterDenRepeatable) {
            this.monsterDenWasTriggered = true;
            Monster.spawnMonster(this.monsterConfig, this, monsterPlayer, game);
            if(!this.monsterDenRepeatable){
                this.config("gray", "");
            }
        }
    }

    getNeighbour(dix, diy) {
        const ix = this.xi + dix;
        const iy = this.yi + diy;
        if (this.map.tiles[ix]) {
            return this.map.tiles[ix][iy];
        }
    }

    hasPlayerOnIt(pl) {
        return this.units.filter(u => u.player.id === pl.id).length > 0;
    }

    hasEnemyOnIt(pl) {
        return this.units.length === 1 && !this.hasPlayerOnIt(pl) || this.units.length > 1;
    }

    getEnemy(pl) {
        if (this.hasEnemyOnIt(pl)) {
            return this.units.filter(u => u.player.id !== pl.id)[0];
        }
    }

    getUnitOf(pl) {
        if (this.hasPlayerOnIt(pl)) {
            return this.units.filter(u => u.player.id === pl.id)[0];
        }
    }

    config(color, text) {
        this.color = color;
        this.text = text;
    }

}