class Monster {
    constructor(pl, name, lvl, gold, aiStrategy, tile, num
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
    }

    static spawnMonster(c, tile, pl) {
        const monster = new Monster(pl, c.name, c.lvl, c.gold, c.aiStrategy, tile, c.num,
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

    async attack(enemyUnit, revenge = false, viz = false) {
        if (this.cantAttackAnymore()) {
            return [];
        }

        console.log("Start attack! revenge:", revenge, this.player.id, enemyUnit.player.id);
        // check if its in range
        const distance = Map.dist(this.tile, enemyUnit.tile);
        if (this.reach < distance) {
            return [];
        }

        // has to attack unit on same field if not alone
        if (this.reach > 0 && this.tile.units.length > 1 && this.tile !== enemyUnit.tile) {
            return [];
        }

        // we are in range
        this.attacksThisTurn += 1;
        let rolls = [];
        const prevNum = enemyUnit.num;
        for (let i = 0; i < this.num; i++) {
            const diceRoll = Game.throwDice();
            const successBelow = this.dmg - enemyUnit.def + 1;
            if (diceRoll < successBelow) {
                enemyUnit.takeDmg(1);
            }
            rolls.push({
                n: diceRoll,
                h: diceRoll < successBelow,
            });
        }
        const numEnemiesDied = prevNum - enemyUnit.num;
        if (numEnemiesDied > 0) {
            this.player.onEnemiesKilled(enemyUnit, numEnemiesDied);
            if (enemyUnit.gold) {
                this.player.gold += enemyUnit.gold * numEnemiesDied;
            }
        }

        // revenge?
        let enemyHits = [];
        if (!revenge && enemyUnit.alive && enemyUnit.revenge) {
            enemyHits = await enemyUnit.attack(this, true);
            console.log("enemyHits", enemyHits)
        }

        if (revenge) {
            console.log("rolls", rolls);
            return rolls;
        } else {

            if (viz) {

                // play viz
                await Fightvis.playViz(this, enemyUnit, prevNum, rolls,  enemyHits);
            }

            return {
                [this.player.id]: rolls.filter(r => r.h).length,
                [enemyUnit.player.id]: enemyHits?.filter(r => r.h).length
            }
        }

    }

    drawActive() {
        // TODO: Needs to be implemented better
        /*        ctx.fillStyle = "white";
                circle(this.tile.x + this.tile.l / 2,
                    this.tile.y + this.tile.l / 2,
                    this.tile.l / 2,
                    false);*/
    }

    async takeTurn(map, index, isMovementTurn) {
        if(isMovementTurn) {
            return this.doMovementTurn(map, index);
        } else {
            return await this.doAttackTurn(map, index);
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

    async doAttackTurn(map, index) {
        if(this.mobility === MobileAttackType.BthenA && index === 1) {
            // find closest target
            const allTargets = map.getEnemiesInRange(this.tile, 4, this.player);
            const closestTarget = allTargets.sort((a, b) => Map.dist(a.tile, b.tile))[0];
            if(closestTarget && Map.dist(closestTarget.tile, this.tile) <= this.reach){
                await this.attack(closestTarget);
            }
            return true;
        }
    }

    draw(phase, curP) {
        ctx.fillStyle = this.player.color;
        const notAlone = this.tile.units.length > 1;
        const sq = Math.ceil(Math.sqrt(this.num));
        let xOffset = 0;
        let tileSize = this.tile.l;

        if (notAlone) {
            tileSize /= 2;
            const enemy = this.tile.getEnemy(this);
            xOffset = enemy.player.id === "Jonas" ? tileSize : 0;
        }

        const size = tileSize * 0.9 / sq;
        let painted = 0;
        for (let x = 0; x < sq; x++) {
            for (let y = 0; y < sq; y++) {
                if (painted >= this.num) {
                    break;
                }
                circle(
                    this.tile.x + x * size + tileSize * 0.075 + 0.5 * size + xOffset,
                    this.tile.y + y * size + tileSize * 0.075 + 0.5 * size,
                    size * 0.9 * 0.5);
                painted++;
            }
        }
        let add = "";
        if (phase === 8 && !this.cantAttackAnymore() && curP.id === this.player.id) {
            add = "!"
        }
        if (phase === 5 && !this.cantMoveAnymore() && curP.id === this.player.id) {
            add = "~"
        }
        text(this.name.split(" ").map(e => e[0]).join("") + add, this.tile.x + tileSize / 2 + xOffset, this.tile.y + tileSize / 1.4, tileSize * 0.6, "white");
    }

}