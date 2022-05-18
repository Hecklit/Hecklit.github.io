class Config {

    static monsters = [
        {
            name: "Einfache Goblins",
            lvl: 1,
            gold: 1,
            reach: 0,
            mov: 2,
            hp: 1,
            numAttacks: 1,
            dmg: 4,
            def: 2,
            revenge: true,
            mobility: MobileAttackType.BthenA,
            num: 4,
            EPperUnit: 1,
            attackPrio: ['F', 'B', 'K', 'H'],
            reg: 0,
            aiStrategy: AIStrategyType.AttackOrIdle
        },
        {
            name: "Troll",
            lvl: 2,
            gold: 10,
            reach: 0,
            mov: 3,
            hp: 5,
            numAttacks: 5,
            dmg: 7,
            def: 3,
            revenge: true,
            mobility: MobileAttackType.BthenA,
            num: 1,
            EPperUnit: 1,
            attackPrio: ['K', 'B', 'H', 'F'],
            reg: 0,
            aiStrategy: AIStrategyType.AttackOrIdle
        },
    ]

    static getAllMonstersOfLevel(lvl) {
        return Config.monsters.filter(m => m.lvl === lvl);
    }

    static getMonsterByName(name) {
        return Config.monsters.filter(m => m.name === name)[0];
    }

    static unitConfig = {
        "F": {
            cost: 2,
            reach: 0,
            mov: 2,
            hp: 1,
            numAttacks: 1,
            dmg: 5,
            def: 2,
            revenge: true,
            mobility: MobileAttackType.BthenA,
        },
        "B": {
            cost: 3,
            reach: 4,
            mov: 2,
            hp: 1,
            numAttacks: 1,
            dmg: 5,
            def: 2,
            revenge: false,
            mobility: MobileAttackType.BorA,
        },
        "K": {
            cost: 5,
            reach: 0,
            mov: 3,
            hp: 2,
            numAttacks: 1,
            dmg: 6,
            def: 3,
            revenge: true,
            mobility: MobileAttackType.BthenA,
        },

    };

    static heroStats = {
        lvl: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        ep: [0, 10, 14, 20, 28, 40, 54, 70, 90, 120],
        reach: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        mov: [2, 3, 3, 3, 3, 3, 3, 3, 4, 4],
        hp: [4, 5, 6, 7, 8, 10, 12, 14, 17, 20],
        numAttacks: [2, 2, 3, 3, 4, 5, 6, 7, 8, 10],
        dmg: [5, 5, 5, 6, 6, 6, 6, 6, 7, 7],
        def: [2, 2, 3, 3, 3, 3, 3, 4, 4, 4],
        reg: [1, 1, 1, 1, 2, 2, 3, 3, 4, 5],
        mobility: [MobileAttackType.BthenA, MobileAttackType.BthenA, MobileAttackType.BthenA, MobileAttackType.BthenA, MobileAttackType.BthenA, MobileAttackType.BthenA, MobileAttackType.BthenA, MobileAttackType.BthenA, MobileAttackType.BthenA, MobileAttackType.BthenA],
        respawnTime: [0, 0, 0, 0, 1, 1, 2, 2, 3, 3],
    };

    static getHeroStatsByLvl(lvl) {
        return Object.keys(Config.heroStats).reduce((acc, key) => {
            acc[key] = Config.heroStats[key][lvl - 1];
            return acc;
        }, {});
    }


}