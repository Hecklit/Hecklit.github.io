class Player {
    constructor(id, baseTiles, color) {

        this.id = id;
        this.gold = 0;
        this.units = [];
        this.baseTiles = baseTiles;
        this.activeUnit = null;
        this.color = color;
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