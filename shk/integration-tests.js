addEventListener('load', async function () {
    const canvas = document.getElementById("can");
    canvas.width = 1200;
    canvas.height = 360;
    const drawEngine = new DrawEngine(canvas);

    function getDefaultGame(mapType = MapType.FixMini) {
        return new Game(
            5,
            [],
            {
                "F": 30,
                "B": 20,
                "K": 24
            },
            {
                "F": 1,
                "B": 1,
                "K": 1
            },
            false,
            [],
            mapType,
            Config.unitConfig,
        );
    }

    function assertEquals(a, b) {
        if (a !== b) {
            throw `${a} !== ${b}`;
        } else {
            console.log(`${a} === ${b}`)
        }
    }


    console.log("Running tests:");
    (() => {
        console.log("testPlayerCanBuyAndMoveUnit");
        const game = getDefaultGame();
        game.init(false);
        game.startRound();
        game.buyUnit('F', 2);
        const cP = game.curP;
        const baseTile = cP.baseTiles[0];
        const xi = baseTile.xi - 1;
        const yi = baseTile.yi;

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
        unit.moveIdx(-1, 0);
        unit.moveIdx(-1, 0);
        unit.moveIdx(0, -1); // expect this to not work

        assertEquals(unit.mov, 2); // this test only works if mov is 2
        assertEquals(startTile.xi - 2, unit.tile.xi);
        assertEquals(startTile.yi, unit.tile.yi);

        game.startRound();
        game.startRound();
        game.phase = 5;
        unit.moveIdx(0, -1); // now it should work
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
        console.log("testPlayerCanAttackOtherUnitsInMelee");
        const game = getDefaultGame();
        game.init(false);
        game.startRound();
        const p1Unit = game.buyUnit('K', 1);
        for (let i = 0; i < 3; i++) {
            p1Unit.moveIdx(-3, 0);
            game.startRound();
            game.startRound();
        }
        p1Unit.moveIdx(-3, 0);

        game.startRound();
        const p2Unit = game.buyUnit('F', 2);
        p2Unit.moveIdx(2, 0);
        const result = game.fight(p2Unit, p1Unit);

        assertEquals(typeof result[p1Unit.player.id], 'number');
        assertEquals(typeof result[p2Unit.player.id], 'number');

    })();


    (() => {
        console.log("testPlayerCanAttackOtherUnitsInMeleeOnlyOncePerTurn");
        const game = getDefaultGame();
        game.init(false);
        game.startRound();
        const p1Unit = game.buyUnit('K', 1);
        for (let i = 0; i < 3; i++) {
            p1Unit.moveIdx(-3, 0);
            game.startRound();
            game.startRound();
        }
        p1Unit.moveIdx(-3, 0);

        game.startRound();
        const p2Unit = game.buyUnit('F', 2);
        p2Unit.moveIdx(2, 0);
        const result1 = game.fight(p2Unit, p1Unit);
        const result2 = game.fight(p2Unit, p1Unit);
        game.startRound();
        game.startRound();
        const result3 = game.fight(p2Unit, p1Unit);

        assertEquals(typeof result1[p1Unit.player.id], 'number');
        assertEquals(typeof result1[p2Unit.player.id], 'number');
        assertEquals(result2[p1Unit.player.id], 0);
        assertEquals(result2[p2Unit.player.id], 0);
        assertEquals(typeof result3[p1Unit.player.id], 'number');
        assertEquals(typeof result3[p2Unit.player.id], 'number');

    })();

    (() => {
        console.log("testUnitsCanShootEachOtherFromDistance");
        const game = getDefaultGame();
        game.init(false);
        game.startRound();
        const p1Unit = game.buyUnit('B', 1);
        for (let i = 0; i < 3; i++) {
            p1Unit.moveIdx(-2, 0);
            game.startRound();
            game.startRound();
        }
        p1Unit.moveIdx(-2, 0);

        game.startRound();
        const p2Unit = game.buyUnit('F', 2);
        p2Unit.moveIdx(2, 0);
        game.startRound();
        game.phase = 8;
        const result1 = game.fight(p1Unit, p2Unit);

        assertEquals(typeof result1[p1Unit.player.id], 'number');
        assertEquals(typeof result1[p2Unit.player.id], 'number');

    })();

    (() => {
        const markTile = (tile) => Monster.spawnMonster(Config.getMonsterByName("Einfache Goblins"), tile, game.monsters, game);
        console.log("testMapLerpWorksAsExpected");
        const game = getDefaultGame(MapType.Empty);
        game.init(true);
        const tile = game.map.getTile(7, 2);
        const leftTile = game.map.getTile(2, 2);
        markTile(tile);
        markTile(leftTile);

        let lerpTile = game.map.lerp(tile, leftTile, 1);
        assertEquals(lerpTile.xi, tile.xi - 1);

        lerpTile = game.map.lerp(tile, leftTile, 2);
        assertEquals(lerpTile.xi, tile.xi - 2);

        const leftTopTile = game.map.getTile(2, 0);
        markTile(leftTopTile);

        lerpTile = game.map.lerp(tile, leftTopTile, 6);
        assertEquals(lerpTile.xi, leftTopTile.xi);
        assertEquals(lerpTile.yi, leftTopTile.yi + 1);

        markTile(lerpTile);

    })();

    (() => {
        console.log("testEasyGoblinsMoveAndAttackBasedOnTheirRules");
        const game = getDefaultGame(MapType.Empty);
        game.init(true);
        const tile = game.map.getTile(10, 3);
        const monster = Monster.spawnMonster(Config.getMonsterByName("Einfache Goblins"), tile, game.monsters, game);
        game.startRound();
        const p1Unit = game.buyUnit('B', 1);


        assertEquals(monster.tile.xi, tile.xi + 2);
        assertEquals(monster.tile.yi, tile.yi);

        game.startRound();
        game.monsterTurn();
        assertEquals(p1Unit.tile.xi, monster.tile.xi);
        assertEquals(p1Unit.tile.yi, monster.tile.yi);
    })();


    (() => {
        console.log("testMonstersAreRenderedOnCorrectSide");
        const game = getDefaultGame(MapType.Empty);
        game.init(true);
        const tile = game.map.getTile(2, 2);
        Monster.spawnMonster(Config.getMonsterByName("Einfache Goblins"), tile, game.monsters, game);
        const tile2 = game.map.getTile(10, 3);
        Monster.spawnMonster(Config.getMonsterByName("Einfache Goblins"), tile2, game.monsters, game);
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
        p1Unit.moveIdx(-2, -1);
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
        console.log("testKnightsCanAnnexGoldmine");
        const game = getDefaultGame(MapType.Empty);
        game.init(true);
        game.startRound();
        const cP = game.curP;
        cP.gold += 5;
        cP.activeBaseTile = cP.getFreeBaseTiles()[1];
        const p1Unit = game.buyUnit('K', 2);
        p1Unit.moveIdx(-2, -1);
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
        game.curP.activeBaseTile = game.curP.getFreeBaseTiles()[1];
        const p2Unit = game.buyUnit('K', 1);
        p2Unit.mov = 20;
        p2Unit.moveIdx(10, -1);
        game.startRound();
        game.startRound();
        game.startRound();

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

    // await Fightvis.demo();
    await onTestsDone();

});