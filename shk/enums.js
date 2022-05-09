
// enums
class MapType {
    static FixMini = new MapType('FixMini');
    static Small = new MapType('Small');
    static Normal = new MapType('Normal');
    static Big = new MapType('Big');
    static Giant = new MapType('Giant');

    constructor(name) {
        this.name = name;
    }
    toString() {
        return `MapType.${this.name}`;
    }
}

class UnitType {
    static F = new UnitType('F');
    static B = new UnitType('B');
    static K = new UnitType('K');

    constructor(name) {
        this.name = name;
    }
    toString() {
        return `UnitType.${this.name}`;
    }
}

class MobileAttackType {
    static BthenA = new MobileAttackType('BthenA');
    static BorA = new MobileAttackType('BorA');
    static AthenB = new MobileAttackType('AthenB');

    constructor(name) {
        this.name = name;
    }
    toString() {
        return `MobileAttackType.${this.name}`;
    }
}