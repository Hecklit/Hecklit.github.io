
class Player {
    constructor(id, baseTiles, color, onHeroDeath, startUnits) {
        this.id = id;
        State.a(new UpdateEntityAction(this, {
            gold: 0,
            color: color,
            heroDeaths: 0,
        }));
        State.a(new SetActiveBaseTileAction(this.getFreeBaseTiles()[0], this));

        startUnits.forEach(unit => {
            if (unit.type === "H") {
                const hc = AssetManager.getHeroStatsByLvl(unit.lvl);
                const hero = new Hero(this, this.getFreeBaseTiles()[0], hc.ep, hc.reach,
                    hc.mov, hc.hp, hc.numAttacks, hc.dmg, hc.def, true, hc.mobility, hc.reg, (hero) => {
                        onHeroDeath(hero);
                    }, hc.respawnTime, hc.lvl, hc.ep);
                State.a(new AddHeroToPlayerAction(hero, this));
                State.a(new AddUnitToPlayerAction(hero, this));
                State.a(new UpdateEntityAction(this, {
                    turnsTillHeroRes: 0,
                }));
            }
        })
    }

    startHeroRevive(cost) {
        State.a(new UpdateEntityAction(this, old => ({
            gold: old.gold - cost,
            turnsTillHeroRes: State.getHeroByPlayer(this).respawnTime
        })));
    }

    tryHeroRespawn() {
        const curState = State.e(this);
        const activeBaseTile = State.getActiveBaseTileByPlayer(this);
        const hero = State.getHeroByPlayer(this);
        if (curState.turnsTillHeroRes <= 0 && activeBaseTile) {
            hero.reviveAt(activeBaseTile);
            State.a(new AddUnitToPlayerAction(hero, this));
        } else {
            State.a(new UpdateEntityAction(this, old => ({
                turnsTillHeroRes: old.turnsTillHeroRes - 1
            })));
        }
    }

    onEnemiesKilled(enemyUnit, numKilled) {
        const hero = State.getHeroByPlayer(this);
        if (!hero) {
            return;
        }
        const heroTile = State.getTileByUnit(hero);
        const heroWasInReach = (hero.alive && Map.dist(heroTile, enemyUnit.tile) <= hero.mov);
        if (heroWasInReach) {

            const expEarned = enemyUnit.cost * numKilled;
            hero.gainExp(expEarned);
            console.log(this.id, " Hero earned ", expEarned, " EXP");
        }
    }

    getFreeBaseTiles() {
        return State.getBaseTilesByPlayer(this).filter(b => !b.hasPlayerOnIt(this));
    }

    buyUnit(t, n, cost
        , reach
        , mov
        , hp
        , numAttacks
        , dmg
        , def
        , revenge
        , mobility) {
        State.a(new UpdateEntityAction(this, old => ({
            gold: old.gold - cost,
        })));
        const activeBaseTile = State.getActiveBaseTileByPlayer(this);
        const newUnit = this.spawnUnit(activeBaseTile, t, n, cost
            , reach
            , mov
            , hp
            , numAttacks
            , dmg
            , def
            , revenge
            , mobility);
        State.a(new SetActiveUnitAction(newUnit, this));
        return newUnit;
    }

    spawnUnit(tile, t, n, cost
        , reach
        , mov
        , hp
        , numAttacks
        , dmg
        , def
        , revenge
        , mobility) {
        const newUnit = new Unit(this, tile, t, n, cost
            , reach
            , mov
            , hp
            , numAttacks
            , dmg
            , def
            , revenge
            , mobility);
        State.a(new AddUnitToPlayerAction(newUnit, this));
        return newUnit;
    }

    hasNoUnitsThatCanStillAttack(game) {
        const units = State.getUnitsByPlayer(this);
        return units.filter(u => !game.cantAttackAnymore(u)).length === 0
    }
}