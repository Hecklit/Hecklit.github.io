class Monster {
    constructor(game, pl, name, lvl, gold, aiStrategy, tile, num
        , reach
        , mov
        , hp
        , numAttacks
        , dmg
        , def
        , revenge
        , mobility,
        epPerUnit) {
        this.id = IdGen.get();
        this.player = pl;
        this.homeTile = tile;
        this.tile = tile;
        tile.units.push(this);
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
        this.name = name;
        this.type = this.name.split(" ").map(e => e[0]).join("");
        this.lvl = lvl;
        this.gold = gold;
        this.aiStrategy = aiStrategy;
        this.cost = epPerUnit;
        this.game = game;
    }

    static spawnMonster(c, tile, pl, game) {
        console.log("spawnMonster", game);
        const monster = new Monster(game, pl, c.name, c.lvl, c.gold, c.aiStrategy, tile, c.num,
            c.reach, c.mov, c.hp, c.numAttacks, c.dmg, c.def, c.revenge, c.mobility, c.EPperUnit);
        pl.units.push(monster);
        return monster;
    }

    move(tile) {
        const d = Map.dist(this.tile, tile);
        if (this.mov >= d && this.movedThisTurn + d <= this.mov) {
            this.movedThisTurn += d;
            this.tile.units = this.tile.units.remove(this);
            tile.units.push(this);
            this.tile = tile;
            return tile;
        }
    }

    moveInDirection(start, end, map) {
        const targetTile = map.lerp(start, end, this.mov);
        return this.move(targetTile);
    }

    moveIdx(ix, iy) {
        const neighbour = this.tile.getNeighbour(ix, iy);
        if (neighbour) {
            return this.move(neighbour);
        }
    }

    takeDmg(amount) {
        this.totalHp -= amount;
        this.num = Math.ceil(this.totalHp / this.hp);
        if (this.totalHp <= 0 && this.alive) {
            console.log(`${this.player.id} ${this.name} has died.`)
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
        return this.attacksThisTurn >= this.numAttacks;
    }

    takeTurn(map, index, isMovementTurn) {
        if(isMovementTurn) {
            return this.doMovementTurn(map, index);
        } else {
            return this.doAttackTurn(map, index);
        }
    }

    doMovementTurn(map, index) {
        if(this.mobility === MobileAttackType.BthenA && index === 0) {
            // find closest target
            const allTargets = map.getEnemiesInRange(this.tile, 4, this.player);
            const closestTarget = allTargets.sort((a, b) => Map.dist(a.tile, b.tile))[0];
            if(closestTarget) {
                this.moveInDirection(this.tile, closestTarget.tile, map);
            }
            return false;
        }
    }

    doAttackTurn(map, index) {
        if(this.mobility === MobileAttackType.BthenA && index === 1) {
            // find closest target
            const allTargets = map.getEnemiesInRange(this.tile, 4, this.player);
            const closestTarget = allTargets.sort((a, b) => Map.dist(a.tile, b.tile))[0];
            if(closestTarget && Map.dist(closestTarget.tile, this.tile) <= this.reach){
                this.game.fight(this, closestTarget);
            }
            return true;
        }
    }

}