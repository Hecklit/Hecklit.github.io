class Goldmine {
    constructor(tier) {
        this.id = IdGen.get();

        State.a(new UpdateEntityAction(this, {
            tier,
            roundsTillAnnexed: 2,
            annexProcessStarted: false,
        }));
    }

    startOccupation(unit) {
        const unitTile = State.getTileByUnit(unit);
        const goldMineTile = State.getTileByGoldmine(this);
        const unitsOnGoldmine = State.getUnitsOnTile(goldMineTile);
        if ((unit.num > 1 || unit.type === "H")
            && State.eq(unitTile, goldMineTile)
            && unitsOnGoldmine.length === 1) {

            if (unit.type === "K") {
                State.a(new UpdateEntityAction(unit,
                    {
                        totalHp: unit.num % unit.totalHp === 0 ? unit.totalHp - 2 : unit.totalHp - 1,
                        num: unit.num - 1,
                    }));
            } else if (["F", "B"].includes(unit.type)) {
                State.a(new UpdateEntityAction(unit,
                    {
                        totalHp: unit.totalHp - 1,
                        num: unit.num - 1,
                    }));
            }

            // mark unit as annexing
            State.a(new MakeAnnexerUnitAction(unit, this));
            State.a(new UpdateEntityAction(this,
                {
                    roundsTillAnnexed: 2,
                    annexProcessStarted: true,
                }));
        }
    }

    reset() {
        State.a(new DisownGoldmineAction(this));
        State.a(new UpdateEntityAction(this,
            {
                roundsTillAnnexed: 2,
                annexProcessStarted: false,
            }));
        State.a(new RemoveAnnexerUnitAction(this));
    }

    tickRound() {
        const unitsOnGoldmine = State.getUnitsOnGoldmine(this);
        if (unitsOnGoldmine.length > 1) {
            this.reset();
            return false;
        }
        State.a(new UpdateEntityAction(this,
            (old) => ({
                roundsTillAnnexed: old.roundsTillAnnexed - 1,
            })));
        if (State.e(this).roundsTillAnnexed <= 0) {
            // annex happened
            State.a(new UpdateEntityAction(this,
                {
                    annexProcessStarted: false,
                }));
            State.a(new RemoveAnnexerUnitAction(this));
            const annexerUnit = State.getAnnexerUnitByGoldmine(this);
            const annexPlayer = State.getPlayerByUnit(annexerUnit);
            State.a(new OccupyGoldmineAction(this, annexPlayer));
        }
    }

    getGold() {
        return State.e(this).tier;
    }


}