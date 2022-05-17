async function onTestsDone() {
    let canvas = document.getElementById("can");
    canvas.width = 1200;
    canvas.height = 360;
    const ratio = canvas.height / canvas.width;
    ctx = canvas.getContext("2d");
    ctx.textAlign = 'center';

    function resize(width) {
        width = Math.max(width, 880);
        ctx.canvas.width = width * 0.75;
        ctx.canvas.height =  width * ratio;
        game.map.setRenderWidth(ctx.canvas.width);
        game.draw();
    }

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
        Game.defaultConfig(),
        document.querySelectorAll(
            'input[name="age"]'),
        document.querySelectorAll(
            'label',
        )
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
    nextButton.addEventListener('click', async function () {
        console.log("onNext", game.phase);
        if (game.phase === 10) {
            console.log("startRound");
            nextButton.innerHTML = "Buy";
            game.startRound();
            game.draw();
        } else if (game.phase === 8) {
            game.phase = 10;
            game.draw();
            // buyForm.style.display = 'block';
        } else if (game.phase === 5) {
            if(game.map.getTriggerableMonsterDen(game.getCurrentPlayer()).length > 0){
                game.phase = 6;
            }else {
                game.phase = 8;

                if (game.getCurrentPlayer().units.filter(u => !u.cantAttackAnymore()).length === 0) {
                    this.startRound();
                }
            }
            game.draw();
        } else if (game.phase === 2) {
            const getSelectedValue = document.querySelector(
                'input[name="age"]:checked');
            const numUnit = document.querySelector(
                'input[name="numUnit"]');

            const newUnit = await game.buyUnit(getSelectedValue.value, numUnit.value);
            game.draw();
            if (newUnit || game.phase === 5) {
                nextButton.innerHTML = "Next";
                // buyForm.style.display = 'none';
                errorMessage.style.display = 'none';
            } else {
                errorMessage.innerHTML = game.errorMessage;
                errorMessage.style.display = 'block';
            }
        }
    }, false);

    const curPi = Math.floor(Math.random()*2);
    console.log("curPi", curPi);
    game.init(true, curPi);
    game.startRound();

    // initial resize
    console.log("ratio", ratio);
    resize(window.visualViewport.width);

    demo.addEventListener('click', async function () {
        const speed = 10;
        const sleepBetweenPhases = 500 / speed;
        const sleepAttack = 750 / speed;
        const sleepMovement = 750 / speed;

        for (let i = 0; i < 1000; i++) {
            // buy unit
            if(game.winner){
                break;
            }
            if (game.getCurrentPlayer().units.length <= 2) {
                await game.buyUnit(["F", "K", "B", "H", "None"].sample(), Math.floor(Math.random() * game.getCurrentPlayer().gold / 2 + 1));
                game.draw();
                await sleep(sleepBetweenPhases)
            } else {
                game.phase = 4;
                await game.monsterTurn();
                game.phase = 5;
            }

            // move
            for (const unit of game.getCurrentPlayer().units) {
                if(unit.goldmine) {
                    continue;
                }
                const target = game.map.getPossibleMovementPerUnit(unit).sample();
                if (target) {
                    game.onClick(unit.tile);
                    game.draw();
                    await sleep(sleepMovement)
                    game.onClick(target);
                    game.draw();
                    await sleep(sleepMovement)
                }
            }

            // trigger Monsters
            game.phase = 6;
            game.draw();
            await sleep(sleepBetweenPhases)
            const monsterDens = game.map.getTriggerableMonsterDen(game.getCurrentPlayer());
            monsterDens.forEach(md => game.onClick(md));


            game.phase = 8;
            game.draw();
            await sleep(sleepBetweenPhases);

            // attack
            for (const unit of game.getCurrentPlayer().units) {
                const target = game.map.getPossibleFightsPerUnit(unit).sample();
                if (target) {
                    game.onClick(unit.tile);
                    game.draw();
                    await sleep(sleepAttack)
                    game.onClick(target.tile);
                    game.draw();
                    await sleep(sleepAttack)
                }
            }

            // annex gold mines
            game.phase = 10;
            const goldMines = game.map.getPossibleAnnexedGoldminesPerPlayer(game.getCurrentPlayer());
            goldMines.forEach(md => game.onClick(md));

            game.draw();
            game.startRound();
            game.draw();
            await sleep(sleepBetweenPhases);
        }

    });

    window.visualViewport.addEventListener('resize', (e) => {
        resize(e.target.width);
    });
}