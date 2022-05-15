class Player {
    constructor(id, baseTiles, color, heroLvl, onHeroDeath) {

        this.id = id;
        this.gold = 0;
        this.baseTiles = baseTiles;
        this.activeUnit = null;
        this.color = color;
        this.units = [];
        this.heroDeaths = 0;
        if(heroLvl > 0){
            const hc = Config.getHeroStatsByLvl(heroLvl);
            console.log(hc);
            this.hero = new Hero(this, this.getFreeBaseTiles()[0], hc.ep, hc.reach,
                hc.mov, hc.hp, hc.numAttacks, hc.dmg, hc.def, true, hc.mobility, hc.reg, (hero) => {

                    onHeroDeath(hero);
                }, hc.respawnTime);
            this.turnsTillHeroRes = 0
            this.units.push(this.hero);
        }
    }

    startHeroRevive(cost) {
        this.gold -= cost;
        this.turnsTillHeroRes = this.hero.respawnTime;
    }

    tryHeroRespawn(){
        const freeTile = this.getFreeBaseTiles()[0];
        if(this.turnsTillHeroRes <= 0 && freeTile) {
            this.hero.alive = true;
            this.hero.totalHp = this.hero.hp;
            this.hero.setTile(freeTile);
            this.units.push(this.hero);
        } else {
            this.turnsTillHeroRes--;
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
        const freeBaseTiles = this.getFreeBaseTiles();
        const newUnit = new Unit(this, freeBaseTiles[0], t, n, cost
            ,reach
            ,mov
            ,hp
            ,numAttacks
            ,dmg
            ,def
            ,revenge
            ,mobility);
        this.units.push(newUnit);
        this.activeUnit = newUnit;
        return newUnit;
    }

    draw(phase, cP) {
        this.units.forEach((u) => {
            u.draw(phase, cP);
        });
        if(this.activeUnit){
            this.activeUnit.drawActive();
        }
    }

}