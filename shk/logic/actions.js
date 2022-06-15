class UpdateEntityAction {
    constructor(unit, props) {
        this.unit = unit;
        this.props = props;
    }

    apply(state) {
        if (!this.unit || this.unit.id === undefined || this.unit.id === null) {
            debugger
            throw 'trying to update unit with no id';
        }
        let newState = state;
        if (!(this.unit.id in state.entities)) {
            newState = {
                ...newState,
                entities: {
                    ...newState.entities,
                    [this.unit.id]: {id: this.unit.id}
                }
            }
        }

        const newEntity = typeof this.props === 'function' ? this.props(newState.entities[this.unit.id]) : this.props;
        return {
            ...newState,
            entities: {
                ...newState.entities,
                [this.unit.id]: {
                    ...newState.entities[this.unit.id],
                    ...newEntity
                }
            }
        }
    }
}

class UpdateGameStateAction {
    constructor(props) {
        this.props = props;
    }

    apply(state) {
        const newEntity = typeof this.props === 'function' ? this.props({...state.game}) : this.props;
        return {
            ...state,
            game: {
                ...state.game,
                ...newEntity
            }
        }
    }
}

function addRelation(state, relType, relation) {
    Object.values(relation).forEach(val => {
        if(val === undefined) {
            console.error("Relation vals have to be defined " + relType);
            throw "IllegalArgument Exception"
        }
    })
    return {
        ...state,
        relations: {
            ...state.relations,
            [relType]: [
                ...state.relations[relType],
                relation,
            ]
        }
    }
}

function deleteRelation(state, relType, participantType, participant) {
    return {
        ...state,
        relations: {
            ...state.relations,
            [relType]: [
                ...state.relations[relType]
                    .filter(rel => rel[participantType].id !== participant.id)
            ]
        }
    }
}

function deleteSpecificRelation(state, relType, pt1, p1, pt2, p2) {
    return {
        ...state,
        relations: {
            ...state.relations,
            [relType]: [
                ...state.relations[relType]
                    .filter(rel => rel[pt1].id !== p1.id || rel[pt2].id !== p2.id)
            ]
        }
    }
}

class MakeAnnexerUnitAction {
    constructor(unit, goldmine) {
        this.unit = unit;
        this.goldmine = goldmine;
    }

    apply(state) {
        return addRelation(state, 'goldmineAnnexerUnit',
            {unit: this.unit, goldmine: this.goldmine});
    }
}

class DisownGoldmineAction {
    constructor(goldmine) {
        this.goldmine = goldmine;
    }

    apply(state) {
        return deleteRelation(state, 'goldminePlayer',
            'goldmine', this.goldmine);
    }
}

class RecordFightAction {
    constructor(fightData) {
        this.fightData = fightData;
    }

    apply(state) {
        return {
            ...state,
            fights: [
                ...state.fights,
                this.fightData
            ]
        }
    }
}

class OccupyGoldmineAction {
    constructor(goldmine, player) {
        this.goldmine = goldmine;
        this.player = player;
    }

    apply(state) {
        return addRelation(state, 'goldminePlayer',
            {player: this.player, goldmine: this.goldmine});
    }
}

class AddUnitToPlayerAction {
    constructor(unit, player) {
        this.unit = unit;
        this.player = player;
    }

    apply(state) {
        return addRelation(state, 'unitPlayer',
            {player: this.player, unit: this.unit});
    }
}

class AddMonsterToGameAction {
    constructor(monster, game) {
        this.monster = monster;
        this.game = game;
    }

    apply(state) {
        return addRelation(state, 'gameMonster',
            {game: this.game, monster: this.monster});
    }
}

class AddMapToGameAction {
    constructor(map, game) {
        this.map = map;
        this.game = game;
    }

    apply(state) {
        return addRelation(state, 'gameMap',
            {game: this.game, map: this.map});
    }
}

class AddPlayerToGameAction {
    constructor(player, game) {
        this.player = player;
        this.game = game;
    }

    apply(state) {
        return addRelation(state, 'gamePlayer',
            {game: this.game, player: this.player});
    }
}

class AddHeroToPlayerAction {
    constructor(hero, player) {
        this.hero = hero;
        this.player = player;
    }

    apply(state) {
        return addRelation(state, 'heroPlayer',
            {player: this.player, hero: this.hero});
    }
}

class AddUnitToTileAction {
    constructor(unit, tile) {
        this.unit = unit;
        this.tile = tile;
    }

    apply(state) {
        return addRelation(state, 'unitTile',
            {tile: this.tile, unit: this.unit});
    }
}

class AddBaseTileToPlayerAction {
    constructor(baseTile, player) {
        this.baseTile = baseTile;
        this.player = player;
    }

    apply(state) {
        return addRelation(state, 'baseTilePlayer',
            {player: this.player, baseTile: this.baseTile});
    }
}

class AddTileToGoldmineRelAction {
    constructor(goldmine, tile) {
        this.goldmine = goldmine;
        this.tile = tile;
    }

    apply(state) {
        return addRelation(state, 'goldmineTile',
            {tile: this.tile, goldmine: this.goldmine});
    }
}

class AddTileToMapAction {
    constructor(map, tile) {
        this.map = map;
        this.tile = tile;
    }

    apply(state) {
        return addRelation(state, 'mapTile',
            {tile: this.tile, map: this.map});
    }
}

class RemoveUnitFromTileAction {
    constructor(unit, tile) {
        this.unit = unit;
        this.tile = tile;
    }

    apply(state) {
        return deleteSpecificRelation(state, 'unitTile',
            'unit', this.unit, 'tile', this.tile);
    }
}

class RemoveUnitFromPlayerAction {
    constructor(unit, player) {
        this.unit = unit;
        this.player = player;
    }

    apply(state) {
        return deleteSpecificRelation(state, 'unitPlayer',
            'unit', this.unit, 'player', this.player);
    }
}

class RemoveAnnexerUnitAction {
    constructor(goldmine) {
        this.goldmine = goldmine;
    }

    apply(state) {
        return deleteRelation(state, 'goldmineAnnexerUnit',
            'goldmine', this.goldmine);
    }
}

class SetActiveBaseTileAction {
    constructor(activeBaseTile, player) {
        this.activeBaseTile = activeBaseTile;
        this.player = player;
    }

    apply(state) {
        const newState = deleteRelation(state, 'playerActiveBaseTile',
            'player', this.player);
        return addRelation(newState, 'playerActiveBaseTile', {
            activeBaseTile: this.activeBaseTile,
            player: this.player
        })
    }
}

class SetActiveUnitAction {
    constructor(activeUnit, player) {
        this.activeUnit = activeUnit;
        this.player = player;
    }

    apply(state) {
        const newState = deleteRelation(state, 'playerActiveUnit',
            'player', this.player);
        return addRelation(newState, 'playerActiveUnit', {
            activeBaseTile: this.activeUnit,
            player: this.player
        })
    }
}
