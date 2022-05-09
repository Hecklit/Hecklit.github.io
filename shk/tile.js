class Tile {

    constructor(x, y, l, xi, yi, map) {
        this.units = [];
        this.x = x;
        this.y = y;
        this.l = l;
        this.xi = xi;
        this.yi = yi;
        this.color = "gray";
        this.text = "";
        this.map = map;
    }


    draw(){
        ctx.fillStyle= this.color;

        ctx.fillRect(this.x, this.y, this.l, this.l);
        ctx.rect(this.x, this.y, this.l, this.l);
        ctx.stroke();
        ctx.textAlign = 'center';
        ctx.fillStyle= "black";
        ctx.font = '30px serif';
        ctx.fillText(this.text, this.x+ this.l/2, this.y + this.l/1.5);
    }

    getNeighbour(dix, diy) {
        const ix = this.xi + dix;
        const iy = this.yi + diy;
        if(this.map.tiles[ix]) {
            return this.map.tiles[ix][iy];
        }
    }

    hasPlayerOnIt(pl) {
        return this.units.filter(u => u.player.id === pl.id).length > 0;
    }

    hasEnemyOnIt(pl) {
        return this.units.length > 0 && !this.hasPlayerOnIt(pl);
    }

    drawOverlay(color){
        const tmp = this.color;
        this.color = color;
        this.draw();
        this.color = tmp;
    }

    config(color, text) {
        this.color = color;
        this.text = text;
    }

}