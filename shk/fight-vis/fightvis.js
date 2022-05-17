class Fightvis {

    constructor() {
        this.running = false;
        this.fightData = null;
        this.units = [];
    }

    static unitSize = 35;

    static instance = new Fightvis();

    startFightVis(fightData, attackerIdx, revenge) {
        this.attackerIdx = attackerIdx;
        this.revenge = revenge;
        this.fightData = fightData;
        this.running = true;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const leftX = width * 0.1;
        const dBetween = width - 3 * leftX;
        const centerY = height/2;
        const deviationY = height/2;

        this.units = [];
        this.units.push(...fightData.map((fd, plI) => range(fd.numBefore).map((i, idx) => new FightvisUnit(
                fd.rolls[idx],
                spread(leftX + plI * dBetween, leftX * 0.7),
                spread(centerY, deviationY), 1 - 2 * plI,
                fd.color, fd.type
            )
        )));

        this.assignTargets(this.attackerIdx);
        // this.units.forEach((pl, i) => {
        //     let hitIdx = 0;
        //     pl.forEach(u => {
        //         if(u.roll.h) {
        //             u.target = this.units[(i + 1) % 2][hitIdx % this.units[(i + 1) % 2].length];
        //             hitIdx++;
        //         }
        //     })
        // })
    }

    removeDeadUnits() {
        this.units = this.units.map(pl => pl.filter(u => u.alive));
    }

    assignTargets(plIdx) {
        let hitIdx = 0;
        const enemyIdx = (plIdx + 1) % 2;
        this.units[plIdx].forEach(u => {
            if (u.roll.h) {
                u.target = this.units[enemyIdx][hitIdx % this.units[enemyIdx].length];
                hitIdx++;
            }
        })
    }

    forEachUnit(func) {
        this.units.forEach(pl => pl.forEach(func));
    }

    clear() {
        ctx.fillStyle = "gray";
        ctx.fillRect(0, 0, 10000, 10000);
    }

    async throwDiceForUnits(units) {
        console.log("throwDiceForUnits", units);
        units.forEach(u => u.throwDice());
        for (let i = 0; i < 120; i++) {
            this.clear();
            this.forEachUnit(u => u.draw());
            await sleep(10);
            units.forEach(u => u.update());
        }
    }

    async homingDiceForUnits(units) {
        units.forEach(u => u.throwDiceAtTarget());
        for (let i = 0; i < 100; i++) {
            this.clear();
            this.forEachUnit(u => u.draw());
            await sleep(10);
            units.forEach(u => u.updateHomingMissiles());
        }
    }

    async play() {
        this.clear();
        this.forEachUnit(u => u.draw());
        await this.throwDiceForUnits(this.units[this.attackerIdx]);
        await sleep(400);
        await this.homingDiceForUnits(this.units[this.attackerIdx]);

        if (this.revenge) {
            const defenderIdx = (this.attackerIdx + 1) % 2;
            this.removeDeadUnits();
            this.assignTargets(defenderIdx);
            await this.throwDiceForUnits(this.units[defenderIdx]);
            await sleep(400);
            await this.homingDiceForUnits(this.units[defenderIdx]);
        }
    }

}