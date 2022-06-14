class Monster {
    constructor(game, pl, name, lvl, gold, aiStrategy, tile, num
        , reach
        , mov
        , hp
        , numAttacks
        , dmg
        , def
        , revenge
        , mobility,
                epPerUnit, attackPrio) {
        this.id = IdGen.get();
        State.a(new AddUnitToPlayerAction(this, pl));
        State.a(new AddUnitToTileAction(this, tile));
        State.a(new UpdateEntityAction(this, {
            attackPrio,
            homeTile: tile,
            reach,
            num,
            mov,
            hp,
            numAttacks,
            dmg,
            def,
            revenge,
            mobility,
            alive: true,
            totalHp: num * hp,
            movedThisTurn: 0,
            attacksThisTurn: 0,
            name,
            type: name.split(" ").map(e => e[0]).join(""),
            lvl,
            gold,
            aiStrategy,
            cost: epPerUnit,
        }));

        // this.game = game;
    }

    static spawnMonster(c, tile, pl, game) {
        console.log("spawnMonster", c);
        const monster = new Monster(game, pl, c.name, c.lvl, c.gold, c.aiStrategy, tile, c.num,
            c.reach, c.mov, c.hp, c.numAttacks, c.dmg, c.def, c.revenge, c.mobility, c.EPperUnit, c.attackPrio);
        return monster;
    }

    takeDmg(amount) {
        State.a(new UpdateEntityAction(this, (old) => ({
            totalHp: old.totalHp - amount,
            num: Math.ceil(old.totalHp / old.hp),
        })));
        let curState = State.e(this);
        if (curState.totalHp <= 0 && curState.alive) {
            State.a(new UpdateEntityAction(this, (old) => ({
                alive: false,
            })));
            return false;
        }
        return curState.alive;
    }

    getMovementLeftThisRound() {
        let curState = State.e(this);
        return curState.mov - curState.movedThisTurn;
    }

    takeTurn(map, index, isMovementTurn, curP) {
        if (isMovementTurn) {
            return this.doMovementTurn(map, index, curP);
        } else {
            return this.doAttackTurn(map, index, curP);
        }
    }

    findTarget(map, curP) {
        // find closest target
        const tile = State.getTileByUnit(this);
        const player = State.getUnitsByPlayer(this);
        // TODO: Why is this range fix 4???
        const allTargets = map.getEnemiesInRange(tile, 4, player)
            .filter(u => State.getPlayerByUnit(u).id === curP.id);
        const closestTargets = allTargets.sort((a, b) => Map.dist(a.tile, b.tile));
        let target = null;
        let curState = State.e(this);
        curState.attackPrio.forEach(p => {
            if(target) {
                return;
            }
            const pTarget = closestTargets.filter(t => t.type === p)[0];
            if(pTarget){
                target = pTarget;
            }
        })
        return target;
    }

    doMovementTurn(map, index, curP) {
        let curState = State.e(this);
        if (curState.mobility === MobileAttackType.BthenA && index === 0) {
            const closestTarget = this.findTarget(map, curP);
            if (closestTarget)  {
                const tile = State.getTileByUnit(this);
                const targetTile = State.getTileByUnit(closestTarget);
                map.moveInDirection(this, tile, targetTile);
            }
            return false;
        }
    }

    doAttackTurn(map, index, curP) {
        let curState = State.e(this);
        if (curState.mobility === MobileAttackType.BthenA && index === 1) {
            const closestTarget = this.findTarget(map, curP);
            const tile = State.getTileByUnit(this);
            const targetTile = State.getTileByUnit(closestTarget);
            if (closestTarget && Map.dist(targetTile, tile) <= curState.reach) {
                map.fight(curState, closestTarget);
            }
            return true;
        }
    }

}