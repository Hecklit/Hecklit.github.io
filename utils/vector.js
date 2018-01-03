class v2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    sub(o) {
        return new v2(this.x-o.x, this.y-o.y);
    }

    add(o) {
        return new v2(this.x+o.x, this.y+o.y);
    }
    
    dot(o) {
        const that = this.normalize();
        o = o.normalize();
        return that.x*o.x + that.y*o.y;
    }

    normal() {
        return new v2(this.y*-1, this.x);
    }
    
    scale(num) {
        return new v2(this.x*num, this.y*num);
    }
    
    div(divider) {
        return new v2(this.x/divider, this.y/divider);
    }

    length() {
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }

    normalize() {
        return this.div(this.length());
    }

    toString() {
        // const length = this.length();
        return `(${this.x} | ${this.y})`
    }
}

class v3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    sub(o) {
        return new v3(this.x-o.x, this.y-o.y, this.z-o.z);
    }

    add(o) {
        return new v3(this.x+o.x, this.y+o.y, this.z+o.z);
    }
    
    dot(o) {
        const that = this.normalize();
        o = o.normalize();
        return that.x*o.x + that.y*o.y + that.z*o.z;
    }
    
    scale(num) {
        return new v3(this.x*num, this.y*num, this.z*num);
    }
    
    div(divider) {
        return new v3(this.x/divider, this.y/divider, this.z/divider);
    }

    length() {
        return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);
    }

    normalize() {
        return this.div(this.length());
    }

    toString() {
        const length = this.length();
        return `(${this.x} | ${this.y} | ${this.z}) = |${length}|`
    }

    project2d() {
        return new v2(this.x, this.y);
    }
}

class line2d {
    constructor(fx, fy, sx, sy) {
        if(!sx) {
            this.start = fx;
            this.end = fy;
        }else{
            this.start = new v2(fx, fy);
            this.end = new v2(sx, sy);
        }
        this.dir = this.end.sub(this.start);
    }

    draw(ctx, color) {
        if(color) {
            ctx.fillStyle = color;
        }
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.stroke();
    }

    length() {
        return this.dir.length();
    }

    x_at_y(y) {
        const norm_dir = this.dir.normalize();
        const scale = (y - this.start.y)/ norm_dir.y;
        const res = this.start.add(norm_dir.scale(scale));
        return res.x;
    }
}

class box2d{
    constructor(fx, fy, sx, sy) {
        if(!sx) {
            this.start = fx;
            this.end = fy;
        }else{
            this.start = new v2(fx, fy);
            this.end = new v2(sx, sy);
        }
        this.dim = this.end.sub(this.start)
    }

    inside(x, y) {
        return x >= this.start.x && x <= this.end.x && y >= this.start.y && y <= this.end.y;
    }

    fill(ctx, color) {
        ctx.fillStyle = color;
        ctx.fillRect(this.start.x, this.start.y, this.dim.x, this.dim.y);
    }
}