addEventListener('load', async function () {
    console.log("Tests loaded")
    await AssetManager.instance.loadAllData();
    const canvas = document.getElementById("can");
    canvas.width = 1200;
    canvas.height = 360;

    console.log(AssetManager.instance.gameState);

    const gameState = AssetManager.instance.gameState;
    gameState.map = AssetManager.instance.mapData.FixMini;

    // adding tiles
    const tiles = []
    for (let y = 0; y < gameState.map.height; y++) {
        for (let x = 0; x < gameState.map.width; x++) {
            tiles.push(
                {
                    "ref": `tile.${x}|${y}`,
                    "xi": x,
                    "yi": y,
                    "type": "normal",
                    "walkable": true,
                    "shootable": true
                }
            )
        }
    }
    gameState.map.tiles = tiles;

    // adding baseTile associations
    const tilePlayerAssociations = []
    gameState.map.specialTiles.forEach(st => {
        if (st.type !== "Base") {
            return;
        }
        tilePlayerAssociations.push({
            tileRef: GameStateUtil.getTileByCoords(gameState, st.x, st.y).ref,
            playerRef: GameStateUtil.getPlayerByIndex(gameState, st.ofPlayer - 1).ref
        })
    });
    gameState.associations.basetilePlayer = tilePlayerAssociations;


    // adding gold associations
    const goldmineTileAssociations = []
    let goldmineIndex = 0;
    gameState.map.specialTiles.forEach((st) => {
        if (st.type !== "Goldmine") {
            return;
        }
        gameState.goldmines.push(
            {
                ref: 'golmine.'+goldmineIndex,
                gold: st.tier
            }
        );
        goldmineTileAssociations.push({
            tileRef: GameStateUtil.getTileByCoords(gameState, st.x, st.y).ref,
            goldmineRef: GameStateUtil.getGoldmineByIndex(gameState, goldmineIndex++).ref
        })
    });
    gameState.associations.goldmineTile = goldmineTileAssociations;

    // adding monsterDen associations
    const monsterTileAssociations = []
    console.log(gameState.map.specialTiles)
    let monsterDenIndex = 0;
    gameState.map.specialTiles.forEach((st) => {
        if (st.type !== "Monster") {
            return;
        }
        gameState.monsterDens.push(
            {
                ref: 'monsterDen.'+monsterDenIndex,
                lvl: st.lvl
            }
        );
        monsterTileAssociations.push({
            tileRef: GameStateUtil.getTileByCoords(gameState, st.x, st.y).ref,
            monsterDenRef: GameStateUtil.getMonsterDenByIndex(gameState, monsterDenIndex++).ref
        })
    });
    gameState.associations.monsterDenTile = monsterTileAssociations;

    const drawEngine = new DrawEngine(canvas, gameState);
    drawEngine.drawState()
});