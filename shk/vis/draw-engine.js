class DrawEngine {

    constructor(canvas) {
        this.canvas = canvas;
        this.ratio = canvas.height / canvas.width;
        this.ctx = canvas.getContext("2d");
        this.ctx.textAlign = 'center';
    }

    resize(width, game) {
        width = Math.max(width, 880);
        this.ctx.canvas.width = width * 0.75;
        this.ctx.canvas.height = width * this.ratio;
        const renderWidth = game.map.width > game.map.height ? this.ctx.canvas.width:  Math.min(this.ctx.canvas.width, this.ctx.canvas.height);
        game.map.setRenderWidth(renderWidth);
        this.draw(game);
    }

    drawColumnRow(row, x, y, cellWidth, size, color) {
        row.forEach((c, i) => {
            if (i === 4) {
                i += 2.5;
            }
            this.text(c, x + i * cellWidth, y, size, color);
        });
    }

    drawInformationGrid(game) {
        // Jonas Ep Gold F  F2  B   K   H
        // Jakob Ep Gold F  F2  B   K   H
        // Monsters EG EG2 T T2
        const tileSize = game.map.tiles[0][0].l;
        const XOffset = tileSize * 0.1;
        // const totalWidth = this.ctx.canvas.width - XOffset*2;
        // const maxUnitColumns = Math.max(...[
        //     ...game.players.map(pl => pl.units.length),
        //     (game.monsters?.units.length) || 0
        // ]);
        const lastYIndex = game.map.tiles[0].length - 1;
        const yBelowBoard = game.map.tiles[0][lastYIndex].y
            + tileSize * 1.5;
        // const numColumns = 2 + maxUnitColumns;
        const textSize = tileSize * 0.4;
        const cellHeight = textSize;
        const columnWidth = textSize * 3;
        const textColor = "black";

        this.ctx.textAlign = 'left';
        this.text(game.phaseToCaption[game.phase], XOffset, yBelowBoard,
            textSize, "black");

        this.drawColumnRow(
            ["Name", "Gold", "HDs", "Hero", "Units"],
            XOffset,
            yBelowBoard + cellHeight,
            columnWidth,
            textSize,
            textColor
        );
        game.players.forEach((pl, i) => {
            this.drawColumnRow(
                [pl.id, pl.gold, pl.heroDeaths, pl.hero.toString(), pl.units.filter(u => u.type !== "H")
                    .map((u) => u.toString()).join(", ")],
                XOffset,
                yBelowBoard + cellHeight * (2 + i),
                columnWidth,
                textSize,
                pl.id === game.curP.id ? game.curP.color : textColor
            );
        })

        this.ctx.textAlign = 'center';
    }

    draw(game) {
        if(Fightvis.instance.running) {
            return;
        }
        if (game.winner) {
            if (game.gameOverScreenDrawn) {
                return;
            }
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            this.ctx.fillRect(0, 0, 10000, 10000);
            this.ctx.textAlign = "center";
            this.text("Game over! " + game.winner.id + " has won!",
                this.canvas.width / 2, this.canvas.height / 1.8,
                this.canvas.width * 0.08, "white");
            game.gameOverScreenDrawn = true;
            return;
        }

        this.ctx.fillStyle = "lightgray";
        this.ctx.beginPath();
        this.ctx.stroke();
        this.ctx.clearRect(0, 0, 10000, 10000);

        this.drawMap(game.map);
        game.players.forEach(p => this.drawPlayer(p, game.phase, game.curP));
        this.drawMonsterPlayer(game.monsters, game.phase, game.curP);

        this.drawInformationGrid(game);

        const curP = game.players[game.curPi];
        const curUnit = curP.activeUnit;
        if (game.phase === 2) {
            this.drawTileOverlay(curP.activeBaseTile, "rgba(255, 255, 255, 0.5)");
        }

        if (game.phase === 5) {
            this.drawMapOverlay(game.map, curUnit);
        }

        if (game.phase === 6) {
            const mD = game.map.getTriggerableMonsterDen(curP);
            mD.forEach(d => this.drawTileOverlay(d, "rgba(0, 255, 0, 0.5)"));
        }

        if (game.phase === 8) {
            this.drawMapOverlay(game.map, curUnit, true);
        }

        if (game.phase === 10) {
            const tiles = game.map.getPossibleAnnexedGoldminesPerPlayer(curP);
            tiles.forEach(t => this.drawTileOverlay(t, "rgba(0, 255, 0, 0.5)"));
        }

        if (game.unitRadioButtons) {
            if (curP.hero.alive) {
                game.unitRadioLabels[game.unitRadioLabels.length - 1].innerHTML = `H`
                game.unitRadioButtons[game.unitRadioButtons.length - 1].disabled = true;
            } else {

                if (curP.turnsTillHeroRes > 0) {
                    game.unitRadioLabels[game.unitRadioLabels.length - 1].innerHTML = `H (${curP.turnsTillHeroRes} rounds)`
                    game.unitRadioButtons[game.unitRadioButtons.length - 1].disabled = true;
                } else {
                    game.unitRadioLabels[game.unitRadioLabels.length - 1].innerHTML = `H (${curP.hero.cost} gold)`
                    game.unitRadioButtons[game.unitRadioButtons.length - 1].disabled = false;
                }
            }
        }

        if (game.debugMode) {
            const size = 5;
            this.ctx.fillStyle = "green";
            this.circle(game.debugMarker[0] - size, game.debugMarker[1] - size, size);
        }
    }


    circle(x, y, r, fill = true) {

        if (fill) {
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, r, r, 0, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, r, r, 0, 0, Math.PI * 2);

        }
        this.ctx.stroke();
    }

    text(t, x, y, size, color) {
        this.ctx.fillStyle = color;
        this.ctx.font = "" + size + "px serif";
        this.ctx.fillText(t, x, y);
    }

    fillRect(x, y, w, h, color) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h)
        this.ctx.restore();
    }

    arrow(fx, fy, tx, ty, color = "black") {
        const tmp = this.ctx.strokeStyle;
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
        this.ctx.strokeStyle = tmp;
    }

    // specific draw functions

    drawMap(map) {
        map.forEach2D((x, y) => {
            this.drawTile(map.tiles[x][y]);
        });
    }

    drawMapOverlay(map, curUnit, attackOnly) {
        if (!curUnit) {
            return;
        }

        if (!attackOnly) {
            const inReach = map.getPossibleMovementPerUnit(curUnit);
            inReach.forEach(({t, dtg}) => this.drawTileOverlay(t, `rgba(0, 255, 0, 0.3)`));
        }

        if (attackOnly) {
            const pfs = map.getPossibleFightsPerUnit(curUnit).map(pf => pf.tile);
            pfs.forEach(ir => this.drawTileOverlay(ir, "rgba(255, 0, 0, 0.3)"));
            if (curUnit.reach > 0) {
                pfs.forEach(ir => this.arrow(curUnit.tile.cx, curUnit.tile.cy, ir.cx, ir.cy, curUnit.player.color));
            }
        }
    }

    drawTileOverlay(tile, color, text) {
        const tmp = tile.color;
        tile.color = color;
        this.drawTile(tile);
        if (text) {
            this.text(text, tile.cx, tile.cy, 30, "white");
        }
        tile.color = tmp;
    }

    drawTile(tile) {
        this.ctx.fillStyle = tile.color;

        this.ctx.fillRect(tile.x, tile.y, tile.l, tile.l);
        this.ctx.rect(tile.x, tile.y, tile.l, tile.l);
        this.ctx.stroke();

        if (tile.goldmine && tile.goldmine.player) {
            this.ctx.fillStyle = tile.goldmine.player.color;
            this.ctx.fillRect(tile.x, tile.y, tile.l * 0.2, tile.l * 0.2);
        }
        if (tile.goldmine && tile.goldmine.annexProcessStarted) {
            this.ctx.fillStyle = "green";
            this.ctx.fillRect(tile.x, tile.y, tile.l * 0.2, tile.l * 0.2);
        }
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = "black";
        this.ctx.font = '30px serif';
        // this.ctx.fillText(tile.id.slice(2), tile.x + tile.l / 2, tile.y + tile.l / 1.5);
        this.ctx.fillText(tile.text, tile.x + tile.l / 2, tile.y + tile.l / 1.5);
    }

    drawActiveUnit(unit) {
        // TODO: Implement Active Unit vis
    }

    drawPlayer(player, phase, curP) {
        player.units.forEach((u) => {
            if (u.type === "H") {
                this.drawHero(u, phase, curP)
            } else {
                this.drawUnit(u, phase, curP);
            }
        });
        if (player.activeUnit) {
            this.drawActiveUnit(player.activeUnit);
        }
    }

    drawBaseUnit(unit, phase, curP) {
        this.ctx.fillStyle = unit.player.color;
        const notAlone = unit.tile.units.length > 1;
        const sq = Math.ceil(Math.sqrt(unit.num));
        let xOffset = 0;
        let yOffset = 0;
        let tileSize = unit.tile.l;

        if (notAlone) {
            tileSize /= 2;
            const ownPlayer = unit.player;

            xOffset = ownPlayer.id === "Jonas" ? 0 : tileSize;
        }

        let add = this.drawAndGetAdd(tileSize, sq, unit, xOffset, yOffset, phase, curP);
        return [add, tileSize, xOffset, yOffset];
    }

    drawUnit(unit, phase, curP) {
        const [add, tileSize, xOffset, yOffset] = this.drawBaseUnit(unit, phase, curP);
        this.text(unit.type + add, unit.tile.x + tileSize / 2 + xOffset, unit.tile.y + tileSize / 1.4 + yOffset, tileSize * 0.6, "white");
    }

    drawHero(unit, phase, curP) {
        const [add, tileSize, xOffset, yOffset] = this.drawBaseUnit(unit, phase, curP);
        this.text(unit.type + unit.lvl + add, unit.tile.x + tileSize / 2 + xOffset, unit.tile.y + tileSize / 1.4 + yOffset, tileSize * 0.5, "white");
    }

    drawMonster(unit, phase, curP) {
        this.ctx.fillStyle = unit.player.color;
        const notAlone = unit.tile.units.length > 1;
        const sq = Math.ceil(Math.sqrt(unit.num));
        let xOffset = 0;
        let yOffset = 0;
        let tileSize = unit.tile.l;

        if (notAlone) {
            tileSize /= 2;

            if (unit.tile.units.length === 2) {
                const enemy = unit.tile.getEnemy(unit.player);
                xOffset = enemy.player.id === "Jonas" ? tileSize : 0;
            } else if (unit.tile.units.length === 3) {
                xOffset = 0;
                yOffset = tileSize;
            }
        }
        let add = this.drawAndGetAdd(tileSize, sq, unit, xOffset, yOffset, phase, curP);
        this.text(unit.name.split(" ").map(e => e[0]).join("") + add, unit.tile.x + tileSize / 2 + xOffset, unit.tile.y + tileSize / 1.4 + yOffset, tileSize * 0.6, "white");
    }

    drawAndGetAdd(tileSize, sq, unit, xOffset, yOffset, phase, curP) {
        const size = tileSize * 0.9 / sq;
        let painted = 0;
        for (let x = 0; x < sq; x++) {
            for (let y = 0; y < sq; y++) {
                if (painted >= unit.num) {
                    break;
                }
                this.circle(
                    unit.tile.x + x * size + tileSize * 0.075 + 0.5 * size + xOffset,
                    unit.tile.y + y * size + tileSize * 0.075 + 0.5 * size + yOffset,
                    size * 0.9 * 0.5);
                painted++;
            }
        }
        if (unit.hp * unit.num > unit.totalHp) {
            this.fillRect(unit.tile.x + xOffset, unit.tile.y + yOffset,
                tileSize, tileSize * 0.15, "red");
            const hpRatio = unit.totalHp / (unit.hp * unit.num);
            this.fillRect(unit.tile.x + xOffset, unit.tile.y + yOffset,
                tileSize * hpRatio, tileSize * 0.15, "green");
        }
        let add = "";
        const game = unit.tile.map.game;
        if (phase === 8 && !game.cantAttackAnymore(unit)
            && curP.id === unit.player.id) {
            add = "!"
        }
        if (phase === 5 && !game.cantMoveAnymore(unit)
            && curP.id === unit.player.id) {
            add = "~"
        }
        return add;
    }

    drawMonsterPlayer(monsters, phase, curP) {
        monsters?.units.forEach((u) => {
            this.drawMonster(u, phase, curP);
        });
    }
}