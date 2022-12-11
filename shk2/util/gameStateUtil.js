class GameStateUtil {
    static lastCacheStateIndex = -1;
    static stateCache = null;

    static getCurrentState(gameState, maxStateIndex=null) {
        const currentStateIndex = Math.min(
            maxStateIndex == null ? Number.MAX_VALUE : maxStateIndex,
            gameState.actions.length)
        if (GameStateUtil.lastCacheStateIndex === currentStateIndex) {
            return GameStateUtil.stateCache;
        }

        let actions;
        let newState = null;
        if (GameStateUtil.lastCacheStateIndex < currentStateIndex && GameStateUtil.stateCache != null) {
            actions = gameState.actions.slice(GameStateUtil.lastCacheStateIndex === -1 ? 0: GameStateUtil.lastCacheStateIndex, currentStateIndex + 1);
            newState  = {...GameStateUtil.stateCache,
                associations: {...GameStateUtil.stateCache.associations},
                actions: gameState.actions
            };

        } else {
            actions = gameState.actions.slice(0, currentStateIndex + 1);
            newState = {...gameState,
                associations: {...gameState.associations},
                actions: gameState.actions
            };
        }

        actions.forEach(a => {

            for (const path in a.diff.delete) {
                const toDelete = a.diff.delete[path];
                if (path === "associations.tileUnit") {
                    newState.associations.tileUnit = newState.associations.tileUnit.filter(
                        tU => !(tU.tileRef === toDelete.tileRef && tU.unitRef === toDelete.unitRef));

                }
            }
            for (const path in a.diff.create) {
                if (path === "associations.tileUnit") {
                    newState.associations.tileUnit = [...newState.associations.tileUnit,
                        a.diff.create[path]];
                }
            }
        });

        GameStateUtil.lastCacheStateIndex = currentStateIndex;
        GameStateUtil.stateCache = newState;
        return newState;
    }

    static getTileByRef(gameState, ref) {
        const tileWithRefList = gameState.map.tiles.filter(t => t.ref === ref);
        return tileWithRefList.length > 0 ? tileWithRefList[0] : null;
    }

    static getTileByCoords(gameState, x, y) {
        const tileWithRefList = gameState.map.tiles.filter(t => t.xi === x && t.yi === y);
        return tileWithRefList.length > 0 ? tileWithRefList[0] : null;
    }

    static getUnitByRef(gameState, ref) {
        const unitWithRefList = gameState.units.filter(u => u.ref === ref);
        return unitWithRefList.length > 0 ? unitWithRefList[0] : null;
    }

    static getActionByRef(gameState, ref) {
        const actionWithRefList = gameState.actions.filter(u => u.ref === ref);
        return actionWithRefList.length > 0 ? actionWithRefList[0] : null;
    }

    static getAllUnitsOnTileByRef(gameState, ref) {
        return gameState.associations.tileUnit
            .filter(uT => uT.tileRef === ref)
            .map(uT => GameStateUtil.getUnitByRef(gameState, uT.unitRef));
    }

    static getTileByUnitRef(gameState, ref) {
        const tileList = gameState.associations.tileUnit
            .filter(uT => uT.unitRef === ref)
            .map(uT => GameStateUtil.getTileByRef(gameState, uT.tileRef))

        if (tileList.length === 0) {
            throw new Error("Every unit should have a tile " + ref)
        }
        return tileList[0];
    }

    static getBasetilePlayer(gameState, ref) {
        const playerList = gameState.associations.basetilePlayer
            .filter(uT => uT.tileRef === ref)
            .map(uT => GameStateUtil.getPlayerByRef(gameState, uT.playerRef));

        if (playerList.length === 0) {
            return null;
        }
        return playerList[0];
    }

    static getPlayerByIndex(gameState, ofPlayer) {
        const player = gameState.players[ofPlayer];
        if(player){
            return player;
        }
        return null;
    }

    static getPlayerByRef(gameState, playerRef) {
        const playerList = gameState.players
            .filter(uT => uT.ref === playerRef)

        if (playerList.length === 0) {
            return null;
        }
        return playerList[0];
    }
}