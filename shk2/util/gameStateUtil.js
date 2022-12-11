class GameStateUtil {
    static lastCacheStateIndex = -1;
    static stateCache = null;
    static maxStateIndex = null

    static getCurrentState(gameState) {
        const currentStateIndex = Math.min(
            GameStateUtil.maxStateIndex == null ? Number.MAX_VALUE : GameStateUtil.maxStateIndex,
            gameState.actions.length)
        if (GameStateUtil.lastCacheStateIndex === currentStateIndex) {
            return GameStateUtil.stateCache;
        }

        let actions;
        let newState = null;
        if (GameStateUtil.lastCacheStateIndex < currentStateIndex && GameStateUtil.stateCache != null) {
            actions = gameState.actions.slice(GameStateUtil.lastCacheStateIndex === -1 ? 0: GameStateUtil.lastCacheStateIndex, currentStateIndex + 1);
            newState  = {...GameStateUtil.stateCache, associations: {...GameStateUtil.stateCache.associations}};

        } else {
            actions = gameState.actions.slice(0, currentStateIndex + 1);
            newState = {...gameState, associations: {...gameState.associations}};
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
        const currentState = GameStateUtil.getCurrentState(gameState);
        const tileWithRefList = currentState.map.tiles.filter(t => t.ref === ref);
        return tileWithRefList.length > 0 ? tileWithRefList[0] : null;
    }

    static getTileByCoords(gameState, x, y) {
        const currentState = GameStateUtil.getCurrentState(gameState);
        const tileWithRefList = currentState.map.tiles.filter(t => t.xi === x && t.yi === y);
        return tileWithRefList.length > 0 ? tileWithRefList[0] : null;
    }

    static getUnitByRef(gameState, ref) {
        const currentState = GameStateUtil.getCurrentState(gameState);
        const unitWithRefList = currentState.units.filter(u => u.ref === ref);
        return unitWithRefList.length > 0 ? unitWithRefList[0] : null;
    }

    static getActionByRef(gameState, ref) {
        const currentState = GameStateUtil.getCurrentState(gameState);
        const actionWithRefList = currentState.actions.filter(u => u.ref === ref);
        return actionWithRefList.length > 0 ? actionWithRefList[0] : null;
    }

    static getAllUnitsOnTileByRef(gameState, ref) {
        const currentState = GameStateUtil.getCurrentState(gameState);
        return currentState.associations.tileUnit
            .filter(uT => uT.tileRef === ref)
            .map(uT => GameStateUtil.getUnitByRef(gameState, uT.unitRef));
    }

    static getTileByUnitRef(gameState, ref) {
        const currentState = GameStateUtil.getCurrentState(gameState);
        const tileList = currentState.associations.tileUnit
            .filter(uT => uT.unitRef === ref)
            .map(uT => GameStateUtil.getTileByRef(gameState, uT.tileRef))

        if (tileList.length === 0) {
            throw new Error("Every unit should have a tile " + ref)
        }
        return tileList[0];

    }

    static getTileUnitPath(gameState, tileRef, unitRef) {
        const currentState = GameStateUtil.getCurrentState(gameState);
        const index = currentState.associations.tileUnit.findIndex(
            a => a.tileRef === tileRef && a.unitRef === unitRef);

        return "associations.tileUnit." + index;
    }
}