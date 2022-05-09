class Unit {
    constructor (player, tile, type, num, speed, reach) {
        this.id = IdGen.get();
        this.player = player;
        tile.units.push(this);
        this.tile = tile;
        this.type = type;
        this.num = num;
        this.speed = speed;
        this.reach = reach;
        console.log(this.tile.units);
    }

    move(tile) {
        const d = Map.dist(this.tile, tile);
        console.log("move", d);
        if (this.speed >= d) {
            this.tile.units = this.tile.units.remove(this);
            tile.units.push(this);
            this.tile = tile;
        }
    }

    drawActive() {
        ctx.fillStyle = "white";
        circle(this.tile.x + this.tile.l / 2,
            this.tile.y + this.tile.l / 2,
            this.tile.l / 2,
            false);

    }


    draw() {
        ctx.fillStyle = "black";

        const sq = Math.ceil(Math.sqrt(this.num));
        const size = this.tile.l * 0.9/ sq;
        let painted = 0;
        for (let x=0; x < sq; x++) {
            for (let y=0; y < sq; y++) {
                if(painted>=this.num) {
                    break;
                }
                circle(
                    this.tile.x + x*size + this.tile.l *0.075 + 0.5*size,
                    this.tile.y + y*size + this.tile.l *0.075 + 0.5*size,
                    size* 0.9*0.5);
                painted++;
            }
        }
        text(this.type, this.tile.x + this.tile.l / 2, this.tile.y + this.tile.l /1.25, 60, "white");
    }

}