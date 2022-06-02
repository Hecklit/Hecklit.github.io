addEventListener('load', async function () {
    await AssetManager.instance.loadAllData();
    const canvas = document.getElementById("can");
    canvas.width = 1200;
    canvas.height = 360;
    const drawEngine = new DrawEngine(canvas);
    Fightvis.configureDrawEngine(drawEngine);
    seedRandomNumberGenerator(42);

    function getDefaultGame(mapType = MapType.FixMini) {
        console.log(AssetManager.instance.mapData)
        return new Game(
            mapType === MapType.FixMini ? AssetManager.instance.mapData['FixMini'] : AssetManager.instance.mapData['Empty']
        );
    }

    function assertEquals(a, b, msg="") {
        if (a !== b) {
            throw `${a} !== ${b}, ${msg}`;
        } else {
            console.log(`${a} === ${b}`, msg)
        }
    }

    console.log("Playing integration Game tests:");
    (() => {
        console.log("testGameFastForwardsToTheCorrectPhases");
        const game = getDefaultGame(MapType.FixMini);
        game.init(true,0, 42);
        // console.log("check that random gen is seeded");
        assertEquals(Math.GameRandom(), 0.6011037519201636  );
        assertEquals(Math.GameRandom(), 0.44829055899754167  );
        assertEquals(Math.GameRandom(), 0.8524657934904099 );
        assertEquals(Math.GameRandom(),   0.6697340414393693 );
        game.startRound();
        // fist Player turn
        const firstPlayer = game.curP;
        firstPlayer.gold += 3;
        game.onClickIdx(13, 2)
        game.takeNextStep('B', 2);
        drawEngine.draw(game);
        assertEquals(game.phase, 5, "Successfully moved to Movement Phase");
        game.onClickIdx(12, 1)
        game.takeNextStep();

        // second Player turn
        drawEngine.draw(game);
        const secondPlayer = game.curP;
        assertEquals(game.phase, 2, "");
        assertEquals(secondPlayer.id !== firstPlayer.id, true);
        game.onClickIdx(1, 2);
        game.takeNextStep('K', 1);

        assertEquals(game.phase, 5, "");
        game.onClickIdx(2, 0);
        assertEquals(game.map.getTile(2, 0).units[0].type, "K", "Knight moved to clicked Tile");
        // move Hero
        game.onClickIdx(2, 1);
        assertEquals(game.map.getTile(2, 1).units[0].type, "H", "Hero moved to clicked Tile");
        assertEquals(game.phase, 6, "Game is now on phase Trigger Monster");

        // trigger Monsters
        game.onClickIdx(2, 0);
        let lastFight = game.fights.last();
        assertEquals(lastFight.attackerRolls.length, 4, "Goblins Attack");
        assertEquals(lastFight.defenderRolls.length, 1, "Knight Attacks back");
        assertEquals(lastFight.prevAttackerTotalHp, 4 );
        assertEquals(lastFight.attacker.totalHp, 4 );
        assertEquals(lastFight.prevDefTotalHp, 2 );
        console.log(lastFight);
        drawEngine.draw(game);
        assertEquals(lastFight.defender.totalHp, 2, "Knight was not hit" );

        assertEquals(game.phase, 8, "now it should be my turn to attack");
        assertEquals(game.curP.activeUnit.type, "K", "Knight should be automatically selected");

        game.onClickIdx(2, 0);
        lastFight = game.fights.last();
        assertEquals(lastFight.attackerRolls.length, 1, "Knight Attacks");
        drawEngine.draw(game);
        assertEquals(lastFight.defenderRolls.length, 3, "Goblins defende");

        // next round for first player again
        assertEquals(game.phase, 2, "now its the first players turn again");
        game.onClickIdx(12, 1);
        game.curP.gold += 6;
        assertEquals(game.map.getTile(12, 1).units[0].num, 2, );
        game.takeNextStep('B', 2);
        assertEquals(game.map.getTile(12, 1).units[0].num, 4, "bought 2 extra units");
        game.onClickIdx(11, 2);
        game.onClickIdx(11, 1);
        assertEquals(game.phase, 5);
        game.takeNextStep();
        assertEquals(game.phase, 6);
        game.takeNextStep();
        assertEquals(game.phase, 10);
        game.onClickIdx(11, 1);
        assertEquals(game.map.getTile(11, 1).getUnitOf(firstPlayer).goldmine.tier, 2, "Trying to annex goldmine");

        // next players turn again
        game.onClickIdx(1, 2); // "select base tile"
        game.takeNextStep("B", 2);
        game.onClickIdx(2, 1); // "select hero"
        game.onClickIdx(3, 1); // "move hero"
        game.takeNextStep();
        assertEquals(game.phase, 8);
        game.onClickIdx(2, 2); // "attack Goblins"
        lastFight = game.fights.last();
        assertEquals(lastFight.attackerRolls.length, 2, "Bows Attacks");
        assertEquals(lastFight.defenderRolls.length, 0, "Goblins cant reach");

        game.onClickIdx(3, 1); // "Annex Goldmine"

        // drawEngine.draw(game);
        // assertEquals("Finish test", false, "End");
    })();

    // start generated Integration Tests

    // (() => {
    //     console.log("test GENERATEDITEGRATIONTEMPLATE");
    //
    //     drawEngine.draw(game);
    //     assertEquals("finish integration test", false);
    // })();

    // (() => {
    //     console.log("test it works");
    //
    //     const game = getDefaultGame(MapType.FixMini);
    //     game.init(true, 1, 1654174792800);
    //     game.startRound();
    //     game.takeNextStep("None", 1, true);
    //     game.onClickIdx(4, 2);
    //     game.onClickIdx(3, 2);
    //     game.onClickIdx(3, 3);
    //     game.onClickIdx(3, 2);
    //
    //     drawEngine.draw(game);
    //     assertEquals("finish integration test", false);
    // })();

    // end generated Integration Tests

    console.log("Running tests:");
    (() => {
        console.log("testPlayerCanBuyAndMoveUnit");
        const game = getDefaultGame();
        game.init(false);
        game.startRound();
        game.takeNextStep('F', 2);
        const cP = game.curP;
        const baseTile = cP.baseTiles[0];
        const xi = baseTile.xi - 1;
        const yi = baseTile.yi;

        drawEngine.draw(game)
        game.onClickIdx(xi, yi);
        const targetTile = game.map.getTile(xi, yi);

        assertEquals(targetTile.units[0].type, 'F');
        assertEquals(targetTile.units[0].player.id, cP.id);
        assertEquals(targetTile.units[0].player.gold, 1);
    })();

    (() => {
        console.log("testUnitsCanOnlyMoveTheirMovPerTurn");
        const game = getDefaultGame();
        game.init(false);
        game.startRound();
        const unit = game.buyUnit('F', 2);
        const startTile = unit.tile;
        game.moveIdx(unit, -1, 0);
        game.moveIdx(unit, -1, 0);
        game.moveIdx(unit, 0, -1); // expect this to not work

        assertEquals(unit.mov, 2); // this test only works if mov is 2
        assertEquals(startTile.xi - 2, unit.tile.xi);
        assertEquals(startTile.yi, unit.tile.yi);

        game.startRound();
        game.startRound();
        game.phase = 5;
        game.moveIdx(unit, 0, -1); // now it should work
        assertEquals(startTile.xi - 2, unit.tile.xi);
        assertEquals(startTile.yi - 1, unit.tile.yi);
    })();

    (() => {
        console.log("testPlayerNeedsGoldToBuyUnits");
        const game = getDefaultGame();
        game.init(false);
        game.startRound();
        game.buyUnit('K', 3);
        const cP = game.curP;

        assertEquals(cP.units.length, 1); // because of hero
    })();


    (() => {
        console.log("testPlayerNeedsSpaceInHomeBaseToBuyUnits");
        const game = getDefaultGame();
        game.maxNumTroups.F = 10;
        game.init(false);

        for (let i = 0; i < 9; i++) {
            game.startRound();
            game.buyUnit('F', 2);
        }
        const cP = game.curP;

        assertEquals(cP.units.length, 4); // one is taken by hero
    })();


    (() => {
        console.log("testPlayerCanAddUnitsToExistingTroupsInBase");
        const game = getDefaultGame();
        game.maxNumTroups.F = 10;
        game.init(false);

        const cP = game.curP;
        const tile = cP.getFreeBaseTiles()[0];
        for (let i = 0; i < 3; i++) {
            game.startRound();
            game.startRound();
            game.buyUnit('F', 2);
        }
        game.startRound();
        game.startRound();
        game.onClick(tile);
        game.buyUnit('F', 2);

        drawEngine.draw(game);
        assertEquals(tile.units[0].num, 4); // one is taken by hero
    })();

    (() => {
        console.log("testPlayerCanAddUnitsToExistingTroupsOutOfBaseForDoubleThePrice");
        const game = getDefaultGame();
        game.maxNumTroups.F = 10;
        game.init(false);
        game.startRound();

        const cP = game.curP;
        cP.activeBaseTile = cP.getFreeBaseTiles()[1];
        const unit = game.buyUnit('F', 2);
        game.moveIdx(unit, -1, -1);
        const tile = unit.tile;
        game.startRound();
        game.startRound();
        game.onClick(tile);
        assertEquals(game.curP.activeBaseTile.id, tile.id); // one is taken by hero
        game.buyUnit('F', 2);
        drawEngine.draw(game);
        assertEquals(tile.units[0].num, 2); // one is taken by hero
        game.startRound();
        game.startRound();
        game.onClick(tile);
        assertEquals(game.curP.activeBaseTile.id, tile.id); // one is taken by hero
        game.buyUnit('F', 2);
        assertEquals(tile.units[0].num, 4); // one is taken by hero
    })();


    (() => {
        console.log("testPlayerCanAttackOtherUnitsInMelee");
        const game = getDefaultGame();
        game.init(false);
        game.startRound();
        game.curP.gold += 5;
        const p1Unit = game.buyUnit('K', 2);
        for (let i = 0; i < 3; i++) {
            game.moveIdx(p1Unit, -3, 0);
            game.startRound();
            game.startRound();
        }
        game.moveIdx(p1Unit, -3, 0);

        game.startRound();
        const p2Unit = game.buyUnit('F', 2);
        game.moveIdx(p2Unit, 2, 0);
        const result = game.fight(p2Unit, p1Unit);
        console.log(result)

        assertEquals(result.prevDefTotalHp, 4);
        assertEquals(result.prevAttackerTotalHp, 2);
        assertEquals(result.prevAttackerNum, 2);
        assertEquals(result.prevDefNum, 2);
        assertEquals(result.attackerRolls.length > 0, true);
        assertEquals(result.defenderRolls.length > 0, true);
    })();


    (() => {
        console.log("test15FactuallyGetToRoll15TimesAgainst2F");
        const game = getDefaultGame();
        game.init(false);
        game.startRound();
        const p1Unit = game.buyUnit('F', 2);
        for (let i = 0; i < 5; i++) {
            game.moveIdx(p1Unit, -2, 0);
            game.startRound();
            game.startRound();
        }
        game.moveIdx(p1Unit, -2, 0);

        game.startRound();
        game.curP.gold += 15*2;
        const p2Unit = game.buyUnit('F', 15);
        game.moveIdx(p2Unit, 2, 0);
        const result = game.fight(p2Unit, p1Unit);
        assertEquals(result.attackerRolls.length, 15);
    })();

    (() => {
        console.log("testPlayerCanAttackOtherUnitsInMeleeOnlyOncePerTurn");
        const game = getDefaultGame();
        game.init(false);
        game.startRound();
        game.curP.gold += 10;
        const p1Unit = game.buyUnit('K', 3);
        for (let i = 0; i < 3; i++) {
            game.moveIdx(p1Unit, -3, 0);
            game.startRound();
            game.startRound();
        }
        game.moveIdx(p1Unit, -3, 0);

        game.startRound();
        const p2Unit = game.buyUnit('F', 4);
        game.moveIdx(p2Unit, 2, 0);
        const result1 = game.fight(p2Unit, p1Unit);
        const result2 = game.fight(p2Unit, p1Unit);
        game.startRound();
        game.startRound();
        const result3 = game.fight(p2Unit, p1Unit);
        assertEquals(result1.attackerRolls.length > 0, true, "There where some attack rolls");
        assertEquals(result2.attackerRolls.length, 0);
        drawEngine.draw(game)
        assertEquals(result2.defenderRolls.length, 0);
        assertEquals(result3.attackerRolls.length > 0, true);

    })();

    (() => {
        console.log("testUnitsCanShootEachOtherFromDistance");
        const game = getDefaultGame();
        game.init(false);
        game.startRound();
        const p1Unit = game.buyUnit('B', 1);
        for (let i = 0; i < 3; i++) {
            game.moveIdx(p1Unit, -2, 0);
            game.startRound();
            game.startRound();
        }
        game.moveIdx(p1Unit, -2, 0);

        game.startRound();
        const p2Unit = game.buyUnit('F', 2);
        game.moveIdx(p2Unit, 2, 0);
        game.startRound();
        game.phase = 8;
        const result1 = game.fight(p1Unit, p2Unit);

        assertEquals(result1.attackerRolls.length > 0, true);
        assertEquals(result1.defenderRolls.length, 0);

    })();

    (() => {
        const markTile = (tile) => Monster.spawnMonster(AssetManager.getMonsterByName("Einfache Goblins"), tile, game.monsters, game);
        console.log("testMapLerpWorksAsExpected");
        const game = getDefaultGame(MapType.Empty);
        game.init(true);
        const tile = game.map.getTile(7, 2);
        const leftTile = game.map.getTile(2, 2);
        markTile(tile);
        markTile(leftTile);

        let lerpTile = game.map.lerp(tile, leftTile, 1)[0];
        assertEquals(lerpTile.xi, tile.xi - 1);

        lerpTile = game.map.lerp(tile, leftTile, 2)[0];
        assertEquals(lerpTile.xi, tile.xi - 2);

        const leftTopTile = game.map.getTile(2, 0);
        markTile(leftTopTile);

        lerpTile = game.map.lerp(tile, leftTopTile, 6)[0];
        assertEquals(lerpTile.xi, leftTopTile.xi);
        assertEquals(lerpTile.yi, leftTopTile.yi + 1);

        markTile(lerpTile);

    })();

    (() => {
        console.log("testEasyGoblinsMoveAndAttackBasedOnTheirRules");
        const game = getDefaultGame(MapType.Empty);
        game.init(true);
        const tile = game.map.getTile(10, 3);
        const monster = Monster.spawnMonster(AssetManager.getMonsterByName("Einfache Goblins"), tile, game.monsters, game);
        game.startRound();
        const p1Unit = game.spawnUnit(8,  0, 3, "F", game.curP);
        game.spawnUnit(8,  1, 3, "B", game.curP);
        game.spawnUnit(8,  2, 3, "K", game.curP);
        game.curP.hero.setTile(game.map.getTile(8, 3));

        assertEquals(monster.tile.xi, tile.xi);
        assertEquals(monster.tile.yi, tile.yi);

        game.startRound();
        game.startRound();
        game.monsterTurn();
        assertEquals(monster.tile.xi, 10);
        assertEquals(monster.tile.yi, 1);

        game.startRound();
        game.startRound();
        game.monsterTurn();

        game.startRound();
        game.startRound();
        game.monsterTurn();
        drawEngine.draw(game);
        assertEquals(p1Unit.tile.xi, monster.tile.xi);
        assertEquals(p1Unit.tile.yi, monster.tile.yi);
    })();


    (() => {
        console.log("testMonstersAreRenderedOnCorrectSide");
        const game = getDefaultGame(MapType.Empty);
        game.init(true);
        const tile = game.map.getTile(2, 2);
        Monster.spawnMonster(AssetManager.getMonsterByName("Einfache Goblins"), tile, game.monsters, game);
        const tile2 = game.map.getTile(10, 3);
        Monster.spawnMonster(AssetManager.getMonsterByName("Einfache Goblins"), tile2, game.monsters, game);
        game.startRound();
        game.buyUnit('B', 1);


        game.startRound();
        game.monsterTurn();
        let testRender = false;
        if (testRender) {
            assertEquals(1, 2);
        }
    })();

    (() => {
        console.log("testKnightsCanAnnexGoldmine");
        const game = getDefaultGame(MapType.Empty);
        game.init(true);
        game.startRound();
        const cP = game.curP;
        cP.gold += 5;
        cP.activeBaseTile = cP.getFreeBaseTiles()[1];
        const p1Unit = game.buyUnit('K', 2);
        game.moveIdx(p1Unit, -2, -1);
        p1Unit.tile.goldmine = new Goldmine(p1Unit.tile, 42);
        p1Unit.takeDmg(1);
        game.phase = 10;
        assertEquals(p1Unit.num, 2);
        game.onClick(p1Unit.tile);

        assertEquals(p1Unit.tile.goldmine.annexProcessStarted, true);
        assertEquals(p1Unit.num, 1);

        // annex has started
        assertEquals(p1Unit.tile.goldmine.player, null);
        game.startRound();
        game.startRound();
        game.startRound();
        game.startRound();

        assertEquals(p1Unit.tile.goldmine.player.id, cP.id);
        assertEquals(p1Unit.tile.goldmine.player.gold, 52);
    })();


    (() => {
        console.log("testKnightsCanCancelAnnexGoldmine");
        const game = getDefaultGame(MapType.Empty);
        game.init(true);
        game.startRound();
        const cP = game.curP;
        cP.gold += 5;
        cP.activeBaseTile = cP.getFreeBaseTiles()[1];
        assertEquals(game.phase, 2, "Game is phase 2");
        game.takeNextStep('K', 2);
        assertEquals(game.phase, 5, "Game is phase 5");
        const p1Unit = cP.activeBaseTile.getUnitOf(cP);
        drawEngine.draw(game)
        game.onClickIdx(11, 1)
        p1Unit.tile.goldmine = new Goldmine(p1Unit.tile, 42);
        p1Unit.takeDmg(1);
        game.phase = 10;
        assertEquals(p1Unit.num, 2);
        game.onClick(p1Unit.tile);

        assertEquals(p1Unit.tile.goldmine.annexProcessStarted, true);
        assertEquals(p1Unit.num, 1);

        // annex has started
        assertEquals(p1Unit.tile.goldmine.player, null);
        game.takeNextStep();
        game.curP.activeBaseTile = game.curP.getFreeBaseTiles()[1];
        const player2 = game.curP;
        game.takeNextStep('K', 1);
        drawEngine.draw(game)
        const p2Unit = player2.activeBaseTile.getUnitOf(player2);
        p2Unit.mov = 20;
        game.moveIdx(p2Unit, 10, -1);
        game.startRound();
        game.startRound();
        game.startRound();

        game.phase = 5;

        assertEquals(p1Unit.tile.goldmine.player, null);
        assertEquals(cP.gold, 10);
    })();

    (() => {
        console.log("testTroupMaximumsAreEnforced");
        const game = getDefaultGame(MapType.Empty);
        game.init(false);
        game.startRound();
        const p1Unit = game.buyUnit('K', 1);
        game.startRound();
        game.startRound();
        const p2Unit = game.buyUnit('K', 1);

        assertEquals(p1Unit.type, "K");
        assertEquals(p2Unit, false);
    })();

    (() => {
        console.log("testUnitMaximumsAreEnforced");
        const game = getDefaultGame(MapType.Empty);
        game.maxNumTroups.B = 3;
        game.init(false);
        game.startRound();
        game.curP.gold += 3 * 21;
        const p1Unit = game.buyUnit('B', 10);
        game.startRound();
        game.startRound();
        const p2Unit = game.buyUnit('B', 10);
        game.startRound();
        game.startRound();
        const p3Unit = game.buyUnit('B', 1);

        assertEquals(p1Unit.num, 10);
        assertEquals(p2Unit.num, 10);
        assertEquals(p3Unit, false);
    })();


    (() => {
        console.log("testUnitMaximumsAreEnforcedInitialBuy");
        const game = getDefaultGame(MapType.Empty);
        game.maxNumTroups.B = 3;
        game.init(false);
        game.startRound();
        game.curP.gold += 5000;
        const p1Unit = game.buyUnit('B', 31);

        assertEquals(p1Unit, false);
    })();

    (() => {
        console.log("test units cant walk through other units");
        const game = getDefaultGame(MapType.Empty);
        game.maxNumTroups.B = 3;
        game.init(false);
        game.startRound();
        game.phase = 5;

        const wallX = 13;
        game.spawnUnit(wallX, 0,1,  "F", game.curP);
        game.spawnUnit(wallX, 1,1,  "F", game.players[0]);
        game.spawnUnit(wallX, 2,1,  "F", game.curP);
        game.spawnUnit(wallX, 3,1,  "F", game.curP);

        const walker = game.spawnUnit(14, 3,1,  "F", game.curP);

        game.curP.activeUnit = walker;
        // game.moveIdx(walker, -2, 0);

        drawEngine.draw(game);
        assertEquals(walker.tile.xi, 14);
    })();

    (() => {
        console.log("test units on same field have to fight before fight phase is over");
        const game = getDefaultGame(MapType.Empty);
        game.init(false);
        game.startRound();
        game.phase = 8;

        const wallX = 13;
        const footSoldiers = game.spawnUnit(wallX, 1,1,  "F", game.curP);
        const bows = game.spawnUnit(11, 1,1,  "B", game.curP);
        game.spawnUnit(wallX, 1,4,  "F", game.players[0]);

        game.takeNextStep();
        assertEquals(game.phase, 8, "Game should " +
            "still be on Attack phase");

        game.curP.activeUnit = bows;
        game.onClick(footSoldiers.tile);
        game.takeNextStep();
        assertEquals(game.phase, 8, "After bow shot " +
            "should still be on attack");

        game.curP.activeUnit = footSoldiers;
        drawEngine.draw(game);
        game.onClick(footSoldiers.tile);
        const beforePl = game.curP;
        game.takeNextStep();
        assertEquals(game.phase, 2,
            "Now after meele fight has happened" +
            " it should be possible to go to the next phase");
        assertEquals(game.curP.id !== beforePl, true, "Next players turn")
    })();



    (() => {
        console.log("test units are displayed correctly on same field");
        const game = getDefaultGame(MapType.Empty);
        game.maxNumTroups.B = 3;
        game.init(true);
        game.startRound();

        game.spawnUnit(0, 0,1,  "F", game.curP);
        game.spawnUnit(0, 0,1,  "F", game.players[0]);

        const u1 = game.spawnUnit(1, 0,1,  "F", game.curP);
        Monster.spawnMonster(AssetManager.getMonsterByName("Einfache Goblins"), u1.tile, game.monsters, game);


        const u2 = game.spawnUnit(2, 0,1,  "F", game.players[0]);
        Monster.spawnMonster(AssetManager.getMonsterByName("Einfache Goblins"), u2.tile, game.monsters, game);

        const u3 = game.spawnUnit(3, 0,1,  "F", game.players[0]);
        game.spawnUnit(3, 0,1,  "F", game.curP);
        Monster.spawnMonster(AssetManager.getMonsterByName("Einfache Goblins"), u3.tile, game.monsters, game);



        drawEngine.draw(game);
        assertEquals(false, false, "Show visual test");
    })();


    //
    // await (async () => {
    //     console.log("test fight vis visual test");
    //     const game = getDefaultGame(MapType.Empty);
    //     game.init(true, 0, 42);
    //     game.startRound();
    //
    //
    //     game.curP.hero.setTile(game.map.getTile(1, 0));
    //     const u1 = game.curP.hero;
    //     const u2 = Monster.spawnMonster(AssetManager.getMonsterByName("Einfache Goblins"), game.curP.hero.tile, game.monsters, game);
    //
    //
    //     const {attacker, defender, attackerRolls, defenderRolls,
    //         prevDefNum, prevDefTotalHp, prevAttackerNum, prevAttackerTotalHp} = game.fight(u1, u2);
    //
    //     drawEngine.draw(game);
    //     await Fightvis.playViz(
    //         attacker, defender, attackerRolls, defenderRolls,
    //         prevDefNum, prevDefTotalHp, prevAttackerNum, prevAttackerTotalHp
    //     );
    //     assertEquals(false, true, "Show visual test Fightvis");
    // })();


    await onTestsDone();

});