function onTestsDone() {
    let canvas = document.getElementById("can");
    canvas.width = 1200;
    canvas.height = 350;
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
        console.log(e);

        const x = e.clientX,
            y = e.clientY;
        console.log(x, y);

        game.debugMarker = [x, y];
        game.onClick(x, y);
        game.draw();
    }, false);

    const nextButton = document.getElementById("next");
    nextButton.addEventListener('click', function () {
        console.log("onNext", game.phase);
        if (game.phase === 5) {
            console.log("startRound");
            game.startRound();
            game.draw();
        }
    }, false);

    const buyButton = document.getElementById("buy");
    buyButton.addEventListener('click', function (e) {
        e.preventDefault();
        var getSelectedValue = document.querySelector(
            'input[name="age"]:checked');
        var numUnit = document.querySelector(
            'input[name="numUnit"]');
        console.log(getSelectedValue.value);

        game.buyUnit(getSelectedValue.value, numUnit.value);
        game.draw();
    }, false);

    game.init();
    game.startRound();
    game.draw();
}