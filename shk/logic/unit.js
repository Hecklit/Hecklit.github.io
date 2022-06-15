class Unit {
    constructor(player, tile, type, num, cost
        , reach
        , mov
        , hp
        , numAttacks
        , dmg
        , def
        , revenge
        , mobility) {
        this.id = IdGen.get();
        State.a(new AddUnitToPlayerAction(this, player));
        State.a(new AddUnitToTileAction(this, tile));
        State.a(new UpdateEntityAction(this, {
            type: type,
            cost: cost,
            reach: reach,
            num: num,
            mov: mov,
            hp: hp,
            numAttacks: numAttacks,
            dmg: dmg,
            def: def,
            revenge: revenge,
            mobility: mobility,
            alive: true,
            totalHp: num * hp,
            movedThisTurn: 0,
            attacksThisTurn: 0,
        }));
    }

    takeDmg(amount) {
        const goldmine = State.getGoldmineByAnnexerUnit(this);
        if (amount > 0 && goldmine) {
            goldmine.reset();
        }
        State.a(new UpdateEntityAction(this, (old) => ({
            totalHp: old.totalHp - amount,
            num: Math.ceil(old.totalHp / old.hp)
        })));
        let curState = State.e(this);
        if (curState.totalHp <= 0 && curState.alive) {
            State.a(new UpdateEntityAction(this, {
                alive: false,
            }));
            return false;
        }
        return curState.alive;
    }

    recruitNewUnits(num) {
        State.a(new UpdateEntityAction(this, (old) => ({
            num: old.num + num,
            totalHp: old.totalHp + num * old.hp
        })));
    }

    getMovementLeftThisRound() {
        let curState = State.e(this);
        return curState.mov - curState.movedThisTurn;
    }

    toString() {
        let curState = State.e(this);
        if (curState.hp > curState.num) {
            if (curState.hp > curState.totalHp) {
                return curState.type + " " + curState.num + " (HP " + curState.totalHp + "/" + curState.hp +  ")";
            } else {
                return curState.type + " " + curState.num + " (HP " + curState.totalHp + ")";
            }
        } else {
            return curState.type + " " + curState.num;
        }
    }

}