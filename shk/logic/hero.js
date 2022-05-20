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
        this.goldmine = undefined;
    }

    setTile(tile) {
        this.tile.units = this.tile.units.remove(this);
        tile.units.push(this);
        this.tile = tile;
        return tile;
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
        if(amount > 0 && this.goldmine){
            this.goldmine.reset();
        }
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

}