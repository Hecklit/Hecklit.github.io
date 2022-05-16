class Tile {

    constructor(x, y, l, xi, yi, map) {
        this.units = [];
        this.id = IdGen.get();
        this.x = x;
        this.y = y;
        this.l = l;
        this.cx = x + l / 2;
        this.cy = y + l / 2;
        this.xi = xi;
        this.yi = yi;
        this.color = "gray";
        this.text = "";
        this.map = map;
        this.isMonsterDen = false;
        this.goldmine = null;
    }

    makeMonsterDen(monsterConfig) {
        this.isMonsterDen = true;
        this.monsterConfig = monsterConfig;
        this.monsterDenWasTriggered = false;
    }

    triggerMonsterDen(monsterPlayer) {
        this.monsterDenWasTriggered = true;
        Monster.spawnMonster(this.monsterConfig, this, monsterPlayer);
    }

    draw() {
        ctx.fillStyle = this.color;

        ctx.fillRect(this.x, this.y, this.l, this.l);
        ctx.rect(this.x, this.y, this.l, this.l);
        ctx.stroke();

        if (this.goldmine && this.goldmine.player) {
            ctx.fillStyle = this.goldmine.player.color;
            ctx.fillRect(this.x, this.y, this.l * 0.2, this.l * 0.2);
        }
        if (this.goldmine && this.goldmine.annexProcessStarted) {
            ctx.fillStyle = "green";
            ctx.fillRect(this.x, this.y, this.l * 0.2, this.l * 0.2);
        }
        ctx.textAlign = 'center';
        ctx.fillStyle = "black";
        ctx.font = '30px serif';
        ctx.fillText(this.text, this.x + this.l / 2, this.y + this.l / 1.5);
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


    drawOverlay(color) {
        const tmp = this.color;
        this.color = color;
        this.draw();
        this.color = tmp;
    }

    config(color, text) {
        this.color = color;
        this.text = text;
    }

}