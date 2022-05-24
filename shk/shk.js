async function onTestsDone() {
    const singlePlayerBtn = document.getElementById("sp");
    // const multiPlayerBtn = document.getElementById("mp");
    const couchBtn = document.getElementById("couch");
    const mainMenuDiv = document.getElementById("main-menu");
    const gameDiv = document.getElementById("game");
    const demo = document.getElementById("demo");
    couchBtn.addEventListener('click', async function () {
        mainMenuDiv.classList.add("d-none");
        gameDiv.classList.remove("d-none");
        await startGame();
    }, false);
    singlePlayerBtn.addEventListener('click', async function () {
        mainMenuDiv.classList.add("d-none");
        gameDiv.classList.remove("d-none");
        await startGame(true);
    }, false);
    demo.addEventListener('click', async function () {
        mainMenuDiv.classList.add("d-none");
        gameDiv.classList.remove("d-none");
        await startGame(false, true );
    });
}

async function startGame(aiPlayer=false, demo=false){
    let disableInput = false;
    const canvas = document.getElementById("can");
    canvas.width = 1200;
    canvas.height = 360;
    resetRandomNumberGenerator();
    const game = new Game(
        ...Config.gameConfig({heroRevival: 3}).FixesMini,
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
    game.onTurnFinish.subscribe(async () => {
        console.log("onTurnFinish");
        drawEngine.draw(game);
    });
    game.onTurnStart.subscribe(async () => {
        console.log("onTurnStart");
        drawEngine.draw(game);
        if (game.phase !== 2) {
            throw "Turn finished not on phase 2"
        }
        if (game.curP.id === "Jonas" && aiPlayer) {
            disableInput = true;
            await demoPlayer.playTurn(game, game.curP);
            disableInput = false;
        }
        errorMessage.innerHTML = "";
        errorMessage.style.display = "none";
        nextButton.innerHTML = game.phase === 2 ? "Buy" : "Next";
        buyForm.style.opacity = game.phase === 2 ? "1" : "0.5";
        drawEngine.draw(game);
    });
    game.onStepFinish.subscribe(() => {
        console.log("onStepFinish");
        errorMessage.innerHTML = "";
        errorMessage.style.display = "none";
        nextButton.innerHTML = game.phase === 2 ? "Buy" : "Next";
        buyForm.style.opacity = game.phase === 2 ? "1" : "0.5";
        drawEngine.draw(game);
    });
    game.onAttack.subscribe(async (attacker, defender, attackerRolls, defenderRolls,
                                   prevDefNum, prevDefTotalHp, prevAttackerNum, prevAttackerTotalHp) => {
        console.log("onAttack");
        await Fightvis.playViz(attacker, defender, attackerRolls, defenderRolls,
            prevDefNum, prevDefTotalHp, prevAttackerNum, prevAttackerTotalHp);
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
    const nextButton = document.getElementById("next");
    const buyForm = document.getElementById("buyForm");
    canvas.addEventListener('click', function (e) {
        if(disableInput) {
            return
        }
        const x = e.clientX,
            y = e.clientY;
        console.log(x, y);

        game.debugMarker = [x, y];
        game.onClickPxl(x, y);
    }, false);

    nextButton.addEventListener('click', function () {
        if(disableInput) {
            return
        }
        const getSelectedValue = document.querySelector(
            'input[name="age"]:checked');
        const numUnit = document.querySelector(
            'input[name="numUnit"]');
        game.takeNextStep(getSelectedValue.value, +numUnit.value);
    }, false);

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

    if(demo) {
        document.getElementsByClassName('controls')[0].classList.add("d-none");

        // initial resize
        drawEngine.resize(window.visualViewport.width, game);
        await demoPlayer.playDemo(game);
    }
}