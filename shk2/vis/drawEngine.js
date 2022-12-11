actionRef = 1;

class DrawEngine {

    constructor(canvas, gameState) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.tilePositions = [];
        this.tileSize = 45;
        this.gameState = gameState;
        this.selectedUnitRef = null;
        canvas.addEventListener('click', this.onCanvasClick.bind(this), false);

        this.actions = document.getElementById("actions");
        this.output = document.getElementById("output");
        this.actions.oninput = () => {
            console.log(this.actions.value, this.actions.selectedIndex)
            const a = GameStateUtil.getActionByRef(this.gameState, this.actions.value);
            this.output.innerHTML = this.output.innerHTML = JSON.stringify(a.diff, null, 2);

            if (this.actions.selectedIndex === this.actions.options.length - 1) {
                this.drawState();
            } else {
                this.drawState(this.actions.selectedIndex);
            }

        };
        this.updateUi();
    }

    onCanvasClick(e) {
        const x = e.clientX,
            y = e.clientY;
        const tile = this.mapPosToTile(x, y);
        const currentState = GameStateUtil.getCurrentState(this.gameState);
        const unit = GameStateUtil.getAllUnitsOnTileByRef(currentState, tile.ref);

        if (this.selectedUnitRef == null) {
            if (unit.length > 0) {
                this.selectedUnitRef = unit[0].ref;
            }
        } else {
            const oldTile = GameStateUtil.getTileByUnitRef(currentState, this.selectedUnitRef);
            const selectedUnit = GameStateUtil.getUnitByRef(currentState, this.selectedUnitRef);

            const action = {
                "ref": "action." + (actionRef++),
                "type": "moveUnit",
                "actorRef": "player.1",
                "timestamp": Date.now(),
                "diff": {
                    "create": {
                        "associations.tileUnit": {
                            "tileRef": tile.ref,
                            "unitRef": selectedUnit.ref
                        }
                    },
                    "delete": {
                        "associations.tileUnit": {
                            "tileRef": oldTile.ref,
                            "unitRef": selectedUnit.ref
                        }
                    }
                }
            };

            if (JSON.stringify(action.diff.create) !== JSON.stringify(action.diff.delete)) {
                currentState.actions.push(action);
            }
        }

        this.drawState();
        this.updateUi();
    }

    mapPosToTile(x, y) {
        const distances = this.tilePositions.map(tP => {
            const dx = tP.cx - x;
            const dy = tP.cy - y;
            return {
                d: dx * dx + dy * dy,
                tile: tP.tile
            }
        }).sort((a, b) => a.d - b.d);
        return distances[0].tile;
    }

    updateUi() {
        this.output.innerHTML = "";
        this.actions.innerHTML = "";
        this.gameState.actions.forEach(a => {
            const option = document.createElement("option");
            option.text = `${a.actorRef} ${a.type}`;
            option.value = a.ref;
            this.output.innerHTML = JSON.stringify(a.diff, null, 2)
            this.actions.add(option);
        });
    }

    drawState(maxStateIndex = null) {

        this.fillRect(0, 0, this.canvas.width, this.canvas.height, "gray");
        const currentState = GameStateUtil.getCurrentState(this.gameState, maxStateIndex);

        const map = currentState.map;

        map.tiles.forEach(t => {
            const {xPos, yPos} = this.drawTile(t);
            this.tilePositions.push({
                cx: xPos,
                cy: yPos,
                tile: t
            });

            const unitsOnTile = GameStateUtil.getAllUnitsOnTileByRef(currentState, t.ref);
            this.drawUnitsAt(unitsOnTile, xPos, yPos);
        });
    }

    drawTile(tile) {
        const currentState = GameStateUtil.getCurrentState(this.gameState); // TODO: make this take the current state
        const basetilePlayer = GameStateUtil.getBasetilePlayer(currentState, tile.ref);
        const goldmine = GameStateUtil.getGoldmineByTileRef(currentState, tile.ref);
        const monsterDen = GameStateUtil.getMonsterDenByTileRef(currentState, tile.ref);

        const xPos = tile.xi * this.tileSize;
        const yPos = tile.yi * this.tileSize;
        this.fillRect(xPos, yPos, this.tileSize, this.tileSize, "gray");

        if (basetilePlayer != null) {
            const color = basetilePlayer.ref === "player.1" ? "red" : "blue";
            this.fillRect(xPos, yPos, this.tileSize, this.tileSize, color)
            this.text("B", xPos + this.tileSize/3, yPos + this.tileSize/1.3, 30, "black");
        }
        if (goldmine != null) {
            this.fillRect(xPos, yPos, this.tileSize, this.tileSize, "yellow");
            this.text("G"+goldmine.gold, xPos + this.tileSize/8, yPos + this.tileSize/1.3, 30, "black");
        }
        if (monsterDen != null) {
            console.log(monsterDen);
            this.fillRect(xPos, yPos, this.tileSize, this.tileSize, "darkgreen");
            this.text("M"+monsterDen.lvl, xPos + this.tileSize/18, yPos + this.tileSize/1.3, 30, "black");
        }
        this.rect(xPos, yPos, this.tileSize, this.tileSize, "black");

        return {
            xPos: xPos + this.tileSize / 2,
            yPos: yPos + this.tileSize / 2
        };
    }

    drawUnitsAt(units, x, y) {
        if (units.length === 0) {
            return;
        }

        const unitSize = this.tileSize / Math.sqrt(units.length);
        // TODO: Make this work for multiple units
        // let xi = -1;
        // let yi = -1;

        units.forEach(u => {
            const isSelectedUnit = this.selectedUnitRef === u.ref;
            this.circle(x, y, unitSize * .4, isSelectedUnit ? "lightgray" : "blue");
            this.text(u.type, x - 8, y + 10, 30, "black");
        })
    }

    circle(x, y, r, color, fill = true) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, r, r, 0, 0, Math.PI * 2);

        if (fill) {
            this.ctx.fill();
        }
        this.ctx.stroke();
        this.ctx.restore();
    }

    text(t, x, y, size, color) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.font = "" + size + "px serif";
        this.ctx.fillText(t, x, y);
        this.ctx.restore();
    }

    fillRect(x, y, w, h, color) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h)
        this.ctx.restore();
    }

    rect(x, y, w, h, color) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.rect(x, y, w, h);
        this.ctx.stroke();
        this.ctx.restore();
    }

    arrow(fx, fy, tx, ty, color = "black") {
        this.ctx.save();
        this.ctx.strokeStyle = color;
        const headLen = 10; // length of head in pixels
        const dx = tx - fx;
        const dy = ty - fy;
        const angle = Math.atan2(dy, dx);
        this.ctx.beginPath();
        this.ctx.moveTo(fx, fy);
        this.ctx.lineTo(tx, ty);
        this.ctx.lineTo(tx - headLen * Math.cos(angle - Math.PI / 6), ty - headLen * Math.sin(angle - Math.PI / 6));
        this.ctx.moveTo(tx, ty);
        this.ctx.lineTo(tx - headLen * Math.cos(angle + Math.PI / 6), ty - headLen * Math.sin(angle + Math.PI / 6));
        this.ctx.stroke();
        this.ctx.restore();
    }

}