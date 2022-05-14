addEventListener('load', async function () {

    let canvas = document.getElementById("can");
    canvas.width = 1200;
    canvas.height = 350;
    ctx = canvas.getContext("2d");
    ctx.textAlign = 'center';

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
            Game.defaultConfig(),
        );
    }

    function assertEquals(a, b) {
        if(a !== b) {
            throw `${a} !== ${b}`;
        } else {
            console.log(`${a} === ${b}`)
        }
    }

    console.log("Running tests:");
    await (async () => {
        console.log("testPlayerCanBuyAndMoveUnit");
        const game = getDefaultGame();
        game.init(false);
        game.startRound();
        await game.buyUnit('F', 2);
        const cP = game.getCurrentPlayer();
        const baseTile = cP.baseTiles[0];
        const xi = baseTile.xi - 1;
        const yi = baseTile.yi;

        game.onClickIdx(xi, yi);
        const targetTile = game.map.getTile(xi, yi);

        assertEquals(targetTile.units[0].type, 'F');
        assertEquals(targetTile.units[0].player.id, cP.id);
        assertEquals(targetTile.units[0].player.gold, 1);
    })();

    await (async () => {
        console.log("testUnitsCanOnlyMoveTheirMovPerTurn");
        const game = getDefaultGame();
        game.init(false);
        game.startRound();
        const unit = await game.buyUnit('F', 2);
        const startTile = unit.tile;
        unit.moveIdx(-1, 0);
        unit.moveIdx(-1, 0);
        unit.moveIdx(0, 1); // expect this to not work

        assertEquals(unit.mov, 2); // this test only works if mov is 2
        assertEquals(startTile.xi - 2, unit.tile.xi);
        assertEquals(startTile.yi, unit.tile.yi);

        game.startRound();
        game.startRound();
        unit.moveIdx(0, 1); // now it should work
        assertEquals(startTile.xi - 2, unit.tile.xi);
        assertEquals(startTile.yi + 1, unit.tile.yi);
    })();

    await (async () => {
        console.log("testPlayerNeedsGoldToBuyUnits");
        const game = getDefaultGame();
        game.init(false);
        game.startRound();
        await game.buyUnit('K', 3);
        const cP = game.getCurrentPlayer();
        const tilesWithUnits = cP.baseTiles.filter(bt => bt.units.length > 0);

        assertEquals(tilesWithUnits.length, 0);
    })();


    await (async () => {
        console.log("testPlayerNeedsSpaceInHomeBaseToBuyUnits");
        const game = getDefaultGame();
        game.init(false);

        for (let i = 0; i < 9; i++) {
            game.startRound();
            await game.buyUnit('F', 2);
        }
        const cP = game.getCurrentPlayer();

        assertEquals(cP.units.length, 4);
    })();


    await (async () => {
        console.log("testPlayerCanAttackOtherUnitsInMelee");
        const game = getDefaultGame();
        game.init(false);
        game.startRound();
        const p1Unit = await game.buyUnit('K', 1);
        for (let i = 0; i < 3; i++) {
            p1Unit.moveIdx(-3, 0);
            game.startRound();
            game.startRound();
        }
        p1Unit.moveIdx(-2, 0);

        game.startRound();
        const p2Unit = await game.buyUnit('F', 2);
        p2Unit.moveIdx(2, 0);
        const result = p2Unit.attack(p1Unit);
        game.draw();

        assertEquals(typeof result[p1Unit.player.id], 'number');
        assertEquals(typeof result[p2Unit.player.id], 'number');

    })();


    await (async () => {
        console.log("testPlayerCanAttackOtherUnitsInMeleeOnlyOncePerTurn");
        const game = getDefaultGame();
        game.init(false);
        game.startRound();
        const p1Unit = await game.buyUnit('K', 1);
        for (let i = 0; i < 3; i++) {
            p1Unit.moveIdx(-3, 0);
            game.startRound();
            game.startRound();
        }
        p1Unit.moveIdx(-2, 0);

        game.startRound();
        const p2Unit = await game.buyUnit('F', 2);
        p2Unit.moveIdx(2, 0);
        const result1 = p2Unit.attack(p1Unit);
        const result2 = p2Unit.attack(p1Unit);
        game.startRound();
        game.startRound();
        const result3 = p2Unit.attack(p1Unit);
        game.draw();

        assertEquals(typeof result1[p1Unit.player.id], 'number');
        assertEquals(typeof result1[p2Unit.player.id], 'number');
        assertEquals(result2, 0);
        assertEquals(typeof result3[p1Unit.player.id], 'number');
        assertEquals(typeof result3[p2Unit.player.id], 'number');

    })();

    await (async () => {
        console.log("testUnitsCanShootEachOtherFromDistance");
        const game = getDefaultGame();
        game.init(false);
        game.startRound();
        const p1Unit = await game.buyUnit('B', 1);
        for (let i = 0; i < 3; i++) {
            p1Unit.moveIdx(-2, 0);
            game.startRound();
            game.startRound();
        }
        p1Unit.moveIdx(-2, 0);

        game.startRound();
        const p2Unit = await game.buyUnit('F', 2);
        p2Unit.moveIdx(2, 0);
        game.startRound();
        game.phase = 8;
        game.draw();
        const result1 = p1Unit.attack(p2Unit);


        assertEquals(typeof result1[p1Unit.player.id], 'number');
        assertEquals(typeof result1[p2Unit.player.id], 'number');

    })();


    await (async () => {
        console.log("testEasyGoblinsMoveAndAttackBasedOnTheirRules");
        const game = getDefaultGame(MapType.Empty);
        game.init(true);
        const tile = game.map.getTile(9, 2);
        const monster = Monster.spawnMonster(Config.getMonsterByName("Einfache Goblins"), tile, game.monsters);
        game.startRound();
        const p1Unit = await game.buyUnit('B', 1);

        game.draw();

        assertEquals(monster.tile.xi, tile.xi + 2);
        assertEquals(monster.tile.yi, tile.yi);

        game.startRound();
        await game.monsterTurn();
        game.draw();
        assertEquals(p1Unit.tile.xi, monster.tile.xi);
        assertEquals(p1Unit.tile.yi, monster.tile.yi);
    })();

    await onTestsDone();

});