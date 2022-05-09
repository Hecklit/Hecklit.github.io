function onTestsDone() {
    let canvas = document.getElementById("can");
    canvas.width = 1200;
    canvas.height = 360;
    ctx = canvas.getContext("2d");

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

    const nextButton = document.getElementById("next");
    nextButton.addEventListener('click', function () {
        console.log("onNext", game.phase);
        if (game.phase === 8) {
            console.log("startRound");
            game.startRound();
            game.draw();
            nextButton.innerHTML = "Buy";
        }
        else if (game.phase === 5) {
            game.phase = 8;
            game.draw();
        }
        else if (game.phase === 2) {
            const getSelectedValue = document.querySelector(
                'input[name="age"]:checked');
            const numUnit = document.querySelector(
                'input[name="numUnit"]');

            game.buyUnit(getSelectedValue.value, numUnit.value);
            game.draw();
            nextButton.innerHTML = "Next";
        }
    }, false);

    game.init();
    game.startRound();
    game.draw();
}