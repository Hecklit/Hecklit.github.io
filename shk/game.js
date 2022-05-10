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
        this.errorMessage = "";
        this.phaseToCaption = {
            2: "Rekrutierung",
            5: "Bewegung",
            8: "Angriff",

        }
    }

    init() {
        this.map = new Map();
        this.map.generateSquareMap(15, 4, 70, this.mapType);
        this.players = [];
        this.players.push(new Player("Jonas", this.map.getTiles([[0, 2], [0, 3], [1, 2], [1, 3]]), "red"));
        this.players.push(new Player("Jakob", this.map.getTiles([[13, 2], [13, 3], [14, 2], [14, 3]]), "blue"));
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
        curP.units.forEach(u => u.movedThisTurn = 0);
    }

    buyUnit(ut, n) {
        if (this.phase !== 2) {
            return false;
        }
        const curP = this.players[this.curPi];
        const conf = this.config[ut];
        const cost = conf.cost * n;
        const freeBaseTiles = curP.getFreeBaseTiles();
        if (curP.gold >= cost && freeBaseTiles.length > 0 && n > 0) {
            const newUnit = curP.buyUnit(ut, n, cost
                , conf.reach
                , conf.mov
                , conf.hp
                , conf.numAttacks
                , conf.dmg
                , conf.def
                , conf.revenge
                , conf.mobility);
            this.phase = 5;
            return newUnit;
        } else if (freeBaseTiles.length === 0) {
            this.phase = 5;
        } else {
            this.errorMessage = curP.id + " doesn't have enough gold or space.";
            console.log(curP.id + " doesn't have enough gold or space.");
            return false;
        }
    }

    draw() {
        ctx.fillStyle = "lightgray";
        ctx.fillRect(0, 0, 10000, 10000);
        this.map.draw();
        this.players.forEach(p => p.draw());

        ctx.textAlign = 'left';
        this.players.forEach((p, i) => text(`${p.id} Gold ${p.gold}`,
            280 * i, this.map.tiles[0][3].y + this.map.tiles[0][3].l * 1.5, 30,
            this.curPi === i ? "yellow" : "black"));
        text("Phase: " + this.phaseToCaption[this.phase], 0, this.map.tiles[0][3].y + this.map.tiles[0][3].l + 70,
            30, "black");
        ctx.textAlign = 'center';

        if (this.phase === 5) {
            const curP = this.players[this.curPi];
            const curUnit = curP.activeUnit;
            this.map.drawOverlay(curUnit);
        }

        if (this.phase === 8) {
            const curP = this.players[this.curPi];
            const curUnit = curP.activeUnit;
            this.map.drawOverlay(curUnit, true);
        }


        if (this.debugMode) {
            const size = 5;
            ctx.fillStyle = "green";
            circle(this.debugMarker[0] - size, this.debugMarker[1] - size, size);
        }

    }

    onClickPxl(x, y) {
        const tile = this.map.getTileAtPx(x, y);
        this.onClick(tile);
    }

    onClickIdx(x, y) {
        const tile = this.map.tiles[x][y];
        this.onClick(tile);
    }

    onClick(tile) {
        if (this.phase !== 5 && this.phase !== 8) {
            return false;
        }

        const curP = this.players[this.curPi];
        if (tile) {

            if (this.phase === 5) {
                const unitOfP = tile.units.filter(u => u.player.id === curP.id)[0];
                if (unitOfP) {
                    curP.activeUnit = unitOfP;
                } else {
                    curP.activeUnit.move(tile);
                }
            }

            if (this.phase === 8) {
                const unitOfEnemy = tile.units.filter(u => u.player.id !== curP.id)[0];
                if (unitOfEnemy) {
                    curP.activeUnit?.attack(unitOfEnemy);
                    this.removeDeadUnits();
                }
            }
        }
    }

    removeDeadUnits() {
        this.players.forEach(p => p.units = p.units.filter(u => u.alive));
        this.map.flatTiles().forEach(t => t.units = t.units.filter(u => u.alive));
    }

    static throwDice() {
        const result = Math.floor(Math.random() * 6 + 1);
        console.log("Roll a d6: ", result)
        return result;
    }


}