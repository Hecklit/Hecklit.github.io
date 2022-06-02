class AssetManager {

    static instance = new AssetManager();

    constructor() {
        this.doneLoading = false;
    }

    getAllMapNames() {
        return Object.values(this.mapData).map(m => ({
            name: m.name,
            displayName: m.displayName,
        }));
    }

    async loadAllData() {
        // fetch all Data
        this.mapData = await this.fetchAll('maps');
        this.units = await this.fetchAll('units');
        this.convertMobility(this.units);
        this.monsters = await this.fetchAll('monsters');
        this.convertMobility(this.monsters);
        this.doneLoading = true;
        console.log("Loaded", this.mapData)
    }

    async fetchJSON(url) {
        console.log("Fetching: " + url);
        return await fetch(url)
            .then(response => response.json())
    }

    convertMobility(elements) {
        Object.values(elements).forEach(e => {
            e.mobility = {
                "BthenA": MobileAttackType.BthenA,
                "BthenAthenB": MobileAttackType.BthenAthenB,
                "BorA": MobileAttackType.BorA,
                "AthenB": MobileAttackType.AthenB,
            }[e.mobility];
        })
    }

    async fetchAll(assetType) {
        const mapNames = await this.fetchJSON('assets/' + assetType + '/index.json');
        const mapData = await Promise.all(mapNames.map(async (name) => await this.fetchJSON('assets/' + assetType + '/' + name)));

        return mapData.reduce((acc, cur) => {
            acc[cur.name] = cur;
            return acc;
        }, {});
    }

    static getAllMonstersOfLevel(lvl) {
        return Object.values(AssetManager.instance.monsters).filter(m => m.lvl === lvl);
    }

    static getMonsterByName(name) {
        return Object.values(AssetManager.instance.monsters).filter(m => m.name === name)[0];
    }

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
        mobility: [
            MobileAttackType.BthenA, MobileAttackType.BthenA, MobileAttackType.BthenA,
            MobileAttackType.BthenA, MobileAttackType.BthenA, MobileAttackType.BthenA,
            MobileAttackType.BthenA, MobileAttackType.BthenA, MobileAttackType.BthenA,
            MobileAttackType.BthenA],
        respawnTime: [0, 0, 0, 0, 1, 1, 2, 2, 3, 3],
    };

    static getHeroStatsByLvl(lvl) {
        return Object.keys(AssetManager.heroStats).reduce((acc, key) => {
            acc[key] = AssetManager.heroStats[key][lvl - 1];
            return acc;
        }, {});
    }
}