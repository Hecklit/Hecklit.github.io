class Game {

    constructor(config) {
        State.i.init();
        // eventEmitters
        this.id = IdGen.get();
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

        State.a(new UpdateGameStateAction({
            config: config,
            pGold: config.pg,
            startUnits: [...config.startUnits],
            maxNumUnits: {...config.maxNumUnits},
            maxNumTroups: {...config.maxNumTroups},
            heroRevival: config.heroRevival,
            mapType: config.mapType,
            round: 0,
            phase: 0,
            winner: null,
            debugMarker: [100, 100],
            debugMode: true,
            gameOverScreenDrawn: false,
            errorMessage: "",
            phaseToCaption: {
                2: "Rekrutierung",
                4: "Alte Monsters",
                5: "Bewegung",
                6: "Trigger Monsters",
                7: "Neue Monsters",
                8: "Angriff",
                10: "Goldminen",
            }
        }));
    }

    init(withMonsters = true, curPi = 0, seed = null) {

        State.a(new UpdateGameStateAction({
            winner: null,
            withMonsters: withMonsters,
        }));
        if (withMonsters) {
            State.a(new AddMonsterToGameAction(
                new Player("Monsters", "darkgreen", null, []), this));
        }
        State.a(new AddMapToGameAction(
            new Map(this)
        ));
        const map = State.getMapByGame(this);
        const curState = State.gameState();
        const monster = State.getMonsterPlayer(this);
        map.generateSquareMap(curState.config, monster);

        State.a(new AddPlayerToGameAction(new Player("Jonas",
            "red", this.handleHeroDeath.bind(this), curState.startUnits), this));
        State.a(new AddPlayerToGameAction(new Player("Jakob",
            "blue", this.handleHeroDeath.bind(this), curState.startUnits), this));

        State.a(new UpdateGameStateAction({
            curPi: curPi,
        }));
        seed = seed === null ? Date.now() : seed;
        seedRandomNumberGenerator(seed);
        this.onInitGame.emit(withMonsters, curPi, seed);
    }

    handleHeroDeath(hero) {
        const heroPlayer = State.getPlayerByHero(hero);
        State.a(new UpdateEntityAction(heroPlayer, old => ({
            heroDeaths: old.heroDeaths + 1
        })));
        if (State.e(heroPlayer).heroDeaths >= State.gameState.heroRevival) {
            this.removeDeadUnits();
            State.a(new UpdateGameStateAction({
                winner: State.getPlayers().filter(p => p.id !== heroPlayer.id)[0],
            }));
            this.onGameOver.emit(State.e(this).winner);
            console.log("onHeroDeath Game over! " + State.e(this).winner.id + " has won!");
        }
        this.onHeroDeath.emit(hero);
    }

    get curP() {
        return State.getPlayers()[this.curPi];
    }

    startRound() {
        if (State.e(this).winner) {
            return;
        }
        this.round += 1;
        const players = State.getPlayers();
        this.curPi = (this.curPi + 1) % players.length;
        const curP = players[this.curPi];
        // player annexed any new goldmines?
        const pGoldmines = State.getUnitsByPlayer(curP)
            .filter(u => State.getGoldmineByAnnexerUnit(u));
        pGoldmines.forEach(gm => gm.tickRound());

        const goldMineGold = State.getGoldminesByPlayer(curP)
            .reduce((acc, cur) => acc + cur.getGold(), 0);

        State.a(new UpdateEntityAction(curP, old => ({
            gold: old.gold + goldMineGold
        })));

        State.a(new UpdateGameStateAction({
            phase: 2,
        }));

        State.getUnitsByPlayer(curP)
            .forEach(u => State.a(new UpdateEntityAction(u, {
                movedThisTurn: 0,
                attacksThisTurn: 0,
            })));

        if (State.gameState().withMonsters) {
            const monster = State.getMonsterPlayer(this);
            const monsters = State.getUnitsByPlayer(monster);
            monsters.forEach(u => State.a(new UpdateEntityAction(u, {
                movedThisTurn: 0,
                attacksThisTurn: 0,
            })));
        }

        const freeBaseTile = curP.getFreeBaseTiles()[0];
        if (freeBaseTile) {
            State.a(new SetActiveBaseTileAction(freeBaseTile, curP));
        }
        this.onTurnStart.emit(game.curP);
    }


    buyUnit(ut, n) {
        const gameState = State.gameState();
        if (gameState.phase !== 2 || gameState.winner) {
            return false;
        }
        console.log("Buy unit");
        const curP = game.curP;
        // stock up troup?
        let troup = State.getActiveBaseTileByPlayer(curP)?.getUnitOf(curP);
        troup = troup?.type === ut ? troup : null;
        const outOfBase = !State.getBaseTilesByPlayer(curP)
            .includes(State.getActiveBaseTileByPlayer(curP));
        console.log(troup);
        // is troup limit reached?
        const troupsOfSameType = State.getUnitsByPlayer(curP).filter(u => u.type === ut);
        const totalNumOfTroupsOfSameType = troupsOfSameType.reduce((acc, cur) => acc + cur.num, 0);
        if ((!troup && troupsOfSameType.length >= gameState.maxNumTroups[ut])
            || ((totalNumOfTroupsOfSameType + n) > gameState.maxNumUnits[ut])) {
            this.errorMessage = curP.id + " already reached the maximum for this unit type.";
            return false;
        }
        const freeBaseTiles = curP.getFreeBaseTiles();
        if (!troup && (ut === 'None' || freeBaseTiles.length === 0)) {
            return true;
        }
        const conf = AssetManager.instance.units[ut] ? AssetManager.instance.units[ut] : State.getHeroByPlayer(curP);

        const outOfBaseModifier = outOfBase ? 2 : 1;
        const cost = conf.cost * n * outOfBaseModifier;
        if (curP.gold >= cost && (freeBaseTiles.length > 0 || troup) && n > 0) {

            if (ut === 'H') {
                if (!State.getHeroByPlayer(curP).alive) {
                    curP.startHeroRevive(cost);
                    curP.tryHeroRespawn();
                } else {
                    this.errorMessage = curP.id + " hero is not dead";
                    return false;
                }
            } else if (troup) {
                State.a(new UpdateEntityAction(curP, old => ({
                    gold: old.gold - cost
                })));
                troup.recruitNewUnits(n);
                return troup;
            } else if (!State.getActiveBaseTileByPlayer(curP)?.getUnitOf(curP)) {
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
        const gameState = State.gameState();
        const monster = State.getMonsterPlayer(this);
        const monsters = State.getUnitsByPlayer(monster);
        if (!gameState.withMonsters || monsters.length === 0 || gameState.winner) {
            return;
        }
        let i = 0;
        let allDone = false;
        const map = State.getMapByGame(this);

        while (!allDone) {
            allDone = monsters.reduce((acc, cur) => {
                acc &= cur.takeTurn(map, i, i % 2 === 0, this.curP);
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
        const map = State.getMapByGame(this);
        const tile = map.getTileAtPx(x, y);
        this.onClick(tile);
    }

    onClickIdx(x, y) {
        const map = State.getMapByGame(this);
        const tile = State.getTile(map, x, y);
        this.onClick(tile);
    }

    selectMovableUnit() {
        const map = State.getMapByGame(this);
        const allUnitsThatCanStillMove = State.getUnitsByPlayer(this.curP)
            .filter(u => !map.cantMoveAnymore(u));
        if (!allUnitsThatCanStillMove.includes(State.getActiveUnitByPlayer(this.curP)) && allUnitsThatCanStillMove.length > 0) {
            State.a(new SetActiveUnitAction(allUnitsThatCanStillMove[0], this.curP));
        }
    }

    selectAttackReadyUnit() {
        const map = State.getMapByGame(this);

        const allUnitsThatCanStillAttack = State.getUnitsByPlayer(this.curP)
            .filter(u => !map.cantAttackAnymore(u));
        if (!allUnitsThatCanStillAttack.includes(State.getActiveUnitByPlayer(this.curP)) && allUnitsThatCanStillAttack.length > 0) {
            State.a(new SetActiveUnitAction(allUnitsThatCanStillAttack[0], this.curP));
        }
    }

    onClick(tile) {
        const gameState = State.gameState();
        if (![2, 5, 6, 8, 10].includes(gameState.phase) || gameState.winner) {
            return false;
        }

        this.onOnClick.emit(tile);


        const curP = this.curP;
        const map = State.getMapByGame(this);
        const monster = State.getMonsterPlayer(this);
        if (tile) {
            if (gameState.phase === 2) {
                State.a(new SetActiveBaseTileAction(tile, curP));
            } else if (gameState.phase === 5) {
                const unitOfP = State.getUnitsOnTile(tile)
                    .filter(u => State.getPlayerByUnit(u).id === curP.id)[0];
                if (unitOfP) {
                    State.a(new SetActiveUnitAction(unitOfP, curP));
                } else {
                    const activeUnit = State.getActiveUnitByPlayer(curP);
                    if (activeUnit) {
                        map.move(activeUnit, tile);
                        // did this move exhaust all movement from this unit?
                        this.selectMovableUnit();
                    }
                }
            } else if (gameState.phase === 6) {
                const monsterDens = map.getTriggerableMonsterDen(curP);
                if (monsterDens.filter(d => d.id === tile.id).length === 1) {
                    tile.triggerMonsterDen(monster, this);
                }
            } else if (gameState.phase === 8) {
                const fights = map.getPossibleFightsPerUnit(State.getActiveUnitByPlayer(curP));
                const unitOfEnemy = fights.filter(f => f.tile === tile)[0];
                const unitOfPlayer = tile.getUnitOf(curP);
                if (unitOfEnemy) {
                    map.fight(curP.activeUnit, unitOfEnemy);
                    this.removeDeadUnits();
                } else if (unitOfPlayer) {
                    State.a(new SetActiveUnitAction(unitOfPlayer, curP));
                }
            } else if (gameState.phase === 10) {
                const possibleGoldmines = map.getPossibleAnnexedGoldminesPerPlayer(curP);
                if (possibleGoldmines.filter(g => g.id === tile.id).length === 1) {
                    const goldmineTile = possibleGoldmines[0];
                    State.getGoldmineByTile(goldmineTile).startOccupation(State.getUnitsOnTile(goldmineTile)[0]);
                }
            }

            this.onClickFinished.emit();
            this.tryFastForward();
        }
    }

    tryFastForward(unitType = null, numUnits = null) {
        const gameState = State.gameState();
        const map = State.getMapByGame(this);
        let goToNextStep = false;
        if (gameState.phase === 2 && unitType !== null && numUnits !== null) {
            goToNextStep = true;
        } else if (gameState.phase === 4) {
            goToNextStep = true;
        } else if (gameState.phase === 5) {
            if (State.getUnitsByPlayer(this.curP).filter(u => !map.cantMoveAnymore(u)).length === 0) {
                goToNextStep = true;
            }
        } else if (gameState.phase === 6) {
            if (map.getTriggerableMonsterDen(this.curP).length === 0) {
                goToNextStep = true;
            }
        } else if (gameState.phase === 7) {
            goToNextStep = true;
        } else if (gameState.phase === 8) {
            if (this.curP.hasNoUnitsThatCanStillAttack(this)) {
                goToNextStep = true;
            } else {
                this.selectAttackReadyUnit();
            }
        } else if (gameState.phase === 10) {
            if (map.getPossibleAnnexedGoldminesPerPlayer(this.curP).length === 0) {
                goToNextStep = true;
            }
        }

        if (goToNextStep) {
            this.takeNextStep(unitType, numUnits);
        }
    }

    takeNextStep(unitType = null, numUnits = null, fastForward = true, calledByPlayer = false) {
        const gameState = State.gameState();
        const map = State.getMapByGame(this);
        this.onTakeNextStep.emit(unitType, numUnits, fastForward, calledByPlayer);
        let newUnit = null;
        let error = false;
        if (gameState.phase === 10) {
            this.onTurnFinish.emit();
            this.startRound();
        } else if (gameState.phase === 8) {
            const meeleFights = map.getPossibleForcedFightsPerPlayer(this.curP);
            if (meeleFights.length === 0) {
                State.a(new UpdateGameStateAction({
                    phase: 10
                }));
            } else {
                this.errorMessage = `${this.curP.id} still has melee fights left.`
                error = true;
            }
        } else if (gameState.phase === 7) {
            this.monsterTurn();
            State.a(new UpdateGameStateAction({
                phase: 8
            }));
        } else if (gameState.phase === 6) {
            State.a(new UpdateGameStateAction({
                phase: 7
            }));
            this.monsterTurn();
            this.selectAttackReadyUnit();
            State.a(new UpdateGameStateAction({
                phase: 8
            }));
        } else if (gameState.phase === 5) {
            if (map.getTriggerableMonsterDen(this.curP).length > 0) {
                State.a(new UpdateGameStateAction({
                    phase: 6
                }));
            } else {
                State.a(new UpdateGameStateAction({
                    phase: 7
                }));
            }
        } else if (gameState.phase === 4) {
            this.monsterTurn();
            this.selectMovableUnit();
            State.a(new UpdateGameStateAction({
                phase: 5
            }));
        } else if (gameState.phase === 2) {
            newUnit = this.buyUnit(unitType, numUnits);
            if (!newUnit) {
                error = true;
            } else {
                State.a(new UpdateGameStateAction({
                    phase: 4
                }));
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


    spawnUnit(xi, yi, n, type, pl) {
        const map = State.getMapByGame(this);
        const ut = map.getTile(xi, yi);
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
        const map = State.getMapByGame(this);
        State.getPlayers().forEach(p => State.getUnitsByPlayer(p).forEach(u => {
            if(!u.alive) {
                State.a(new RemoveUnitFromPlayerAction(u, p));
            }
        }));
        map.flatTiles().forEach(t => State.getUnitsOnTile(t).forEach(u => {
            if(!u.alive) {
                State.a(new RemoveUnitFromTileAction(u, t));
            }
        }));
        const monster = State.getMonsterPlayer(this);
        if (monster) {
            State.getUnitsByPlayer(monster).forEach(u => {
                if(!u.alive) {
                    State.a(new RemoveUnitFromPlayerAction(u, monster));
                }
            });
        }
    }

    static throwDice() {
        const result = Math.floor(Math.GameRandom() * 6 + 1);
        console.log("Roll a d6: ", result)
        return result;
    }


}