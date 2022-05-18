class Fightvis {
    e;

    constructor() {
        this.running = false;
        this.fightData = null;
        this.units = [];
    }

    static unitSize = 20;

    static instance = new Fightvis();

    static configureDrawEngine(drawEngine) {
        Fightvis.instance.e = drawEngine;
    }

    startFightVis(fightData, attackerIdx, revenge) {
        const maxUnitSize = Math.max(fightData[0].numBefore, fightData[1].numBefore);
        Fightvis.unitSize = Math.min(this.e.ctx.canvas.width / maxUnitSize, 50);

        this.attackerIdx = attackerIdx;
        this.revenge = revenge;
        this.fightData = fightData;
        this.running = true;
        const width = this.e.ctx.canvas.width;
        const height = this.e.ctx.canvas.height;
        const leftX = width * 0.1;
        const dBetween = width - 4 * leftX;
        const startY = height/6;

        this.units = [];
        this.units.push(...fightData.map((fd, plI) => range(fd.numBefore).map(idx => {
            const rowLength = Math.ceil(Math.sqrt(fd.numBefore));
            const y = Math.floor(idx/ rowLength);
            const x = idx% rowLength;
            return new FightvisUnit(
                fd.rolls ? fd.rolls[idx] : null,
                leftX + spread(x * Fightvis.unitSize * 1.25, 0) + plI * dBetween,
                startY + spread(y * Fightvis.unitSize * 1.25, 0) , 1 - 2 * plI,
                    fd.color, fd.type
                )
            }
        )));

        this.assignTargets(this.attackerIdx);
    }

    removeDeadUnits() {
        this.units = this.units.map(pl => pl.filter(u => u.alive));
    }


    assignTargets(plIdx) {
        let hitIdx = 0;
        const enemyIdx = (plIdx + 1) % 2;
        const enemyArray = this.units[enemyIdx].shuffle();
        console.log(this.units, plIdx, this.units[plIdx])
        this.units[plIdx].forEach(u => {
            if (u.roll && u.roll.h) {
                u.target = enemyArray[hitIdx % this.units[enemyIdx].length];
                hitIdx++;
            }
        })
    }

    forEachUnit(func) {
        this.units.forEach(pl => pl.forEach(func));
    }

    clear() {
        this.e.ctx.fillStyle = "gray";
        this.e.ctx.fillRect(0, 0, 10000, 10000);
    }

    async throwDiceForUnits(units) {
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

    static async playViz(au, du, prevNum, arolls, drolls) {
        if(Fightvis.instance.disabled) {
            return
        }
        const vis = Fightvis.instance;
        const apl = au.player;
        const dpl = du.player;
        console.log("StartFightVis", [
            {
                playerId: apl.id,
                color: apl.color,
                type: au.type,
                numBefore: prevNum,
                numAfter: arolls.length,
                rolls: arolls
            }, {
                playerId: dpl.id,
                color: dpl.color,
                type: du.type,
                numBefore: prevNum,
                numAfter: drolls?.length,
                rolls: drolls
            }
        ], 0, du.revenge)
        vis.startFightVis([
            {
                playerId: apl.id,
                color: apl.color,
                type: au.type,
                numBefore: prevNum,
                numAfter: arolls.length,
                rolls: arolls
            }, {
                playerId: dpl.id,
                color: dpl.color,
                type: du.type,
                numBefore: prevNum,
                numAfter: drolls?.length,
                rolls: drolls
            }
        ], 0, du.revenge);
        await vis.play();
    }

    static async demo(au = 13, eu = 7) {
        console.log("testKnightsCanAnnexGoldmine");
        const vis = Fightvis.instance;
        vis.startFightVis([
            {
                playerId: "Jonas",
                color: "red",
                type: "F",
                numBefore: au,
                numAfter: 4,
                rolls: range(au).map(() => {
                    const n = range(7, 1).sample();
                    return {n, h: n > 4};
                })
            }, {
                playerId: "Jakob",
                color: "blue",
                type: "K",
                numBefore: eu,
                numAfter: 2,
                rolls: range(eu).map(() => {
                    const n = range(7, 1).sample();
                    return {n, h: n > 3};
                }),
            }
        ], 0, true);
        await vis.play();
    }

}