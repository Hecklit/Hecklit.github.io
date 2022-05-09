addEventListener('load', function () {

    let canvas = document.getElementById("can");
    canvas.width = 1200;
    canvas.height = 350;
    ctx = canvas.getContext("2d");

    function getDefaultGame() {
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
            MapType.FixMini,
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
    (() => {
        console.log("testPlayerCanBuyAndMoveUnit");
        const game = getDefaultGame();
        game.init();
        game.startRound();
        game.buyUnit('F', 2);
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

    (() => {
        console.log("testPlayerNeedsGoldToBuyUnits");
        const game = getDefaultGame();
        game.init();
        game.startRound();
        game.buyUnit('K', 3);
        const cP = game.getCurrentPlayer();
        const tilesWithUnits = cP.baseTiles.filter(bt => bt.units.length > 0);

        assertEquals(tilesWithUnits.length, 0);
    })();


    (() => {
        console.log("testPlayerNeedsSpaceInHomeBaseToBuyUnits");
        const game = getDefaultGame();
        game.init();

        for (let i = 0; i < 9; i++) {
            game.startRound();
            game.buyUnit('F', 2);
        }
        const cP = game.getCurrentPlayer();

        assertEquals(cP.units.length, 4);
    })();


    (() => {
        console.log("testPlayerCanAttackOtherUnitsInMelee");
        const game = getDefaultGame();
        game.init();
        game.startRound();
        const p1Unit = game.buyUnit('K', 1);
        for (let i = 0; i < 3; i++) {
            p1Unit.moveIdx(-3, 0);
        }
        p1Unit.moveIdx(-2, 0);

        game.startRound();
        const p2Unit = game.buyUnit('F', 2);
        p2Unit.moveIdx(2, 0);
        const result = p2Unit.attack(p1Unit);
        game.draw();

        assertEquals(typeof result[p1Unit.player.id], 'number');
        assertEquals(typeof result[p2Unit.player.id], 'number');

    })();

    onTestsDone();

});