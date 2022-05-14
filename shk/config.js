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
        }
    ]
    static getAllMonstersOfLevel(lvl) {
        return Config.monsters.filter(m => m.lvl === lvl);
    }
    static getMonsterByName(name) {
        return Config.monsters.filter(m => m.name === name)[0];
    }


}