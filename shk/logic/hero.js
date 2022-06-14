class Hero {
    constructor(player, tile, cost
        , reach
        , mov
        , hp
        , numAttacks
        , dmg
        , def
        , revenge
        , mobility, reg, onHeroDeath, respawnTime, lvl, epToNextLvl) {
        this.id = IdGen.get();
        State.a(new AddUnitToPlayerAction(this, player));
        State.a(new AddUnitToTileAction(this, tile));
        State.a(new UpdateEntityAction(this, {
            type: "H",
            cost: cost,
            reg: reg,
            reach: reach,
            num: 1,
            mov: mov,
            lvl: lvl,
            epToNextLvl: epToNextLvl,
            curExp: 0,
            hp: hp,
            numAttacks: numAttacks,
            dmg: dmg,
            def: def,
            revenge: revenge,
            mobility: mobility,
            alive: true,
            totalHp: hp,
            movedThisTurn: 0,
            attacksThisTurn: 0,
            onHeroDeath: onHeroDeath,
            respawnTime: respawnTime,
            goldmine: undefined,
        }));
    }

    setTile(tile) {
        State.a(new RemoveUnitFromTileAction(this, State.e(this).tile));
        State.a(new AddUnitToTileAction(this, tile));
        return tile;
    }

    gainExp(exp) {
        let curState = State.e(this);
        if (!curState.alive) {
            console.error("Hero cant gain exp while dead!", curState)
            return;
        }
        State.a(new UpdateEntityAction(this, (old) => ({
            curExp: old.curExp + exp,
        })));
        curState = State.e(this);
        if (curState.curExp >= curState.epToNextLvl && curState.lvl < 10) {
            State.a(new UpdateEntityAction(this, (old) => {
                const c = AssetManager.getHeroStatsByLvl(old.lvl + 1);

                return {
                    curExp: old.curExp + old.epToNextLvl,
                    lvl: old.lvl + 1,
                    epToNextLvl: c.ep,
                    reach: c.reach,
                    mov: c.mov,
                    hp: c.hp,
                    numAttacks: c.numAttacks,
                    dmg: c.dmg,
                    def: c.def,
                    reg: c.reg,
                    mobility: c.mobility,
                    respawnTime: c.respawnTime,
                }
            }));
            this.heal(2);
        }

    }

    heal(amount) {
        State.a(new UpdateEntityAction(this, (old) => ({
            totalHp: Math.min(old.hp, old.totalHp + amount),
        })));
    }

    reviveAt(freeTile) {
        State.a(new UpdateEntityAction(this, (old) => ({
            alive: true,
            totalHp: old.hp,
        })));
        this.setTile(freeTile);
    }

    takeDmg(amount) {
        const goldmine = State.getGoldmineByAnnexerUnit(this);
        if (amount > 0 && goldmine) {
            goldmine.reset();
        }
        State.a(new UpdateEntityAction(this, (old) => ({
            totalHp: old.totalHp - amount,
        })));
        let curState = State.e(this);
        if (curState.totalHp <= 0 && curState.alive) {
            State.a(new UpdateEntityAction(this, (old) => ({
                alive: false,
                curExp: 0,
            })));
            curState.onHeroDeath(this);
            return false;
        }
        return curState.alive;
    }

    getMovementLeftThisRound() {
        let curState = State.e(this);
        return curState.mov - curState.movedThisTurn;
    }

    toString() {
        let curState = State.e(this);
        if (curState.hp > curState.totalHp) {
            return curState.type + " (" + curState.totalHp + "/" + curState.hp + "hp " + curState.curExp + "/" + curState.epToNextLvl + "ep)";
        } else {
            return curState.type + " (" + curState.totalHp + "hp " + curState.curExp + "/" + curState.epToNextLvl + "ep)";
        }
    }

}