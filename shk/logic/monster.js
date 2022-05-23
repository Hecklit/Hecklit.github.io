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
                epPerUnit, attackPrio) {
        this.id = IdGen.get();
        this.attackPrio = attackPrio;
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
            c.reach, c.mov, c.hp, c.numAttacks, c.dmg, c.def, c.revenge, c.mobility, c.EPperUnit, c.attackPrio);
        pl.units.push(monster);
        return monster;
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

    takeTurn(map, index, isMovementTurn, curP) {
        if (isMovementTurn) {
            return this.doMovementTurn(map, index, curP);
        } else {
            return this.doAttackTurn(map, index, curP);
        }
    }

    findTarget(map, curP) {
        // find closest target
        const allTargets = map.getEnemiesInRange(this.tile, 4, this.player).filter(u => u.player.id === curP.id);
        const closestTargets = allTargets.sort((a, b) => Map.dist(a.tile, b.tile));
        let target = null;
        this.attackPrio.forEach(p => {
            if(target) {
                return;
            }
            const pTarget = closestTargets.filter(t => t.type === p)[0];
            if(pTarget){
                target = pTarget;
            }
        })
        return target;
    }

    doMovementTurn(map, index, curP) {
        if (this.mobility === MobileAttackType.BthenA && index === 0) {
            const closestTarget = this.findTarget(map, curP);
            if (closestTarget) {
                this.game.moveInDirection(this, this.tile, closestTarget.tile);
            }
            return false;
        }
    }

    doAttackTurn(map, index, curP) {
        if (this.mobility === MobileAttackType.BthenA && index === 1) {
            const closestTarget = this.findTarget(map, curP);
            if (closestTarget && Map.dist(closestTarget.tile, this.tile) <= this.reach) {
                this.game.fight(this, closestTarget);
            }
            return true;
        }
    }

}