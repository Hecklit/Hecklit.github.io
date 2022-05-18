class Unit {
    constructor(player, tile, type, num, cost
        , reach
        , mov
        , hp
        , numAttacks
        , dmg
        , def
        , revenge
        , mobility) {
        this.id = IdGen.get();
        this.player = player;
        tile.units.push(this);
        this.tile = tile;
        this.type = type;
        this.cost = cost;
        this.reach = reach;
        this.num = num;
        this.mov = mov;
        this.hp = hp;
        this.numAttacks = numAttacks;
        this.dmg = dmg;
        this.def = def;
        this.revenge = revenge;
        this.mobility = mobility;
        this.alive = true;
        this.totalHp = this.num * this.hp;
        this.movedThisTurn = 0;
        this.attacksThisTurn = 0;
        this.goldmine = undefined;
    }

    move(tile) {
        const d = Map.dist(this.tile, tile);
        if (this.mov >= d && this.movedThisTurn + d <= this.mov) {
            if (this.goldmine) {
                this.goldmine.reset();
            }

            this.movedThisTurn += d;
            this.tile.units = this.tile.units.remove(this);
            tile.units.push(this);
            this.tile = tile;
            return tile;
        }
    }

    moveIdx(ix, iy) {
        const neighbour = this.tile.getNeighbour(ix, iy);
        if (neighbour) {
            return this.move(neighbour);
        }
    }

    takeDmg(amount) {
        if (amount > 0 && this.goldmine) {
            this.goldmine.reset();
        }
        this.totalHp -= amount;
        this.num = Math.ceil(this.totalHp / this.hp);
        if (this.totalHp <= 0 && this.alive) {
            console.log(`${this.player.id} ${this.type} has died.`)
            this.alive = false;
            return false;
        }
        return this.alive;
    }

    getMovementLeftThisRound() {
        return this.mov - this.movedThisTurn;
    }

    cantMoveAnymore() {
        return this.movedThisTurn >= this.mov;
    }

    cantAttackAnymore() {
        if (this.mobility === MobileAttackType.BorA && this.movedThisTurn > 0) {
            return true;
        }
        return this.attacksThisTurn >= this.numAttacks;
    }

}