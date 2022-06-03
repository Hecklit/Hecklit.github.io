class Ai {


    async playDemo(game) {
        Fightvis.instance.disabled = true;
        const speed = 6;
        const sleepBetweenPhases = 500 / speed;
        const sleepAttack = 750 / speed;
        const sleepMovement = 750 / speed;

        for (let i = 0; i < 100000; i++) {
            // buy unit
            if (game.winner) {
                break;
            }

            if (game.phase === 2) {
                let ut = ["F", "K", "B", "None"].sample();
                const troupsOfSameType = game.curP.units.filter(u => u.type === ut);
                const totalNumOfTroupsOfSameType = troupsOfSameType.reduce((acc, cur) => acc + cur.num, 0);
                let numUnit = Math.min(game.maxNumUnits[ut] - totalNumOfTroupsOfSameType, Math.floor(Math.random() * game.curP.gold / 2 + 1));
                if(troupsOfSameType.length > 0) {
                    const troup = troupsOfSameType.sample();
                    game.onClick(troup.tile);
                }

                if (!game.curP.hero.alive) {
                    ut = "H";
                    numUnit = 1;
                }
                const unit = game.takeNextStep(ut, numUnit);
                if (!unit) {
                    game.takeNextStep("None", 1);
                }
                await sleep(sleepBetweenPhases);

            }else if(game.phase === 5){

                for (const unit of game.curP.units) {
                    if (unit.goldmine) {
                        continue;
                    }
                    if (unit.mobility === MobileAttackType.BorA) {
                        if (Math.random() > 0.5) {
                            continue;
                        }
                    }
                    const target = game.map.getPossibleMovementPerUnit(unit).sample()?.t;
                    if (target) {
                        game.onClick(unit.tile);
                        await sleep(sleepMovement)
                        game.onClick(target);
                        await sleep(sleepMovement)
                    }
                }
                game.takeNextStep();
            } else if(game.phase === 6) {

                // trigger Monsters
                await sleep(sleepBetweenPhases)
                const monsterDens = game.map.getTriggerableMonsterDen(game.curP);
                monsterDens.forEach(md => {
                    const propability = 0.45 * md.monsterConfig.lvl;
                    if (Math.random() > propability) {
                        game.onClick(md)
                    }
                });
                game.takeNextStep();
                await sleep(sleepBetweenPhases);

            }else if(game.phase === 8){



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
                await sleep(sleepBetweenPhases);
            }else if(game.phase === 10){

                // annex gold mines
                game.phase = 10;
                const goldMines = game.map.getPossibleAnnexedGoldminesPerPlayer(game.curP);
                goldMines.forEach(md => game.onClick(md));

                game.startRound();
                await sleep(sleepBetweenPhases);
            }
        }
    }


    async playTurn(game, forPlayer) {
        Fightvis.instance.disabled = true;
        const speed = 3;
        const sleepBetweenPhases = 500 / speed;
        const sleepAttack = 750 / speed;
        const sleepMovement = 750 / speed;

        for (let i = 0; i < 100; i++) {
            if (game.curP.id !== forPlayer.id) {
                break;
            }
            // buy unit
            if (game.winner) {
                break;
            }

            if (game.phase === 2) {
                let ut = ["F", "K", "B", "None"].sample();
                const troupsOfSameType = game.curP.units.filter(u => u.type === ut);
                const totalNumOfTroupsOfSameType = troupsOfSameType.reduce((acc, cur) => acc + cur.num, 0);
                let numUnit = Math.min(game.maxNumUnits[ut] - totalNumOfTroupsOfSameType, Math.floor(Math.random() * game.curP.gold / 2 + 1));
                if(troupsOfSameType.length > 0) {
                    const troup = troupsOfSameType.sample();
                    game.onClick(troup.tile);
                }

                if (!game.curP.hero.alive) {
                    ut = "H";
                    numUnit = 1;
                }
                const unit = game.takeNextStep(ut, numUnit);
                if (!unit) {
                    game.takeNextStep("None", 1);
                }
                await sleep(sleepBetweenPhases);

            }else if(game.phase === 5){

                for (const unit of game.curP.units) {
                    if (unit.goldmine) {
                        continue;
                    }
                    if (unit.mobility === MobileAttackType.BorA) {
                        if (Math.random() > 0.5) {
                            continue;
                        }
                    }
                    const target = game.map.getPossibleMovementPerUnit(unit).sample()?.t;
                    if (target) {
                        game.onClick(unit.tile);
                        await sleep(sleepMovement)
                        game.onClick(target);
                        await sleep(sleepMovement)
                    }
                }
                game.takeNextStep();
            } else if(game.phase === 6) {

                // trigger Monsters
                await sleep(sleepBetweenPhases)
                const monsterDens = game.map.getTriggerableMonsterDen(game.curP);
                monsterDens.forEach(md => {
                    const propability = 0.45 * md.monsterConfig.lvl;
                    if (Math.random() > propability) {
                        game.onClick(md)
                    }
                });
                game.takeNextStep();
                await sleep(sleepBetweenPhases);

            }else if(game.phase === 8){



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
                await sleep(sleepBetweenPhases);
            }else if(game.phase === 10){

                // annex gold mines
                game.phase = 10;
                const goldMines = game.map.getPossibleAnnexedGoldminesPerPlayer(game.curP);
                goldMines.forEach(md => game.onClick(md));

                game.startRound();
                await sleep(sleepBetweenPhases);
            }
        }
        Fightvis.instance.disabled = false;
    }
}