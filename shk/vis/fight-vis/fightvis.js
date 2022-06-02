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
        const width = this.e.ctx.canvas.width;
        const height = this.e.ctx.canvas.height;
        const leftX = width * 0.1;
        const dBetween = width - 4 * leftX;
        const startY = height/6;

        this.units = [];
        this.units.push(...fightData.map((fd, plI) => {
            const attacksPerUnit = plI === 0 ? fd.rolls.length / fd.numBefore : fd.rolls.length / fd.numAfter;
            let rollIdx = 0;
            return range(fd.numBefore).map(idx => {
                    const rowLength = Math.ceil(Math.sqrt(fd.numBefore));
                    const y = Math.floor(idx/ rowLength);
                    const x = idx% rowLength;
                    const alreadyDamaged = fd.numBefore * fd.hpPerUnit - fd.hpBefore;
                    const curHP = idx === 0 ? fd.hpPerUnit - alreadyDamaged : fd.hpPerUnit;
                    const rolls = fd.rolls ? fd.rolls.slice(rollIdx, rollIdx+attacksPerUnit) : null;
                    rollIdx += attacksPerUnit;
                    return new FightvisUnit(
                        rolls,
                        leftX + spread(x * Fightvis.unitSize * 1.25, 0) + plI * dBetween,
                        startY + spread(y * Fightvis.unitSize * 1.25, 0) , 1 - 2 * plI,
                        fd.color, fd.type, fd.hpPerUnit,  curHP
                    )
                }
            )
        }));

        this.assignTargets(this.attackerIdx, false);
    }

    removeDeadUnits() {
        this.units = this.units.map(pl => pl.filter(u => u.alive));
    }


    assignTargets(plIdx, revenge=true) {
        let hitIdx = 0;
        let numUnitTargets = 0;
        const enemyIdx = (plIdx + 1) % 2;
        let enemyArray;
        if(!revenge && this.units[enemyIdx].length > 1){
            enemyArray = this.units[enemyIdx].shuffle().filter(u => u.dice.length === 0);
        }else{
            enemyArray = this.units[enemyIdx].shuffle();
        }
        console.log(plIdx, "enemyArray", enemyArray);
        if(enemyArray.length === 0){
            return;
        }
        this.units[plIdx].forEach(u => {
            u.dice.forEach(d => {
                if (d.roll && d.roll.h) {
                    d.target = enemyArray[hitIdx % enemyArray.length];
                    numUnitTargets++;
                    if(numUnitTargets >= d.target.totalHp){
                        hitIdx++;
                        numUnitTargets = 0;
                    }
                }
            });
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
        units.forEach(u => u.dice.forEach(d => u.throwDie(d)));
        for (let i = 0; i < 120; i++) {
            this.clear();
            this.forEachUnit(u => u.draw());
            await sleep(10);
            units.forEach(u => u.update());
        }
    }

    async homingDiceForUnits(units) {
        units.forEach(u => u.dice.forEach(d => u.throwDieAtTarget(d)));
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
        console.log("units", this.units)
        await this.throwDiceForUnits(this.units[this.attackerIdx]);
        await sleep(400);
        await this.homingDiceForUnits(this.units[this.attackerIdx]);

        if (this.fightData[1].rolls.length > 0) {
            const defenderIdx = (this.attackerIdx + 1) % 2;
            this.removeDeadUnits();
            this.assignTargets(defenderIdx);
            await this.throwDiceForUnits(this.units[defenderIdx]);
            await sleep(400);
            await this.homingDiceForUnits(this.units[defenderIdx]);
            await sleep(400);
        }else{
            console.log("skipping because no fight vis", this.fightData.defenderRolls, this.fightData)
        }
        await sleep(400);
    }

    static async playViz(attacker, defender, attackerRolls, defenderRolls,
                         prevDefNum, prevDefTotalHp, prevAttackerNum, prevAttackerTotalHp) {
        if(Fightvis.instance.disabled) {
            return
        }
        Fightvis.instance.running = true;
        const vis = Fightvis.instance;
        const apl = attacker.player;
        const dpl = defender.player;
        const attackerHpPerUnit = attacker.hp;
        const defenderHpPerUnit = defender.hp;
        console.log("StartFightVis", [
            {
                playerId: apl.id,
                color: apl.color,
                type: attacker.type,
                numBefore: prevAttackerNum,
                numAfter: attackerRolls.length,
                hpBefore: prevAttackerTotalHp,
                hpAfter: attacker.totalHp,
                hpPerUnit: attackerHpPerUnit,
                rolls: attackerRolls,
            }, {
                playerId: dpl.id,
                color: dpl.color,
                type: defender.type,
                numBefore: prevDefNum,
                numAfter: defenderRolls?.length,
                hpBefore: prevDefTotalHp,
                hpAfter: defender.totalHp,
                hpPerUnit: defenderHpPerUnit,
                rolls: defenderRolls
            }
        ], 0, defender.revenge)
        vis.startFightVis([
            {
                playerId: apl.id,
                color: apl.color,
                type: attacker.type,
                numBefore: prevAttackerNum,
                numAfter: attackerRolls.length,
                hpBefore: prevAttackerTotalHp,
                hpAfter: attacker.totalHp,
                hpPerUnit: attackerHpPerUnit,
                rolls: attackerRolls,
            }, {
                playerId: dpl.id,
                color: dpl.color,
                type: defender.type,
                numBefore: prevDefNum,
                numAfter: defenderRolls?.length,
                hpBefore: prevDefTotalHp,
                hpAfter: defender.totalHp,
                hpPerUnit: defenderHpPerUnit,
                rolls: defenderRolls
            }
        ], 0, defender.revenge);
        await vis.play();
        Fightvis.instance.running = false;
    }

}