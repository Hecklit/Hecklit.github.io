
static gameConfig = (overrides = {}) => ({
    "Empty":
        Object.values({
                pg: 5,
                startUnits: [
                    {
                        type: "H",
                        lvl: "1",
                    }
                ],
                maxNumUnits: {
                    "F": 30,
                    "B": 20,
                    "K": 24
                },
                maxNumTroups: {
                    "F": 1,
                    "B": 1,
                    "K": 1
                },
                heroRevival: false,
                map: MapType.Empty,
                unitConfig: Config.unitConfig,
                ...overrides
            }
        ),
    "FixMini":
        Object.values({
                pg: 5,
                startUnits: [
                    {
                        type: "H",
                        lvl: "2",
                    }
                ],
                maxNumUnits: {
                    "F": 30,
                    "B": 20,
                    "K": 24
                },
                maxNumTroups: {
                    "F": 1,
                    "B": 1,
                    "K": 1
                },
                heroRevival: false,
                map: MapType.FixMini,
                unitConfig: Config.unitConfig,
                ...overrides
            }
        ),
    "Normal":
        Object.values({
                pg: 5,
                startUnits: [
                    {
                        type: "H",
                        lvl: "1",
                    }
                ],
                maxNumUnits: {
                    "F": 30,
                    "B": 20,
                    "K": 24
                },
                maxNumTroups: {
                    "F": 2,
                    "B": 1,
                    "K": 1
                },
                heroRevival: false,
                map: MapType.Normal,
                unitConfig: Config.unitConfig,
                ...overrides
            }
        ),
});


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