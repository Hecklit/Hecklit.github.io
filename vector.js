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
        const length = this.length();
        return `(${this.x} | ${this.y}) = |${length}|`
    }
}