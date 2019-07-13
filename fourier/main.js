const w = window,
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

function random_int(min, max) {
    return Math.floor(Math.random() * Math.floor(max - min))  +  min;
}

function random_float(min, max) {
    return Math.random() * (max - min)  +  min;
}

function arrow(sx, sy, len, deg) {
    angle = deg * Math.PI / 180
    ex = len * Math.cos(angle) + sx
    ey = len * Math.sin(angle) + sy
    return arrow_se(ctx, sx, sy, ex, ey, len)
}

function arrow_se(context, fromx, fromy, tox, toy, len){
    var headlen = len*0.25;   // length of head in pixels
    var angle = Math.atan2(toy-fromy,tox-fromx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
    context.moveTo(tox, toy);
    context.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
    return [tox, toy]
}

class LineDrawing{
    constructor(steps_per_circle, on_draw){
        this.on_draw = on_draw
        this.reset(steps_per_circle)
    }

    reset(steps_per_circle){
        this.arrows = []
        this.steps_per_circle = steps_per_circle
        this.path = []
    }

    init(configs){
        let parent = null
        for (let i = 0; i < configs.length; i++) {
            let config = configs[i]
            const rotation_rate = 360 * config['rotations_per_cycle'] / this.steps_per_circle
            let a = new Arrow(width/2, height/2, config['length'], config['initial_rotation'], rotation_rate, parent)
            this.arrows.push(a)
            parent = a
        }
    }

    draw(){
        ctx.beginPath()
        ctx.rect(1, 1, width-2, height-2)
        ctx.fillStyle = 'white'
        ctx.fill()
        ctx.stroke()
    
        for (let i = 0; i < this.arrows.length; i++) {
            const a = this.arrows[i];
            a.draw()
        }
    
        if(this.path.length > 10000){
            this.path.shift()
        }
        this.path.push([this.arrows[this.arrows.length-1].head_x, this.arrows[this.arrows.length-1].head_y])
        
        if(this.path.length > 1){
            // print(this.path)
            ctx.beginPath()
            ctx.moveTo(this.path[0][0], this.path[0][1])
            for (let u = 1; u < this.path.length; u++) {
                const node = this.path[u];
                ctx.lineTo(node[0], node[1])
            }
            ctx.stroke()
        }
    
        // this.on_draw()

        ctx.beginPath()
        ctx.moveTo(svg_points[0][0], svg_points[0][1])
        for (let u = 1; u < svg_points.length; u++) {
            const node = svg_points[u];
            ctx.lineTo(node[0], node[1])
        }
        ctx.stroke()

        window.requestAnimationFrame(this.draw.bind(this))
    }
}

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

const scale = 1
class DrawApp{
    constructor(){
        this.ld = new LineDrawing(500, this.draw_config.bind(this))
        // this.config = [
        //     {rotations_per_cycle: 1, length: 100, initial_rotation: 0},
        //     {rotations_per_cycle: 2, length: 50, initial_rotation: 0},
        //     {rotations_per_cycle: -3, length: 50, initial_rotation: 90},
        // ]

        this.config = coefs.map((x, i) => {
            return {'rotations_per_cycle': i-parseInt(coefs.length/2), 'length': x[0]*scale, 'initial_rotation': x[1]}
        })
        print(this.config)
    }

    start(){
        this.ld.init(this.config)
        this.ld.draw()
    }

    draw_config() {
        ctx.font = "20px Georgia";
        ctx.fillStyle = 'black'
        let offset = 25
        let lines = [
            'Config (rotations per cycle, length, inital rotation)',
            '',
        ]

        for (let i = 0; i < this.config.length; i++) {
            const arrow_conf = this.config[i];
            lines.push(`Arrow ${i+1}\t ${arrow_conf['rotations_per_cycle']}\t ${arrow_conf['length']}\t ${arrow_conf['initial_rotation']}`)
        }


        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            ctx.fillText(line, 30, offset + (i+1) * 25);
        }
    }

    onkey(e){
        print(e)
        this.ld.reset()
        this.ld.init(this.config)
        this.ld.draw()
    }
}

function main() {
    let min_len = 0
    let max_len = 0
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        min_len = 1
        max_len = 10
    }else{
        min_len = 1
        max_len = 120
    }
    const app = new DrawApp()
    w.addEventListener("keypress", app.onkey.bind(app));
    app.start()
}

main()