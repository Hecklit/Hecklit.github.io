class BBox{

    constructor(x, y, w, h){
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }

    move(x, y){
        this.x += x
        this.y += y
    }

    scale(sx, sy){
        this.w *= sx
        this.h *= sy
    }

    center(){
        return new v2(this.x + this.w/2, this.y + this.h/2)
    }

    center_on(pos){
        this.x = pos.x - this.w/2
        this.y = pos.y - this.h/2
    }

    static from_two_points(left_top, right_bottom){
        return new BBox(left_top.x, left_top.y, right_bottom.x - left_top.x, right_bottom.y - left_top.y)
    }

    static from_centered_on(vec, w, h){
        var b = new BBox(0, 0, w, h)
        b.center_on(vec)
        return b
    }

    is_inside(pos) {
        let ex = this.x + this.w;
        let ey = this.y + this.h;
        return pos.x > this.x && pos.x < ex && pos.y > this.y && pos.y < ey;
    }
}



function print(txt) {
    console.log(txt)
}