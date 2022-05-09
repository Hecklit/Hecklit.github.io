class Player {
    constructor(id, baseTiles) {

        this.id = id;
        this.gold = 0;
        this.units = [];
        this.baseTiles = baseTiles;
        this.activeUnit = null;
    }

    getFreeBaseTiles() {
        return this.baseTiles.filter(b => !b.hasPlayerOnIt(this));
    }

    buyUnit(t, n, cost, speed, reach) {
        this.gold -= cost;
        const freeBaseTiles = this.getFreeBaseTiles();
        const newUnit = new Unit(this, freeBaseTiles[0], t, n, speed, reach);
        this.units.push(newUnit);
        this.activeUnit = newUnit;
    }

    draw() {
        this.units.forEach((u) => {
            u.draw();
        });
        if(this.activeUnit){
            this.activeUnit.drawActive();

        }

    }

}