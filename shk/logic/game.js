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

        // eventEmitters
        this.onHeroDeath = new EventEmitter();
        this.onTurnFinish = new EventEmitter();
        this.onStepFinish = new EventEmitter();
        this.onAttack = new EventEmitter();
        this.onGameOver = new EventEmitter();
        this.onMonsterStep = new EventEmitter();
        this.onError = new EventEmitter();
        this.onClickFinished = new EventEmitter();

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
        this.handleHeroDeath = (hero) => {
            hero.player.heroDeaths++;
            console.log("onHeroDeath", hero)
            if (hero.player.heroDeaths >= this.heroRevival) {
                this.removeDeadUnits();
                this.winner = this.players.filter(p => p.id !== hero.player.id)[0];
                this.onGameOver.emit(this.winner);
                console.log("onHeroDeath Game over! " + this.winner.id + " has won!");
            }
            this.onHeroDeath.emit(hero);
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
            10: "Goldminen",
        }
    }

    init(withMonsters = true, curPi = 0) {
        this.winner = null;
        this.withMonsters = withMonsters;
        this.monsters = withMonsters ? new Player("Monsters", [], "darkgreen") : null;
        this.map = new Map();
        this.map.generateSquareMap(15, 4, this.mapType, this.monsters);
        this.players = [];
        this.players.push(new Player("Jonas", this.map.getTiles([[0, 2], [0, 3], [1, 2], [1, 3]]), "red", 1, this.handleHeroDeath));
        this.players.push(new Player("Jakob", this.map.getTiles([[14, 2], [14, 3], [13, 2], [13, 3]]), "blue", 1, this.handleHeroDeath));
        this.curPi = curPi;
    }

    get curP() {
        return this.players[this.curPi];
    }

    startRound() {
        if (this.winner) {
            return;
        }
        this.round += 1;
        this.curPi = (this.curPi + 1) % this.players.length;
        const curP = this.players[this.curPi];
        // player annexed any new goldmines?
        const pGoldmines = curP.units.filter(u => u.goldmine).map(t => t.goldmine);
        pGoldmines.forEach(gm => gm.tickRound());

        const goldMineGold = curP.goldmines.reduce((acc, cur) => acc + cur.getGold(), 0);

        curP.gold += this.pGold + goldMineGold;
        this.phase = 2;
        curP.units.forEach(u => u.movedThisTurn = 0);
        curP.units.forEach(u => u.attacksThisTurn = 0);
        if (this.withMonsters) {
            this.monsters.units.forEach(u => u.movedThisTurn = 0);
            this.monsters.units.forEach(u => u.attacksThisTurn = 0);
        }
        curP.activeBaseTile = curP.getFreeBaseTiles()[0];
    }


    buyUnit(ut, n) {
        if (this.phase !== 2 || this.winner) {
            return false;
        }
        // is troup limit reached?
        const curP = this.players[this.curPi];
        const troupsOfSameType = curP.units.filter(u => u.type === ut);
        const totalNumOfTroupsOfSameType = troupsOfSameType.reduce((acc, cur) => acc + cur.num, 0);
        if (troupsOfSameType.length >= this.maxNumTroups[ut]
            || totalNumOfTroupsOfSameType >= this.maxNumUnits[ut]) {
            this.errorMessage = curP.id + " already reached the maximum for this unit type.";
            return false;
        }
        const freeBaseTiles = curP.getFreeBaseTiles();
        if (ut === 'None' || freeBaseTiles.length === 0) {
            this.phase = 3
            curP.hero.heal(curP.hero.reg);
            this.phase = 4;
            this.monsterTurn(250);
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
                this.monsterTurn(250);
                this.phase = 5;
                return newUnit;
            }
        } else {
            this.errorMessage = curP.id + " doesn't have enough gold or space.";
            console.log(curP.id + " doesn't have enough gold or space.");
            return false;
        }

    }


    monsterTurn() {
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
            this.onMonsterStep.emit();
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
        if (![2, 5, 6, 8, 10].includes(this.phase) || this.winner) {
            return false;
        }

        const curP = this.players[this.curPi];
        if (tile) {
            if (this.phase === 2) {
                if (curP.getFreeBaseTiles().filter(b => b.id === tile.id).length === 1) {
                    curP.activeBaseTile = tile;
                }
            } else if (this.phase === 5) {
                const unitOfP = tile.units.filter(u => u.player.id === curP.id)[0];
                if (unitOfP) {
                    curP.activeUnit = unitOfP;
                } else {
                    this.move(curP.activeUnit, tile);
                }

                if (curP.units.filter(u => !u.cantMoveAnymore()).length === 0) {
                    if (this.map.getTriggerableMonsterDen(curP).length > 0) {
                        this.phase = 6;
                    } else {
                        this.phase = 8;

                        if (curP.units.filter(u => !u.cantAttackAnymore()).length === 0) {
                            this.startRound();
                        }
                    }
                }
            } else if (this.phase === 6) {
                const monsterDens = this.map.getTriggerableMonsterDen(curP);
                if (monsterDens.filter(d => d.id === tile.id).length === 1) {
                    tile.triggerMonsterDen(this.monsters, this);
                }
                if (this.map.getTriggerableMonsterDen(curP).length === 0) {
                    this.phase = 8;

                    if (curP.units.filter(u => !u.cantAttackAnymore()).length === 0) {
                        this.startRound();
                    }
                }
            } else if (this.phase === 8) {
                const fights = this.map.getPossibleFightsPerUnit(curP.activeUnit);
                const unitOfEnemy = fights.filter(f => f.tile === tile)[0];
                const unitOfPlayer = tile.getUnitOf(curP);
                if (unitOfEnemy) {
                    this.fight(curP.activeUnit, unitOfEnemy);
                    this.removeDeadUnits();
                } else if (unitOfPlayer) {
                    curP.activeUnit = unitOfPlayer;
                }
            } else if (this.phase === 10) {
                const possibleGoldmines = this.map.getPossibleAnnexedGoldminesPerPlayer(curP);
                console.log(possibleGoldmines);
                if (possibleGoldmines.filter(g => g.id === tile.id).length === 1) {
                    const goldmineTile = possibleGoldmines[0];
                    goldmineTile.goldmine.startOccupation(goldmineTile.units[0]);
                }
            }

            this.onClickFinished.emit();
        }
    }

    takeNextStep() {
        console.log("onNext", this.phase);
        let error = false;
        if (this.phase === 10) {
            this.onTurnFinish.emit();
            this.startRound();
        } else if (this.phase === 8) {
            this.phase = 10;
        } else if (this.phase === 5) {
            if (this.map.getTriggerableMonsterDen(this.curP).length > 0) {
                this.phase = 6;
            } else {
                this.phase = 8;

                if (this.curP.units.filter(u => !u.cantAttackAnymore()).length === 0) {
                    this.startRound();
                }
            }
        } else if (this.phase === 2) {
            const getSelectedValue = document.querySelector(
                'input[name="age"]:checked');
            const numUnit = document.querySelector(
                'input[name="numUnit"]');

            const newUnit = this.buyUnit(getSelectedValue.value, numUnit.value);
            if (!newUnit) {
                this.onError.emit(this.errorMessage);
                error = true;
            }
        }
        if (!error) {
            this.onStepFinish.emit();
        }
    }

    move(unit, tile) {
        const d = Map.dist(unit.tile, tile);
        if (unit.mov >= d && unit.movedThisTurn + d <= unit.mov) {
            if (unit.goldmine) {
                unit.goldmine.reset();
            }

            unit.movedThisTurn += d;
            unit.tile.units = unit.tile.units.remove(unit);
            tile.units.push(unit);
            unit.tile = tile;
            return tile;
        }
    }

    moveIdx(unit, ix, iy) {
        const neighbour = unit.tile.getNeighbour(ix, iy);
        if (neighbour) {
            return this.move(unit, neighbour);
        }
    }

    moveInDirection(unit, start, end) {
        const targetTile = this.map.lerp(start, end, unit.mov);
        return this.move(unit, targetTile);
    }


    fight(attacker, defender) {
        const prevNum = defender.num;
        const attackerRolls = this.attack(attacker, defender);
        let defenderRolls = null;
        if (defender.alive && defender.revenge) {
            defenderRolls = this.attack(attacker, defender);
        }

        this.onAttack.emit(attacker, defender, prevNum, attackerRolls, defenderRolls);
        return {
            [attacker.player.id]: attackerRolls.filter(r => r.h).length,
            [defender.player.id]: defenderRolls ? defenderRolls.filter(r => r.h).length : 0,
        }
    }

    attack(attacker, defender) {
        if (attacker.cantAttackAnymore()) {
            return [];
        }

        // check if its in range
        const distance = Map.dist(attacker.tile, defender.tile);
        if (attacker.reach < distance) {
            return [];
        }

        // has to attack unit on same field if not alone
        if (attacker.reach > 0 && attacker.tile.units.length > 1 && attacker.tile !== defender.tile) {
            return [];
        }

        // we are in range
        attacker.attacksThisTurn += 1;
        let rolls = [];
        const prevNum = defender.num;
        for (let i = 0; i < attacker.num; i++) {
            const diceRoll = Game.throwDice();
            const successBelow = attacker.dmg - defender.def + 1;
            if (diceRoll < successBelow) {
                defender.takeDmg(1);
            }
            rolls.push({
                n: diceRoll,
                h: diceRoll < successBelow,
            });
        }
        const numEnemiesDied = prevNum - defender.num;
        if (numEnemiesDied > 0) {
            attacker.player.onEnemiesKilled(defender, numEnemiesDied);
            if (defender.gold) {
                attacker.player.gold += defender.gold * numEnemiesDied;
            }
        }

        return rolls;
    }

    spawnUnit(xi, yi, n, type, pl) {
        const ut = this.map.getTile(xi, yi);
        const conf = Config.unitConfig[type];
        return pl.spawnUnit(ut, type, n, 0
            , conf.reach
            , conf.mov
            , conf.hp
            , conf.numAttacks
            , conf.dmg
            , conf.def
            , conf.revenge
            , conf.mobility);
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