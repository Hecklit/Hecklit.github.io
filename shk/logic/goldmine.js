class Goldmine {
    constructor(tile, tier) {
        this.id = IdGen.get();
        this.tile = tile;
        this.tier = tier;
        this.player = null;
        this.roundsTillAnnexed = 2;
        this.annexProcessStarted = false;
        this.annexerUnit = null;
    }

    startOccupation(unit) {
        if((unit.num > 1 || unit.type ==="H") && unit.tile.id === this.tile.id && this.tile.units.length === 1) {
            if(unit.type === "K") {
                unit.totalHp = unit.num%unit.totalHp === 0 ? unit.totalHp -2 : unit.totalHp -1;
                unit.num -= 1;
            } else if(["F", "B"].includes(unit.type)){
                unit.totalHp -= 1;
                unit.num -= 1;
            }

            // mark unit as annexing
            this.annexerUnit = unit;
            this.roundsTillAnnexed = 2;
            this.annexProcessStarted = true;
            this.annexerUnit.goldmine = this;
        }
    }

    reset() {
        this.player = null;
        this.roundsTillAnnexed = 2;
        this.annexProcessStarted = false;
        this.annexerUnit.goldmine = undefined;
        this.annexerUnit = null;
    }

    tickRound() {
        if(this.tile.units.length > 1){
            this.reset();
            return false;
        }
        this.roundsTillAnnexed--;
        if(this.roundsTillAnnexed <= 0) {
            // annex happened
            this.annexProcessStarted = false;
            this.annexerUnit.goldmine = undefined;
            this.annexerUnit.player.goldmines.push(this);
            this.player = this.annexerUnit.player;
            this.annexerUnit = null;
        }
    }

    getGold() {
        return this.tier;
    }





}