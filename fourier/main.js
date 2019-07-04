var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    width = w.innerWidth || e.clientWidth || g.clientWidth,
    height = w.innerHeight|| e.clientHeight|| g.clientHeight;

const can = document.getElementById('can')
const ctx = can.getContext('2d')
can.width = width
can.height = height

const print = console.log

const arrows = []

let min_len = 0
let max_len = 0
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    min_len = 3
    max_len = 10
}else{
    min_len = 5
    max_len = 20
}

function random_int(min, max) {
    return Math.floor(Math.random() * Math.floor(max - min))  +  min;
}

function random_float(min, max) {
    return Math.random() * (max - min)  +  min;
}

function main() {
    let parent = null
    for (let i = 0; i < 300; i++) {
        let a = new Arrow(width/2, height/2, random_int(min_len, max_len), random_int(0, 360), random_int(-5, 5), parent)
        arrows.push(a)
        parent = a
    }
    draw()
}

function arrow(sx, sy, len, deg) {
    angle = deg * Math.PI / 180
    ex = len * Math.cos(angle) + sx
    ey = len * Math.sin(angle) + sy
    return arrow_se(ctx, sx, sy, ex, ey)
}

function arrow_se(context, fromx, fromy, tox, toy){
    var headlen = 10;   // length of head in pixels
    var angle = Math.atan2(toy-fromy,tox-fromx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
    context.moveTo(tox, toy);
    context.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
    return [tox, toy]
}

let deg = 0
class Arrow{
    constructor(x, y, length, deg, rotation_rate, parent){
        this.x = x
        this.y = y
        this.length = length
        this.parent = parent
        this.deg = deg
        this.rotation_rate = rotation_rate
        this.head_x = 0
        this.head_y = 0
    }

    draw(){
        if(this.parent){
            this.x = this.parent.head_x
            this.y = this.parent.head_y
        }
        ctx.beginPath()
        const arr = arrow(this.x, this.y, this.length, this.deg)
        this.head_x = arr[0]
        this.head_y = arr[1]
        ctx.stroke()
        this.deg += this.rotation_rate
    }
}

const path = []

function draw() {
    ctx.beginPath()
    ctx.rect(1, 1, width-2, height-2)
    ctx.fillStyle = 'white'
    ctx.fill()
    ctx.stroke()

    for (let i = 0; i < arrows.length; i++) {
        const a = arrows[i];
        a.draw()
    }

    if(path.length > 10000){
        path.shift()
    }
    path.push([arrows[arrows.length-1].head_x, arrows[arrows.length-1].head_y])
    
    if(path.length > 1){
        // print(path)
        ctx.beginPath()
        ctx.moveTo(path[0][0], path[0][1])
        for (let u = 1; u < path.length; u++) {
            const node = path[u];
            ctx.lineTo(node[0], node[1])
        }
        ctx.stroke()
    }
    // ctx.beginPath()
    // arrow(width/2, height/2, 100, deg)
    // ctx.stroke()
    // deg += 1
    // print(deg)
    window.requestAnimationFrame(draw)
}

main()