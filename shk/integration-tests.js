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
        if (a !== b) {
            throw `${a} !== ${b}`;
        } else {
            console.log(`${a} === ${b}`)
        }
    }

    //
    // console.log("Running tests:");
    // await (async () => {
    //     console.log("testPlayerCanBuyAndMoveUnit");
    //     const game = getDefaultGame();
    //     game.init(false);
    //     game.startRound();
    //     await game.buyUnit('F', 2);
    //     const cP = game.getCurrentPlayer();
    //     const baseTile = cP.baseTiles[0];
    //     const xi = baseTile.xi - 1;
    //     const yi = baseTile.yi;
    //
    //     game.onClickIdx(xi, yi);
    //     const targetTile = game.map.getTile(xi, yi);
    //
    //     assertEquals(targetTile.units[0].type, 'F');
    //     assertEquals(targetTile.units[0].player.id, cP.id);
    //     assertEquals(targetTile.units[0].player.gold, 1);
    // })();
    //
    // await (async () => {
    //     console.log("testUnitsCanOnlyMoveTheirMovPerTurn");
    //     const game = getDefaultGame();
    //     game.init(false);
    //     game.startRound();
    //     const unit = await game.buyUnit('F', 2);
    //     const startTile = unit.tile;
    //     unit.moveIdx(-1, 0);
    //     unit.moveIdx(-1, 0);
    //     unit.moveIdx(0, -1); // expect this to not work
    //
    //     assertEquals(unit.mov, 2); // this test only works if mov is 2
    //     assertEquals(startTile.xi - 2, unit.tile.xi);
    //     assertEquals(startTile.yi, unit.tile.yi);
    //
    //     game.startRound();
    //     game.startRound();
    //     game.phase = 5;
    //     unit.moveIdx(0, -1); // now it should work
    //     assertEquals(startTile.xi - 2, unit.tile.xi);
    //     assertEquals(startTile.yi - 1, unit.tile.yi);
    // })();
    //
    // await (async () => {
    //     console.log("testPlayerNeedsGoldToBuyUnits");
    //     const game = getDefaultGame();
    //     game.init(false);
    //     game.startRound();
    //     await game.buyUnit('K', 3);
    //     const cP = game.getCurrentPlayer();
    //
    //     assertEquals(cP.units.length, 1); // because of hero
    // })();
    //
    //
    // await (async () => {
    //     console.log("testPlayerNeedsSpaceInHomeBaseToBuyUnits");
    //     const game = getDefaultGame();
    //     game.init(false);
    //
    //     for (let i = 0; i < 9; i++) {
    //         game.startRound();
    //         await game.buyUnit('F', 2);
    //     }
    //     const cP = game.getCurrentPlayer();
    //
    //     assertEquals(cP.units.length, 4); // one is taken by hero
    // })();
    //
    //
    // await (async () => {
    //     console.log("testPlayerCanAttackOtherUnitsInMelee");
    //     const game = getDefaultGame();
    //     game.init(false);
    //     game.startRound();
    //     const p1Unit = await game.buyUnit('K', 1);
    //     for (let i = 0; i < 3; i++) {
    //         p1Unit.moveIdx(-3, 0);
    //         game.startRound();
    //         game.startRound();
    //     }
    //     p1Unit.moveIdx(-3, 0);
    //
    //     game.startRound();
    //     const p2Unit = await game.buyUnit('F', 2);
    //     p2Unit.moveIdx(2, 0);
    //     const result = p2Unit.attack(p1Unit);
    //
    //     assertEquals(typeof result[p1Unit.player.id], 'number');
    //     assertEquals(typeof result[p2Unit.player.id], 'number');
    //
    // })();
    //
    //
    // await (async () => {
    //     console.log("testPlayerCanAttackOtherUnitsInMeleeOnlyOncePerTurn");
    //     const game = getDefaultGame();
    //     game.init(false);
    //     game.startRound();
    //     const p1Unit = await game.buyUnit('K', 1);
    //     for (let i = 0; i < 3; i++) {
    //         p1Unit.moveIdx(-3, 0);
    //         game.startRound();
    //         game.startRound();
    //     }
    //     p1Unit.moveIdx(-3, 0);
    //
    //     game.startRound();
    //     const p2Unit = await game.buyUnit('F', 2);
    //     p2Unit.moveIdx(2, 0);
    //     const result1 = p2Unit.attack(p1Unit);
    //     const result2 = p2Unit.attack(p1Unit);
    //     game.startRound();
    //     game.startRound();
    //     const result3 = p2Unit.attack(p1Unit);
    //
    //     assertEquals(typeof result1[p1Unit.player.id], 'number');
    //     assertEquals(typeof result1[p2Unit.player.id], 'number');
    //     assertEquals(result2, 0);
    //     assertEquals(typeof result3[p1Unit.player.id], 'number');
    //     assertEquals(typeof result3[p2Unit.player.id], 'number');
    //
    // })();
    //
    // await (async () => {
    //     console.log("testUnitsCanShootEachOtherFromDistance");
    //     const game = getDefaultGame();
    //     game.init(false);
    //     game.startRound();
    //     const p1Unit = await game.buyUnit('B', 1);
    //     for (let i = 0; i < 3; i++) {
    //         p1Unit.moveIdx(-2, 0);
    //         game.startRound();
    //         game.startRound();
    //     }
    //     p1Unit.moveIdx(-2, 0);
    //
    //     game.startRound();
    //     const p2Unit = await game.buyUnit('F', 2);
    //     p2Unit.moveIdx(2, 0);
    //     game.startRound();
    //     game.phase = 8;
    //     const result1 = p1Unit.attack(p2Unit);
    //
    //     assertEquals(typeof result1[p1Unit.player.id], 'number');
    //     assertEquals(typeof result1[p2Unit.player.id], 'number');
    //
    // })();
    //
    // await (async () => {
    //     const markTile = (tile) => Monster.spawnMonster(Config.getMonsterByName("Einfache Goblins"), tile, game.monsters);
    //     console.log("testMapLerpWorksAsExpected");
    //     const game = getDefaultGame(MapType.Empty);
    //     game.init(true);
    //     const tile = game.map.getTile(7, 2);
    //     const leftTile = game.map.getTile(2, 2);
    //     markTile(tile);
    //     markTile(leftTile);
    //
    //     let lerpTile = game.map.lerp(tile, leftTile, 1);
    //     assertEquals(lerpTile.xi, tile.xi - 1);
    //
    //     lerpTile = game.map.lerp(tile, leftTile, 2);
    //     assertEquals(lerpTile.xi, tile.xi - 2);
    //
    //     const leftTopTile = game.map.getTile(2, 0);
    //     markTile(leftTopTile);
    //
    //     lerpTile = game.map.lerp(tile, leftTopTile, 6);
    //     assertEquals(lerpTile.xi, leftTopTile.xi);
    //     assertEquals(lerpTile.yi, leftTopTile.yi + 1);
    //
    //     markTile(lerpTile);
    //
    // })();
    //
    // await (async () => {
    //     console.log("testEasyGoblinsMoveAndAttackBasedOnTheirRules");
    //     const game = getDefaultGame(MapType.Empty);
    //     game.init(true);
    //     const tile = game.map.getTile(10, 3);
    //     const monster = Monster.spawnMonster(Config.getMonsterByName("Einfache Goblins"), tile, game.monsters);
    //     game.startRound();
    //     const p1Unit = await game.buyUnit('B', 1);
    //
    //
    //     assertEquals(monster.tile.xi, tile.xi + 2);
    //     assertEquals(monster.tile.yi, tile.yi);
    //
    //     game.startRound();
    //     await game.monsterTurn();
    //     assertEquals(p1Unit.tile.xi, monster.tile.xi);
    //     assertEquals(p1Unit.tile.yi, monster.tile.yi);
    // })();
    //
    //
    // await (async () => {
    //     console.log("testMonstersAreRenderedOnCorrectSide");
    //     const game = getDefaultGame(MapType.Empty);
    //     game.init(true);
    //     const tile = game.map.getTile(2, 2);
    //     Monster.spawnMonster(Config.getMonsterByName("Einfache Goblins"), tile, game.monsters);
    //     const tile2 = game.map.getTile(10, 3);
    //     Monster.spawnMonster(Config.getMonsterByName("Einfache Goblins"), tile2, game.monsters);
    //     game.startRound();
    //     await game.buyUnit('B', 1);
    //
    //
    //     game.startRound();
    //     await game.monsterTurn();
    //     let testRender = false;
    //     if (testRender) {
    //         assertEquals(1, 2);
    //     }
    // })();
    //
    // await (async () => {
    //     console.log("testKnightsCanAnnexGoldmine");
    //     const game = getDefaultGame(MapType.Empty);
    //     game.init(true);
    //     game.startRound();
    //     const cP = game.getCurrentPlayer();
    //     cP.gold += 5;
    //     cP.activeBaseTile = cP.getFreeBaseTiles()[1];
    //     const p1Unit = await game.buyUnit('K', 2);
    //     p1Unit.moveIdx(-2, -1);
    //     p1Unit.tile.goldmine = new Goldmine(p1Unit.tile, 42);
    //     p1Unit.takeDmg(1);
    //     game.phase = 10;
    //     assertEquals(p1Unit.num, 2);
    //     game.onClick(p1Unit.tile);
    //
    //     assertEquals(p1Unit.tile.goldmine.annexProcessStarted, true);
    //     assertEquals(p1Unit.num, 1);
    //
    //     // annex has started
    //     assertEquals(p1Unit.tile.goldmine.player, null);
    //     game.startRound();
    //     game.startRound();
    //     game.startRound();
    //     game.startRound();
    //
    //     assertEquals(p1Unit.tile.goldmine.player.id, cP.id);
    //     assertEquals(p1Unit.tile.goldmine.player.gold, 52);
    // })();
    //
    //
    // await (async () => {
    //     console.log("testKnightsCanAnnexGoldmine");
    //     const game = getDefaultGame(MapType.Empty);
    //     game.init(true);
    //     game.startRound();
    //     const cP = game.getCurrentPlayer();
    //     cP.gold += 5;
    //     cP.activeBaseTile = cP.getFreeBaseTiles()[1];
    //     const p1Unit = await game.buyUnit('K', 2);
    //     p1Unit.moveIdx(-2, -1);
    //     p1Unit.tile.goldmine = new Goldmine(p1Unit.tile, 42);
    //     p1Unit.takeDmg(1);
    //     game.phase = 10;
    //     assertEquals(p1Unit.num, 2);
    //     game.onClick(p1Unit.tile);
    //
    //     assertEquals(p1Unit.tile.goldmine.annexProcessStarted, true);
    //     assertEquals(p1Unit.num, 1);
    //
    //     // annex has started
    //     assertEquals(p1Unit.tile.goldmine.player, null);
    //     game.startRound();
    //     game.getCurrentPlayer().activeBaseTile = game.getCurrentPlayer().getFreeBaseTiles()[1];
    //     const p2Unit = await game.buyUnit('K', 1);
    //     p2Unit.mov = 20;
    //     p2Unit.moveIdx(10, -1);
    //     game.startRound();
    //     game.startRound();
    //     game.startRound();
    //
    //     assertEquals(p1Unit.tile.goldmine.player, null);
    //     assertEquals(cP.gold, 10);
    // })();
    //
    // await (async () => {
    //     console.log("testKnightsCanAnnexGoldmine");
    //     const vis = Fightvis.instance;
    //     vis.startFightVis([
    //         {
    //             playerId: "Jonas",
    //             color: "red",
    //             type: "F",
    //             numBefore: 6,
    //             numAfter: 4,
    //             rolls: [
    //                 {n: 1, h: false},
    //                 {n: 2, h: false},
    //                 {n: 3, h: false},
    //                 {n: 4, h: false},
    //                 {n: 5, h: false},
    //                 {n: 6, h: true},
    //             ],
    //         }, {
    //             playerId: "Jakob",
    //             color: "blue",
    //             type: "K",
    //             numBefore: 3,
    //             numAfter: 2,
    //             rolls: [
    //                 {n: 4, h: false},
    //                 {n: 5, h: true},
    //                 {n: 6, h: true},
    //             ],
    //         }
    //     ], 0, true);
    //     await vis.play();
    // })();

    await (async () => {
        console.log("testKnightsCanAnnexGoldmine");
        const vis = Fightvis.instance;
        vis.startFightVis([
            {
                playerId: "Jonas",
                color: "red",
                type: "F",
                numBefore: 100,
                numAfter: 4,
                rolls: range(100).map(i => {
                    const n = range(7, 1).sample();
                    return {n, h: n > 4};
                })
            }, {
                playerId: "Jakob",
                color: "blue",
                type: "K",
                numBefore: 100,
                numAfter: 2,
                rolls: range(100).map(i => {
                    const n = range(7, 1).sample();
                    return {n, h: n > 3};
                }),
            }
        ], 0, true);
        await vis.play();
        // assertEquals("not done", null)
    })();


    await onTestsDone();


});