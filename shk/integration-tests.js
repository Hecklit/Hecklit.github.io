addEventListener('load', function () {

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
        const ts = game.map.getTileSize();
        const tx = cP.baseTiles[0].x - ts;
        const ty = cP.baseTiles[0].y;

        game.onClick(tx, ty);

        assertEquals(game.map.getTileAtPx(tx, ty).units[0].type, 'F');
        assertEquals(game.map.getTileAtPx(tx, ty).units[0].player.id, cP.id);
        assertEquals(game.map.getTileAtPx(tx, ty).units[0].player.gold, 1);
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

    onTestsDone();

});