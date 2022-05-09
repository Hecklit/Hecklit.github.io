function sleep(t) {
    return new Promise(resolve => setTimeout(resolve, t));
}

async function onTestsDone() {
    let canvas = document.getElementById("can");
    canvas.width = 1200;
    canvas.height = 360;
    ctx = canvas.getContext("2d");
    ctx.textAlign = 'center';

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
        false,
        [],
        MapType.FixMini,
        Game.defaultConfig(),
    );

    canvas.addEventListener('click', function (e) {

        const x = e.clientX,
            y = e.clientY;
        console.log(x, y);

        game.debugMarker = [x, y];
        game.onClickPxl(x, y);
        game.draw();
    }, false);

    const demo = document.getElementById("demo");
    const errorMessage = document.getElementById("errorMessage");
    const nextButton = document.getElementById("next");
    nextButton.addEventListener('click', function () {
        console.log("onNext", game.phase);
        if (game.phase === 8) {
            console.log("startRound");
            game.startRound();
            game.draw();
            nextButton.innerHTML = "Buy";
            buyForm.style.display = 'block';
        } else if (game.phase === 5) {
            game.phase = 8;
            game.draw();
        } else if (game.phase === 2) {
            const getSelectedValue = document.querySelector(
                'input[name="age"]:checked');
            const numUnit = document.querySelector(
                'input[name="numUnit"]');

            const newUnit = game.buyUnit(getSelectedValue.value, numUnit.value);
            game.draw();
            if (newUnit || game.phase === 5) {
                nextButton.innerHTML = "Next";
                buyForm.style.display = 'none';
                errorMessage.style.display = 'none';
            } else {
                errorMessage.innerHTML = game.errorMessage;
                errorMessage.style.display = 'block';
            }
        }
    }, false);

    game.init();
    game.startRound();
    game.draw();

    demo.addEventListener('click', async function () {
        const sleepBetweenPhases = 0;
        const sleepAttack = 2;
        const sleepMovement = 2;

        for (let i = 0; i < 100; i++) {
            // buy unit
            if(game.getCurrentPlayer().units.length <= 2) {
                game.buyUnit(["F", "K", "B"].sample(), Math.floor(Math.random() * game.getCurrentPlayer().gold / 2 + 1));
                game.draw();
                await sleep(sleepBetweenPhases)
            } else {
                game.phase = 5;
            }

            // move
            for (let i = 0; i < 200; i++) {
                if(i % 50 === 0) {
                    game.getCurrentPlayer().activeUnit = game.getCurrentPlayer().units.sample();
                }
                game.onClick(game.map.flatTiles().sample());
                game.draw();
                await sleep(sleepMovement)
            }
            game.phase = 8;
            game.draw();
            await sleep(sleepBetweenPhases)

            // attack
            for (let i = 0; i < 200; i++) {
                if(i % 50 === 0) {
                    game.getCurrentPlayer().activeUnit = game.getCurrentPlayer().units.sample();
                }
                game.onClick(game.map.flatTiles().sample());
                game.draw();
                await sleep(sleepAttack)
            }
            game.startRound();
            game.draw();
            await sleep(sleepBetweenPhases);
        }
    });


}