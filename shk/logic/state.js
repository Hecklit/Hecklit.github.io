class State {

    static i = new State();

    init(actions = []) {
        this.initialState = {
            entities: {},
            relations: {
                goldminePlayer: [],
                goldmineAnnexerUnit: [],
                goldmineTile: [],
                unitTile: [],
                unitPlayer: [],
                heroPlayer: [],
                mapTile: [],
                baseTilePlayer: [],
                playerActiveUnit: [],
                playerActiveBaseTile: [],
                gamePlayer: [],
                gameMonster: [],
                gameMap: []
            },
            fights: [],
            game: {

            }
        };
        this.actions = actions;
    }

    getCurrentState() {
        let state = this.initialState;
        for (const action of this.actions) {
            state = action.apply(state);
        }
        return state;
    }

    static e(entity) {
        const state = State.i.getCurrentState();
        return state.entities[entity.id];
    }

    static gameState() {
        const state = State.i.getCurrentState();
        return state.game;
    }

    static a(action) {
        State.i.actions.push(action);
    }

    static eq(a, b) {
        if (!'id' in a || !'id' in b) {
            throw 'Trying to compare objects that dont have an id'
        }
        return a.id === b.id;
    }

    static getSingleEntityFromRelation(relType, participantsType, participant) {
        const state = State.i.getCurrentState();
        const tiles = state.relations[relType].filter((rel) => participant.id === rel[participantsType].id);
        if (tiles.length > 1) {
            throw participantsType + " should only be associated to one or less " + relType
        }
        return tiles[0];
    }

    static getMatchingEntitiesFromRelation(relType, participantsType, participant) {
        const state = State.i.getCurrentState();
        return state.relations[relType].filter((rel) => participant.id === rel[participantsType].id);
    }

    static getTileByGoldmine(g) {
        return State.getSingleEntityFromRelation(
            'goldmineTile', 'goldmine', g);
    }

    static getGoldmineByTile(t) {
        return State.getSingleEntityFromRelation(
            'goldmineTile', 'tile', t);
    }

    static getTileByUnit(u) {
        return State.getSingleEntityFromRelation(
            'unitTile', 'unit', u);
    }

    static getUnitsOnTile(t) {
        const state = State.i.getCurrentState();
        return state.relations.unitTile.filter(({unit, tile}) => t.id === tile.id);
    }

    static getUnitsByPlayer(pl) {
        const state = State.i.getCurrentState();
        return state.relations.unitPlayer.filter(({unit, player}) => pl.id === player.id);
    }

    static getUnitsOnGoldmine(g) {
        const tile = State.getTileByGoldmine(g);
        return State.getUnitsOnTile(tile);
    }

    static getAnnexerUnitByGoldmine(g) {
        return State.getSingleEntityFromRelation(
            'goldmineAnnexerUnit', 'goldmine', g);
    }

    static getGoldmineByAnnexerUnit(u) {
        return State.getSingleEntityFromRelation(
            'goldmineAnnexerUnit', 'unit', u);
    }

    static getPlayerByUnit(u) {
        return State.getSingleEntityFromRelation(
            'unitPlayer', 'unit', u);
    }

    static getPlayerByGoldmine(g) {
        return State.getSingleEntityFromRelation(
            'goldminePlayer', 'goldmine', g);
    }

    static getAllTiles(m) {
        const state = State.i.getCurrentState();
        return state.relations.mapTile.filter(({map, tile}) => m.id === map.id);
    }

    static getTile(m ,x, y) {
        const tiles = State.getAllTiles(m);
        return tiles.filter(t => t.xi === x && t.yi === y)[0];
    }

    static onSameTile(u1, u2) {
        const tile1 = State.getTileByUnit(u1);
        const tile2 = State.getTileByUnit(u2);
        return tile1.id === tile2.id;
    }

    static getEnemiesOnSameTile(u) {
        const tile = State.getTileByUnit(u);
        const pl = State.getPlayerByUnit(u);
        return State.getUnitsOnTile(tile).filter(
            unit => State.getPlayerByUnit(unit).id !== pl.id
        );
    }

    static getPlayers() {
        const state = State.i.getCurrentState();
        return state.relations.gamePlayer;
    }

    static getMonsterPlayer(game) {
        return State.getSingleEntityFromRelation(
            'gameMonster', 'game', game);
    }

    static getMapByTile(tile) {
        return State.getSingleEntityFromRelation(
            'mapTile', 'tile', tile);
    }

    static getHeroByPlayer(player) {
        return State.getSingleEntityFromRelation(
            'heroPlayer', 'player', player);
    }

    static getPlayerByHero(hero) {
        return State.getSingleEntityFromRelation(
            'heroPlayer', 'hero', hero);
    }

    static getActiveBaseTileByPlayer(player) {
        return State.getSingleEntityFromRelation(
            'playerActiveBaseTile', 'player', player);
    }

    static getActiveUnitByPlayer(player) {
        return State.getSingleEntityFromRelation(
            'playerActiveUnit', 'player', player);
    }

    static getBaseTilesByPlayer(player) {
        return State.getMatchingEntitiesFromRelation(
            'baseTilePlayer', 'player', player);
    }

    static getMapByGame(game) {
        return State.getSingleEntityFromRelation(
            'gameMap', 'game', game);
    }

    static getGoldminesByPlayer(player) {
        return State.getMatchingEntitiesFromRelation(
            'goldminePlayer', 'player', player);
    }

}
