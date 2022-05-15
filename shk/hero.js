class Hero {
    constructor(player, tile, cost
        , reach
        , mov
        , hp
        , numAttacks
        , dmg
        , def
        , revenge
        , mobility, reg, onHeroDeath, respawnTime, lvl, epToNextLvl) {
        this.id = IdGen.get();
        this.player = player;
        tile.units.push(this);
        this.tile = tile;
        this.type = "H";
        this.cost = cost;
        this.reg = reg;
        this.reach = reach;
        this.num = 1;
        this.mov = mov;
        this.lvl = lvl;
        this.epToNextLvl = epToNextLvl;
        this.curExp = 0;
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
        this.onHeroDeath = onHeroDeath;
        this.respawnTime = respawnTime;
    }

    setTile(tile) {
        this.tile.units = this.tile.units.remove(this);
        tile.units.push(this);
        this.tile = tile;
        return tile;
    }

    move(tile) {
        const d = Map.dist(this.tile, tile);
        if (this.mov >= d && this.movedThisTurn + d <= this.mov) {
            this.movedThisTurn += d;
            return this.setTile(tile);
        }
    }

    moveIdx(ix, iy) {
        const neighbour = this.tile.getNeighbour(ix, iy);
        if (neighbour) {
            return this.move(neighbour);
        }
    }

    gainExp(exp){
        if(!this.alive) {
            console.error("Hero cant gain exp while dead!", this)
            return;
        }
        this.curExp += exp;
        if(this.curExp >= this.epToNextLvl && this.lvl < 10){
            this.curExp -= this.epToNextLvl;
            this.lvl++;
            const c = Config.getHeroStatsByLvl(this.lvl);
            this.epToNextLvl = c.ep;
            this.reach = c.reach;
            this.mov = c.mov;
            this.hp = c.hp;
            this.numAttacks = c.numAttacks;
            this.dmg = c.dmg;
            this.def = c.def;
            this.reg = c.reg;
            this.mobility = c.mobility;
            this.respawnTime = c.respawnTime;
            this.heal(2);
        }

    }

    heal(amount){
        this.totalHp = Math.min(this.hp, this.totalHp + amount);
    }

    reviveAt(freeTile){
        this.alive = true;
        this.totalHp = this.hp;
        this.setTile(freeTile);
    }

    takeDmg(amount) {
        this.totalHp -= amount;
        if (this.totalHp <= 0 && this.alive) {
            console.log(`${this.player.id} ${this.type} has died.`)
            this.alive = false;
            this.curExp = 0;
            this.onHeroDeath(this);
            return false;
        }
        return this.alive;
    }

    getMovementLeftThisRound() {
        return this.mov -this.movedThisTurn;
    }

    cantMoveAnymore() {
        return this.movedThisTurn >= this.mov;
    }

    cantAttackAnymore() {
        return this.attacksThisTurn >= this.numAttacks;
    }

    attack(enemyUnit, revenge = false) {
        if(this.cantAttackAnymore()) {
            return 0;
        }

        console.log("Start attack! revenge:", revenge, this.player.id, enemyUnit.player.id);
        // check if its in range
        const distance = Map.dist(this.tile, enemyUnit.tile);
        if (this.reach < distance) {
            return 0;
        }

        // has to attack unit on same field if not alone
        if (this.reach > 0 && this.tile.units.length > 1 && this.tile !== enemyUnit.tile) {
            return 0;
        }

        // we are in range
        this.attacksThisTurn += 1;
        let hits = 0;
        const prevNum = enemyUnit.num;
        for (let i = 0; i < this.num; i++) {
            const diceRoll = Game.throwDice();
            const successBelow = this.dmg - enemyUnit.def + 1;
            if (diceRoll < successBelow) {
                hits++;
                enemyUnit.takeDmg(1);
            }
        }
        const numEnemiesDied = prevNum - enemyUnit.num;
        if (numEnemiesDied > 0) {
            this.player.onEnemiesKilled(enemyUnit, numEnemiesDied);
            if(enemyUnit.gold){
                this.player.gold += enemyUnit.gold * numEnemiesDied;
            }
        }

        // revenge?
        let enemyHits = 0;
        if(!revenge && enemyUnit.alive && enemyUnit.revenge) {
            enemyHits = enemyUnit.attack(this, true);
        }

        if(revenge) {
            return hits;
        } else {
            return {
                [this.player.id]: hits,
                [enemyUnit.player.id]: enemyHits
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

    draw(phase, curP) {
        ctx.fillStyle = this.player.color;
        const notAlone = this.tile.units.length > 1;
        const sq = Math.ceil(Math.sqrt(this.num));
        let xOffset = 0;
        let tileSize = this.tile.l;

        if (notAlone) {
            tileSize /= 2;
            xOffset = this.player.id === "Jonas" && this.player.id !== "Jakob" ? 0 : tileSize;
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
        if(phase === 8 && !this.cantAttackAnymore() && curP.id === this.player.id) {
            add = "!"
        }
        if(phase === 5 && !this.cantMoveAnymore() && curP.id === this.player.id) {
            add = "~"
        }
        text(this.type + this.lvl + add, this.tile.x + tileSize / 2 + xOffset, this.tile.y + tileSize / 1.4, tileSize * 0.5, "white");
    }

}