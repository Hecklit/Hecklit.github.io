class Ai {

    async playDemo(game) {
        Fightvis.instance.disabled = true;
        const speed = 6;
        const sleepBetweenPhases = 500 / speed;
        const sleepAttack = 750 / speed;
        const sleepMovement = 750 / speed;

        for (let i = 0; i < 1000; i++) {
            // buy unit
            if(game.winner){
                break;
            }
            if (game.curP.units.length <= 2) {
                await game.buyUnit(["F", "K", "B", "H", "None"].sample(), Math.floor(Math.random() * game.curP.gold / 2 + 1));
                await sleep(sleepBetweenPhases)
            } else {
                game.phase = 4;
                await game.monsterTurn();
                game.phase = 5;
            }

            // move
            for (const unit of game.curP.units) {
                if(unit.goldmine) {
                    continue;
                }
                if(unit.mobility === MobileAttackType.BorA) {
                    if(Math.random() > 0.5) {
                        continue;
                    }
                }
                const target = game.map.getPossibleMovementPerUnit(unit).sample().t;
                if (target) {
                    game.onClick(unit.tile);
                    await sleep(sleepMovement)
                    game.onClick(target);
                    await sleep(sleepMovement)
                }
            }

            // trigger Monsters
            game.phase = 6;
            await sleep(sleepBetweenPhases)
            const monsterDens = game.map.getTriggerableMonsterDen(game.curP);
            monsterDens.forEach(md => game.onClick(md));


            game.phase = 8;
            await sleep(sleepBetweenPhases);

            // attack
            for (const unit of game.curP.units) {
                const target = game.map.getPossibleFightsPerUnit(unit).sample();
                if (target) {
                    game.onClick(unit.tile);
                    await sleep(sleepAttack)
                    game.onClick(target.tile);
                    await sleep(sleepAttack)
                }
            }

            // annex gold mines
            game.phase = 10;
            const goldMines = game.map.getPossibleAnnexedGoldminesPerPlayer(game.curP);
            goldMines.forEach(md => game.onClick(md));

            game.startRound();
            await sleep(sleepBetweenPhases);
        }
    }
}