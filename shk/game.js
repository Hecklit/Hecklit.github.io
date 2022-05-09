
class Game {

    constructor(
        pGold,
        startUnits,
        maxNumUnits,
        maxNumTroups,
        heroRevival,
        monsterLvls,
        mapType,
        config) {

        this.pGold = pGold;
        this.startUnits = startUnits;
        this.maxNumUnits = maxNumUnits;
        this.maxNumTroups = maxNumTroups;
        this.heroRevival = heroRevival;
        this.monsterLvls = monsterLvls;
        this.mapType = mapType;
        this.config = config;
        this.round = 0;
        this.phase = 0;
        this.movedThisRound = {};
        this.debugMarker = [100, 100];
        this.debugMode = true;
    }

    init() {
        this.map = new Map();
        this.map.generateSquareMap(15, 4, 70, this.mapType);
        this.players = [];
        this.players.push(new Player("Jonas", this.map.getTiles([[0, 2], [0, 3], [1, 2], [1, 3]])));
        this.players.push(new Player("Jakob", this.map.getTiles([[13,2], [13,3], [14,2], [14,3]])));
        this.curPi = 0;
    }

    getCurrentPlayer() {
        return this.players[this.curPi];
    }

    static defaultConfig() {
        return {
            "F": {
                cost: 2,
                reach: 0,
                mov: 2,
                hp: 1,
                numAttacks: 1,
                dmg: 5,
                def: 2,
                revenge: true,
                mobility: MobileAttackType.BthenA,
            },
            "B": {
                cost: 3,
                reach: 4,
                mov: 2,
                hp: 1,
                numAttacks: 1,
                dmg: 5,
                def: 2,
                revenge: false,
                mobility: MobileAttackType.BorA,
            },
            "K": {
                cost: 5,
                reach: 0,
                mov: 3,
                hp: 2,
                numAttacks: 1,
                dmg: 6,
                def: 3,
                revenge: true,
                mobility: MobileAttackType.BthenA,
            },

        };

    }

    startRound() {
        this.round += 1;
        this.curPi = this.round % this.players.length;
        const curP = this.players[this.curPi];
        curP.gold += this.pGold;
        this.phase = 2;
    }

    buyUnit(ut, n) {
        if(this.phase !== 2) {
            return false;
        }
        const curP = this.players[this.curPi];
        const conf = this.config[ut];
        const cost = conf.cost * n;
        const freeBaseTiles = curP.getFreeBaseTiles();
        if (curP.gold >= cost && freeBaseTiles.length > 0 ) {
            curP.buyUnit(ut, n, cost, conf.mov, conf.reach);
            this.phase = 5;
            return true;
        }else {
            console.log(curP.id + " doesn't have enough gold or space.");
        }
    }

    draw() {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 10000, 10000);
        this.map.draw();
        this.players.forEach(p => p.draw());

        this.players.forEach((p, i) => text(`${p.id} ${i === this.curPi ? "("+ this.phase + ")" : ""} Gold ${p.gold}`, 300* i + 150, this.map.tiles[0][3].y + this.map.tiles[0][3].l * 2, 40, "black"));

        if(this.phase === 5) {
            const curP = this.players[this.curPi];
            const curUnit = curP.activeUnit;
            this.map.drawOverlay(curUnit);
        }


        if(this.debugMode) {
            const size = 5;
            ctx.fillStyle = "green";
            circle(this.debugMarker[0]-size, this.debugMarker[1]-size, size);
        }

    }

    onClick(x, y) {
        if(this.phase !== 5 && this.phase !== 8) {
            return false;
        }

        const tile = this.map.getTileAtPx(x, y);
        const curP = this.players[this.curPi];
        if(tile) {

            const unitOfP = tile.units.filter(u => u.player.id === curP.id)[0];
            console.log(tile.units.map(u => u.player.id));
            if(unitOfP) {
                curP.activeUnit = unitOfP;
            } else {
                curP.activeUnit.move(tile);
            }
        }
    }


}