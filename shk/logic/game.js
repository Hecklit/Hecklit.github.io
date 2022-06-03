class Game {

    constructor(config) {

        console.log("A1", config);

        // eventEmitters
        this.onHeroDeath = new EventEmitter();
        this.onTurnFinish = new EventEmitter();
        this.onTurnStart = new EventEmitter();
        this.onStepFinish = new EventEmitter();
        this.onAttack = new EventEmitter();
        this.onGameOver = new EventEmitter();
        this.onMonsterStep = new EventEmitter();
        this.onError = new EventEmitter();
        this.onClickFinished = new EventEmitter();
        this.onInitGame = new EventEmitter();
        this.onTakeNextStep = new EventEmitter();
        this.onOnClick = new EventEmitter();

        this.fights = [];
        this.config = config;
        this.pGold = config.pg;
        this.startUnits = [...config.startUnits];
        this.maxNumUnits = {...config.maxNumUnits};
        this.maxNumTroups = {...config.maxNumTroups};
        this.heroRevival = config.heroRevival;
        this.mapType = config.mapType;
        this.round = 0;
        console.log("Entering phase ", 0)
        this.phase = 0;
        this.winner = null;
        this.debugMarker = [100, 100];
        this.debugMode = true;
        this.gameOverScreenDrawn = false;
        this.errorMessage = "";
        this.phaseToCaption = {
            2: "Rekrutierung",
            4: "Alte Monsters",
            5: "Bewegung",
            6: "Trigger Monsters",
            7: "Neue Monsters",
            8: "Angriff",
            10: "Goldminen",
        }
    }

    init(withMonsters = true, curPi = 0, seed = null) {
        this.winner = null;
        this.withMonsters = withMonsters;
        this.monsters = withMonsters ? new Player("Monsters", [], "darkgreen", null, []) : null;
        this.map = new Map(this);
        this.map.generateSquareMap(this.config, this.monsters);
        this.players = [];
        this.players.push(new Player("Jonas",
            this.map.baseTiles[0],
            "red", this.handleHeroDeath.bind(this), this.startUnits));
        this.players.push(new Player("Jakob",
            this.map.baseTiles[1],
            "blue", this.handleHeroDeath.bind(this), this.startUnits));
        this.curPi = curPi;
        seed = seed === null ? Date.now() : seed;
        seedRandomNumberGenerator(seed);
        this.onInitGame.emit(withMonsters, curPi, seed);
    }

    handleHeroDeath(hero) {
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
        console.log("Entering phase ", 2)
        this.phase = 2;
        curP.units.forEach(u => u.movedThisTurn = 0);
        curP.units.forEach(u => u.attacksThisTurn = 0);
        if (this.withMonsters) {
            this.monsters.units.forEach(u => u.movedThisTurn = 0);
            this.monsters.units.forEach(u => u.attacksThisTurn = 0);
        }
        curP.activeBaseTile = curP.getFreeBaseTiles()[0];
        this.onTurnStart.emit(game.curP);
    }


    buyUnit(ut, n) {
        if (this.phase !== 2 || this.winner) {
            return false;
        }
        console.log("Buy unit");
        const curP = this.players[this.curPi];
        // stock up troup?
        let troup = curP.activeBaseTile?.getUnitOf(curP);
        troup = troup?.type === ut ? troup : null;
        const outOfBase = !curP.baseTiles.includes(curP.activeBaseTile);
        console.log(troup);
        // is troup limit reached?
        const troupsOfSameType = curP.units.filter(u => u.type === ut);
        const totalNumOfTroupsOfSameType = troupsOfSameType.reduce((acc, cur) => acc + cur.num, 0);
        console.log("TestNow", ut, troupsOfSameType.length, this.maxNumTroups[ut]);
        // console.log("TestNow", ut, troupsOfSameType.length, totalNumOfTroupsOfSameType, this.maxNumTroups[ut], ((!troup && troupsOfSameType.length >= this.maxNumTroups[ut])
        //     || ((totalNumOfTroupsOfSameType + n) > this.maxNumUnits[ut])))
        if ((!troup && troupsOfSameType.length >= this.maxNumTroups[ut])
            || ((totalNumOfTroupsOfSameType + n) > this.maxNumUnits[ut])) {
            this.errorMessage = curP.id + " already reached the maximum for this unit type.";
            return false;
        }
        const freeBaseTiles = curP.getFreeBaseTiles();
        if (!troup && (ut === 'None' || freeBaseTiles.length === 0)) {
            return true;
        }
        const conf = AssetManager.instance.units[ut] ? AssetManager.instance.units[ut] : curP.hero;

        console.log("conf", conf, AssetManager.instance.units)
        const outOfBaseModifier = outOfBase ? 2 : 1;
        const cost = conf.cost * n * outOfBaseModifier;
        if (curP.gold >= cost && (freeBaseTiles.length > 0 || troup) && n > 0) {

            if (ut === 'H') {
                if (!curP.hero.alive) {
                    curP.startHeroRevive(cost);
                    curP.tryHeroRespawn();
                } else {
                    this.errorMessage = curP.id + " hero is not dead";
                    return false;
                }
            } else if (troup) {
                curP.gold -= cost;
                troup.recruitNewUnits(n);
                return troup;
            } else if (!curP.activeBaseTile?.getUnitOf(curP)) {
                return curP.buyUnit(ut, n, cost
                    , conf.reach
                    , conf.mov
                    , conf.hp
                    , conf.numAttacks
                    , conf.dmg
                    , conf.def
                    , conf.revenge
                    , conf.mobility);
            } else {
                this.errorMessage = curP.id + " has already a troup of different type on this tile.";
                console.log(curP.id + " has already a troup of different type on this tile.");
                return false;
            }
        } else {
            this.errorMessage = curP.id + " doesn't have enough gold or space.";
            console.log(curP.id + " doesn't have enough gold or space. Trying to spend " + cost + " but has " + curP.gold);
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
                acc &= cur.takeTurn(this.map, i, i % 2 === 0, this.curP);
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

    selectMovableUnit() {
        const allUnitsThatCanStillMove = this.curP.units.filter(u => !this.cantMoveAnymore(u));
        if (!allUnitsThatCanStillMove.includes(this.curP.activeUnit) && allUnitsThatCanStillMove.length > 0) {
            this.curP.activeUnit = allUnitsThatCanStillMove[0];
        }
    }

    selectAttackReadyUnit() {
        const allUnitsThatCanStillAttack = this.curP.units.filter(u => !this.cantAttackAnymore(u));
        if (!allUnitsThatCanStillAttack.includes(this.curP.activeUnit) && allUnitsThatCanStillAttack.length > 0) {
            this.curP.activeUnit = allUnitsThatCanStillAttack[0];
        }
    }

    onClick(tile) {
        if (![2, 5, 6, 8, 10].includes(this.phase) || this.winner) {
            return false;
        }

        this.onOnClick.emit(tile);

        const curP = this.players[this.curPi];
        if (tile) {
            if (this.phase === 2) {
                curP.activeBaseTile = tile;
            } else if (this.phase === 5) {
                const unitOfP = tile.units.filter(u => u.player.id === curP.id)[0];
                if (unitOfP) {
                    curP.activeUnit = unitOfP;
                } else {
                    if (curP.activeUnit) {
                        this.move(curP.activeUnit, tile);
                        // did this move exhaust all movement from this unit?
                        this.selectMovableUnit();
                    }
                }
            } else if (this.phase === 6) {
                const monsterDens = this.map.getTriggerableMonsterDen(curP);
                if (monsterDens.filter(d => d.id === tile.id).length === 1) {
                    tile.triggerMonsterDen(this.monsters, this);
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
            this.tryFastForward();
        }
    }

    tryFastForward(unitType = null, numUnits = null) {
        console.log("try Fast Forward", this.phase)
        let goToNextStep = false;
        if (this.phase === 2 && unitType !== null && numUnits !== null) {
            goToNextStep = true;
        } else if (this.phase === 4) {
            goToNextStep = true;
        } else if (this.phase === 5) {
            if (this.curP.units.filter(u => !this.cantMoveAnymore(u)).length === 0) {
                goToNextStep = true;
            }
        } else if (this.phase === 6) {
            if (this.map.getTriggerableMonsterDen(this.curP).length === 0) {
                goToNextStep = true;
            }
        } else if (this.phase === 7) {
            goToNextStep = true;
        } else if (this.phase === 8) {
            console.log("Fast forward phase 8 hasNoUnitsThatCanStillAttack", this.curP.hasNoUnitsThatCanStillAttack(this), this.curP.units)
            if (this.curP.hasNoUnitsThatCanStillAttack(this)) {
                goToNextStep = true;
            } else {
                this.selectAttackReadyUnit();
            }
        } else if (this.phase === 10) {
            if (this.map.getPossibleAnnexedGoldminesPerPlayer(this.curP).length === 0) {
                goToNextStep = true;
            }
        }

        if (goToNextStep) {
            this.takeNextStep(unitType, numUnits);
        }
    }

    takeNextStep(unitType = null, numUnits = null, fastForward = true, calledByPlayer = false) {
        console.log("onNext", this.phase);
        this.onTakeNextStep.emit(unitType, numUnits, fastForward, calledByPlayer);
        let newUnit = null;
        let error = false;
        if (this.phase === 10) {
            this.onTurnFinish.emit();
            this.startRound();
        } else if (this.phase === 8) {
            const meeleFights = this.map.getPossibleForcedFightsPerPlayer(this.curP);
            if (meeleFights.length === 0) {
                console.log("Entering phase ", 10)
                this.phase = 10;
            } else {
                this.errorMessage = `${this.curP.id} still has melee fights left.`
                error = true;
            }
        } else if (this.phase === 7) {
            this.monsterTurn();
            console.log("Entering phase ", 8)
            this.phase = 8;
        } else if (this.phase === 6) {
            console.log("Entering phase ", 7)
            this.phase = 7;
            this.monsterTurn();
            this.selectAttackReadyUnit();
            this.phase = 8;
        } else if (this.phase === 5) {
            if (this.map.getTriggerableMonsterDen(this.curP).length > 0) {
                console.log("Entering phase ", 6)
                this.phase = 6;
            } else {
                console.log("Entering phase ", 8)
                this.phase = 7;
            }
        } else if (this.phase === 4) {
            this.monsterTurn();
            this.selectMovableUnit();
            this.phase = 5;
        } else if (this.phase === 2) {
            newUnit = this.buyUnit(unitType, numUnits);
            if (!newUnit) {
                error = true;
            } else {
                this.phase = 4;

            }
        }
        if (!error) {
            this.onStepFinish.emit();
            if (fastForward) {
                this.tryFastForward();
            }
        } else {
            this.onError.emit(this.errorMessage);
        }
        return newUnit;
    }

    move(unit, tile) {
        const validTiles = this.map.getPossibleMovementPerUnit(unit);
        const onlyTiles = validTiles.map(o => o.t);
        const d = Map.dist(unit.tile, tile);
        if (onlyTiles.includes(tile) && !tile.getUnitOf(unit.player)) {
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


    cantMoveAnymore(unit) {
        const possibleMovements = unit.tile.map.getPossibleMovementPerUnit(unit);
        if (possibleMovements.length === 0) {
            return true;
        }
        return unit.movedThisTurn >= unit.mov;
    }

    cantAttackAnymore(unit) {
        if (unit.mobility === MobileAttackType.BorA && unit.movedThisTurn > 0) {
            return true;
        }
        const possibleFights = unit.tile.map.getPossibleFightsPerUnit(unit);
        if (possibleFights.length === 0) {
            return true;
        }
        return unit.attacksThisTurn >= 1;
    }

    moveInDirection(unit, start, end) {
        let [targetTile, pref] = this.map.lerp(start, end, unit.mov);
        if (pref && targetTile.getEnemy(unit.player)) {
            [targetTile] = this.map.lerp(start, end, unit.mov, pref === "X" ? 'Y' : 'X');
        }
        return this.move(unit, targetTile);
    }

    fight(attacker, defender) {
        const prevDefNum = defender.num;
        const prevDefTotalHp = defender.totalHp;
        const prevAttackerNum = attacker.num;
        const prevAttackerTotalHp = attacker.totalHp;
        const attackerRolls = this.attack(attacker, defender);
        let defenderRolls = [];
        if (defender.alive && defender.revenge && attackerRolls.length > 0) {
            defenderRolls = this.attack(defender, attacker, true);
        }

        this.fights.push({
            attacker, defender, attackerRolls, defenderRolls,
            prevDefNum, prevDefTotalHp, prevAttackerNum, prevAttackerTotalHp
        });
        console.log("onAttack", {
            attacker, defender, attackerRolls, defenderRolls,
            prevDefNum, prevDefTotalHp, prevAttackerNum, prevAttackerTotalHp
        });
        this.onAttack.emit(attacker, defender, attackerRolls, defenderRolls,
            prevDefNum, prevDefTotalHp, prevAttackerNum, prevAttackerTotalHp);
        return {
            attacker, defender, attackerRolls, defenderRolls,
            prevDefNum, prevDefTotalHp, prevAttackerNum, prevAttackerTotalHp
        }
    }

    attack(attacker, defender, revenge = false) {
        if (this.cantAttackAnymore(attacker) && !revenge) {
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
        if (!revenge) {
            attacker.attacksThisTurn += 1;
        }
        let rolls = [];
        const prevNum = defender.num;
        for (let i = 0; i < attacker.num * attacker.numAttacks; i++) {
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
        const conf = AssetManager.instance.units[type];
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
        this.map.flatTiles().forEach(t => t.units = t.units.filter(u => u.alive));
        if (this.monsters) {
            this.monsters.units = this.monsters.units.filter(u => u.alive);
        }
    }

    static throwDice() {
        const result = Math.floor(Math.GameRandom() * 6 + 1);
        console.log("Roll a d6: ", result)
        return result;
    }


}