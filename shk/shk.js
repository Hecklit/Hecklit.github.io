async function onTestsDone() {
    const canvas = document.getElementById("can");
    canvas.width = 1200;
    canvas.height = 360;

    const heroRevivals = 2;
    const game = new Game(
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
        heroRevivals,
        [],
        MapType.FixMini,
        Config.unitConfig,
        document.querySelectorAll(
            'input[name="age"]'),
        document.querySelectorAll(
            'label',
        )
    );
    const drawEngine = new DrawEngine(canvas);
    Fightvis.configureDrawEngine(drawEngine);
    const demoPlayer = new Ai();

    // OUTPUTS
    game.onHeroDeath.subscribe(() => {
        console.log("onHeroDeath");
        drawEngine.draw(game);
    });
    game.onTurnFinish.subscribe(() => {
        console.log("onTurnFinish");
        drawEngine.draw(game);
    });
    game.onStepFinish.subscribe(() => {
        console.log("onStepFinish");
        drawEngine.draw(game);
    });
    game.onAttack.subscribe(async (attacker, defender, prevNum, rolls, enemyHits) => {
        console.log("onAttack");
        await Fightvis.playViz(attacker, defender, prevNum, rolls, enemyHits);
        drawEngine.draw(game);
    });
    game.onGameOver.subscribe(() => {
        console.log("onGameOver");
        drawEngine.draw(game);
    });
    game.onMonsterStep.subscribe(() => {
        console.log("onMonsterStep");
        drawEngine.draw(game);
    });
    game.onClickFinished.subscribe(() => {
        console.log("onClickFinished");
        drawEngine.draw(game);
    });
    game.onError.subscribe((error) => {
        console.log("onError");
        errorMessage.innerHTML = error;
        errorMessage.style.display = "block";
        drawEngine.draw(game);
    });

    // INPUTS
    const errorMessage = document.getElementById("errorMessage");
    const demo = document.getElementById("demo");
    const nextButton = document.getElementById("next");
    canvas.addEventListener('click', function (e) {
        const x = e.clientX,
            y = e.clientY;
        console.log(x, y);

        game.debugMarker = [x, y];
        game.onClickPxl(x, y);
    }, false);

    nextButton.addEventListener('click', function () {
        game.takeNextStep();
    }, false);

    demo.addEventListener('click', async function () {
        await demoPlayer.playDemo(game);
    });

    window.visualViewport.addEventListener('resize', (e) => {
        drawEngine.resize(e.target.width, game);
    });

    // start game
    const curPi = Math.floor(Math.random()*2);
    console.log("curPi", curPi);
    game.init(true, curPi);
    game.startRound();

    // initial resize
    drawEngine.resize(window.visualViewport.width, game);
}