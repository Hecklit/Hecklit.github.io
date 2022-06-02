class Player {
    constructor(id, baseTiles, color, onHeroDeath, startUnits) {

        this.id = id;
        this.gold = 0;
        this.baseTiles = baseTiles;
        this.activeBaseTile = this.getFreeBaseTiles()[0];
        this.activeUnit = null;
        this.color = color;
        this.units = [];
        this.goldmines = [];
        this.heroDeaths = 0;
        startUnits.forEach(unit => {
            if(unit.type === "H"){
                const hc = AssetManager.getHeroStatsByLvl(unit.lvl);
                console.log(this.baseTiles);
                this.hero = new Hero(this, this.getFreeBaseTiles()[0], hc.ep, hc.reach,
                    hc.mov, hc.hp, hc.numAttacks, hc.dmg, hc.def, true, hc.mobility, hc.reg, (hero) => {

                        onHeroDeath(hero);
                    }, hc.respawnTime, hc.lvl, hc.ep);
                this.turnsTillHeroRes = 0
                this.units.push(this.hero);
            }
        })
    }

    startHeroRevive(cost) {
        this.gold -= cost;
        this.turnsTillHeroRes = this.hero.respawnTime;
    }

    tryHeroRespawn(){
        if(this.turnsTillHeroRes <= 0 && this.activeBaseTile) {
            this.hero.reviveAt(this.activeBaseTile);
            this.units.push(this.hero);
        } else {
            this.turnsTillHeroRes--;
        }
    }

    onEnemiesKilled(enemyUnit, numKilled){
        if(!this.hero) {
            return;
        }
        const heroWasInReach = (this.hero.alive && Map.dist(this.hero.tile, enemyUnit.tile) <= this.hero.mov);
        if(heroWasInReach){

            const expEarned = enemyUnit.cost * numKilled;
            this.hero.gainExp(expEarned);
            console.log(this.id, " Hero earned ", expEarned, " EXP");
        }
    }

    getFreeBaseTiles() {
        return this.baseTiles.filter(b => !b.hasPlayerOnIt(this));
    }

    buyUnit(t, n, cost
        ,reach
        ,mov
        ,hp
        ,numAttacks
        ,dmg
        ,def
        ,revenge
        ,mobility) {
        this.gold -= cost;
        const newUnit = this.spawnUnit(this.activeBaseTile, t, n, cost
            ,reach
            ,mov
            ,hp
            ,numAttacks
            ,dmg
            ,def
            ,revenge
            ,mobility)
        this.activeUnit = newUnit;
        return newUnit;
    }

    spawnUnit(tile, t, n, cost
        ,reach
        ,mov
        ,hp
        ,numAttacks
        ,dmg
        ,def
        ,revenge
        ,mobility) {
        const newUnit = new Unit(this, tile, t, n, cost
            ,reach
            ,mov
            ,hp
            ,numAttacks
            ,dmg
            ,def
            ,revenge
            ,mobility);
        this.units.push(newUnit);
        return newUnit;
    }

    hasNoUnitsThatCanStillAttack(game) {
        return this.units.filter(u => !game.cantAttackAnymore(u)).length === 0
    }


}