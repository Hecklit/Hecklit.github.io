addEventListener('load', async function () {
    console.log("Tests loaded")
    await AssetManager.instance.loadAllData();
    const canvas = document.getElementById("can");
    canvas.width = 1200;
    canvas.height = 360;

    console.log(AssetManager.instance.gameState);

    const gameState = AssetManager.instance.gameState;
    // gameState.map = AssetManager.instance.mapData.FixMini;

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

    const drawEngine = new DrawEngine(canvas, gameState);
    drawEngine.drawState()
});