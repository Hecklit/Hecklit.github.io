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
        this.mapData = await this.fetchAllMaps();
        this.doneLoading = true;
        console.log("Loaded", this.mapData)
    }

    async fetchJSON(url) {
        console.log("Fetching: "+ url);
        return await fetch(url)
            .then(response => response.json())
    }

    async fetchAllMaps() {
        const mapNames =  await this.fetchJSON('assets/maps/index.json');
        const mapData = await Promise.all(mapNames.map(async (name) => await this.fetchJSON('assets/maps/'+name)));

        return mapData.reduce((acc, cur) => {
            acc[cur.name] = cur;
            return acc;
        }, {});
    }
}