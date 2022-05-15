class Game {

    constructor(
        pGold,
        startUnits,
        maxNumUnits,
        maxNumTroups,
        heroRevival,
        monsterLvls,
        mapType,
        config,
        unitRadioButtons,
        unitRadioLabels) {

        this.pGold = pGold;
        this.unitRadioButtons = unitRadioButtons;
        this.unitRadioLabels = unitRadioLabels;
        this.startUnits = startUnits;
        this.maxNumUnits = maxNumUnits;
        this.maxNumTroups = maxNumTroups;
        this.heroRevival = heroRevival;
        this.monsterLvls = monsterLvls;
        this.mapType = mapType;
        this.config = config;
        this.round = 0;
        this.phase = 0;
        this.winner = null;
        this.onHeroDeath = (hero) => {
            hero.player.heroDeaths++;
            console.log("onHeroDeath", hero)
            if (hero.player.heroDeaths >= this.heroRevival) {
                this.removeDeadUnits();
                this.draw();
                this.winner = this.players.filter(p => p.id !== hero.player.id)[0];
                console.log("onHeroDeath Game over! " + this.winner.id + " has won!");
            }
            this.draw();
        }
        this.debugMarker = [100, 100];
        this.debugMode = true;
        this.gameOverScreenDrawn = false;
        this.errorMessage = "";
        this.phaseToCaption = {
            2: "Rekrutierung",
            4: "Monsters",
            5: "Bewegung",
            6: "Trigger Monsters",
            8: "Angriff",
        }
    }

    init(withMonsters = true, curPi = 0) {
        this.winner = null;
        this.withMonsters = withMonsters;
        this.monsters = withMonsters ? new Player("Monsters", [], "darkgreen") : null;
        this.map = new Map();
        this.map.generateSquareMap(15, 4, 70, this.mapType, this.monsters);
        this.players = [];
        this.players.push(new Player("Jonas", this.map.getTiles([[0, 2], [0, 3], [1, 2], [1, 3]]), "red", 1, this.onHeroDeath));
        this.players.push(new Player("Jakob", this.map.getTiles([[14, 2], [14, 3], [13, 2], [13, 3]]), "blue", 1, this.onHeroDeath));
        this.curPi = curPi;
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
        if (this.winner) {
            return;
        }
        this.round += 1;
        this.curPi = (this.curPi + 1) % this.players.length;
        const curP = this.players[this.curPi];
        curP.gold += this.pGold;
        this.phase = 2;
        curP.units.forEach(u => u.movedThisTurn = 0);
        curP.units.forEach(u => u.attacksThisTurn = 0);
        if (this.withMonsters) {
            this.monsters.units.forEach(u => u.movedThisTurn = 0);
            this.monsters.units.forEach(u => u.attacksThisTurn = 0);
        }
        curP.activeBaseTile = curP.getFreeBaseTiles()[0];
    }


    async buyUnit(ut, n) {
        if (this.phase !== 2 || this.winner) {
            return false;
        }
        const curP = this.players[this.curPi];
        const freeBaseTiles = curP.getFreeBaseTiles();
        if (ut === 'None' || freeBaseTiles.length === 0) {
            this.phase = 3
            curP.hero.heal(curP.hero.reg);
            this.phase = 4;
            await this.monsterTurn(250);
            this.phase = 5;
            return true;
        }
        const conf = this.config[ut] ? this.config[ut] : curP.hero;
        const cost = conf.cost * n;
        if (curP.gold >= cost && freeBaseTiles.length > 0 && n > 0) {

            if (ut === 'H') {
                if (!curP.hero.alive) {
                    curP.startHeroRevive(cost);
                    curP.tryHeroRespawn();
                } else {
                    this.errorMessage = curP.id + " hero is not dead";
                    return false;
                }
            } else {
                const newUnit = curP.buyUnit(ut, n, cost
                    , conf.reach
                    , conf.mov
                    , conf.hp
                    , conf.numAttacks
                    , conf.dmg
                    , conf.def
                    , conf.revenge
                    , conf.mobility);
                this.phase = 3
                curP.hero.heal(curP.hero.reg);
                this.phase = 4;
                await this.monsterTurn(250);
                this.phase = 5;
                return newUnit;
            }
        } else {
            this.errorMessage = curP.id + " doesn't have enough gold or space.";
            console.log(curP.id + " doesn't have enough gold or space.");
            return false;
        }

    }

    draw() {
        if (this.winner) {
            if(this.gameOverScreenDrawn){
                return;
            }
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 0, 10000, 10000);
            ctx.textAlign = "center";
            text("Game over! " + this.winner.id + " has won!", 600, 200, 80, "white");
            this.gameOverScreenDrawn = true;
            return;
        }

        ctx.fillStyle = "lightgray";
        ctx.fillRect(0, 0, 10000, 10000);

        this.map.draw();
        this.players.forEach(p => p.draw(this.phase, this.getCurrentPlayer()));
        this.monsters?.draw(this.phase, this.getCurrentPlayer());

        ctx.textAlign = 'left';
        this.players.forEach((p, i) => text(`${p.id} Gold ${p.gold}`,
            280 * i, this.map.tiles[0][3].y + this.map.tiles[0][3].l * 1.5, 30,
            this.curPi === i ? "yellow" : "black"));
        text("Phase: " + this.phaseToCaption[this.phase], 0, this.map.tiles[0][3].y + this.map.tiles[0][3].l + 70,
            30, "black");
        ctx.textAlign = 'center';

        const curP = this.players[this.curPi];
        const curUnit = curP.activeUnit;
        if(this.phase === 2){
            curP.activeBaseTile.drawOverlay("white");
        }

        if (this.phase === 5) {
            this.map.drawOverlay(curUnit);
        }

        if (this.phase === 8) {
            this.map.drawOverlay(curUnit, true);
        }

        if (this.unitRadioButtons) {
            if (curP.hero.alive) {
                this.unitRadioLabels[this.unitRadioLabels.length - 1].innerHTML = `H`
                this.unitRadioButtons[this.unitRadioButtons.length - 1].disabled = true;
            } else {

                if (curP.turnsTillHeroRes > 0) {
                    this.unitRadioLabels[this.unitRadioLabels.length - 1].innerHTML = `H (${curP.turnsTillHeroRes} rounds)`
                    this.unitRadioButtons[this.unitRadioButtons.length - 1].disabled = true;
                } else {
                    console.log(this.unitRadioButtons[this.unitRadioButtons.length - 1]);
                    this.unitRadioLabels[this.unitRadioLabels.length - 1].innerHTML = `H (${curP.hero.cost} gold)`
                    this.unitRadioButtons[this.unitRadioButtons.length - 1].disabled = false;
                }
            }
        }

        if (this.debugMode) {
            const size = 5;
            ctx.fillStyle = "green";
            circle(this.debugMarker[0] - size, this.debugMarker[1] - size, size);
        }

    }

    async monsterTurn(sleepMillis) {
        if (!this.withMonsters || this.monsters.units.length === 0 || this.winner) {
            return;
        }
        let i = 0;
        let allDone = false;

        while (!allDone) {
            allDone = this.monsters.units.reduce((acc, cur) => {
                acc &= cur.takeTurn(this.map, i, i % 2 === 0);
                return acc;
            }, true);
            i++;
            if (i > 5) {
                console.error("While loop reached 5 iterations")
                break;
            }
            this.draw();
            await sleep(sleepMillis)
        }

        this.removeDeadUnits();
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
        if (this.phase !== 5 && this.phase !== 8  && this.phase !== 6 && this.phase !== 2 || this.winner) {
            return false;
        }

        const curP = this.players[this.curPi];
        if (tile) {
            if (this.phase === 2) {
                if(curP.getFreeBaseTiles().filter(b => b.id === tile.id).length === 1){
                    curP.activeBaseTile = tile;
                }
                return true;
            }

            if (this.phase === 5) {
                const unitOfP = tile.units.filter(u => u.player.id === curP.id)[0];
                if (unitOfP) {
                    curP.activeUnit = unitOfP;
                    console.log(curP.activeUnit)
                } else {
                    curP.activeUnit.move(tile);
                }

                if (curP.units.filter(u => !u.cantMoveAnymore()).length === 0) {
                    if(this.map.getTriggerableMonsterDen(curP).length > 0){
                        this.phase = 6;
                    }else {
                        this.phase = 8;

                        if (curP.units.filter(u => !u.cantAttackAnymore()).length === 0) {
                            this.startRound();
                        }
                    }
                }
                return true;
            }

            if (this.phase === 6) {
                const monsterDens = this.map.getTriggerableMonsterDen(curP);
                if(monsterDens.filter(d => d.id === tile.id).length === 1){
                    tile.triggerMonsterDen(this.monsters);
                }
                if(this.map.getTriggerableMonsterDen(curP).length === 0){
                    this.phase = 8;

                    if (curP.units.filter(u => !u.cantAttackAnymore()).length === 0) {
                        this.startRound();
                    }
                }
                return true;
            }

            if (this.phase === 8) {
                const fights = this.map.getPossibleFightsPerUnit(curP.activeUnit);
                const unitOfEnemy = fights.filter(f => f.tile === tile)[0];
                const unitOfPlayer = tile.getUnitOf(curP);
                if (unitOfEnemy) {
                    curP.activeUnit?.attack(unitOfEnemy);
                    this.removeDeadUnits();
                } else if (unitOfPlayer) {
                    curP.activeUnit = unitOfPlayer;
                }
                return true;
            }
        }
    }


    removeDeadUnits() {
        this.players.forEach(p => p.units = p.units.filter(u => u.alive));
        this.monsters.units = this.monsters.units.filter(u => u.alive);
        this.map.flatTiles().forEach(t => t.units = t.units.filter(u => u.alive));
    }

    static throwDice() {
        const result = Math.floor(Math.random() * 6 + 1);
        console.log("Roll a d6: ", result)
        return result;
    }


}