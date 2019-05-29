class BBox{

    constructor(x, y, w, h){
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }

    set(x, y){
        this.x = x
        this.y = y
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

    bottom_center(){
        return new v2(this.x + this.w/2, this.y + this.h)
    }

    set_bottom_center(x, y){
        this.x = x - this.w/2
        this.y = y - this.h
    }
}



function print(txt) {
    console.log(txt)
}

function random_int(max) {
    return Math.floor(Math.random()*(max));
}

function random_choice(arr){
    return arr[random_int(arr.length)]
}

function random_in_interval(low, high){
    var interval = high - low
    return low + Math.random()*interval
}

function has_items(want, store){
    let has_all = true
    for (var key in want) {
        if(want[key] > store[key]){
            has_all = false
            break
        }
    }
    return has_all
}

function missing_items(want, store){
    var missing = {}
    for (var key in want) {
        if(store[key] < want[key]){
            missing[key] = want[key] - store[key]
        }
    }
    return missing
}

function give_items(want, store){
    for (var key in want) {
        store[key] += want[key]
    }
}

function make_dict(keys, values){
    var dict = {}
    for (let i = 0; i < keys.length; i++) {
        if(!keys[i]){
            throw new Exception()
        }
        dict[keys[i]] = values[i]
    }
    return dict
}