const print = console.log

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

class Drawing{

    constructor(){
        this.x = []
        this.fourierX
        this.time = 0
        this.path = []
        this.can = document.getElementById('can')
        this.can.width = width
        this.can.height = height
        this.canRect = can.getBoundingClientRect();
        this.ctx = can.getContext('2d')
        this.mouseDown = false
        this.num_interpolations = 6
        this.xoff = 0
        this.yoff = 0
        this.scale = 1.0
        this.tick = 0
        this.draw_points = true
        this.show_orbits = true

        // this.drawing = drawing
        this.drawing = [
            // {x: 0, y: 100},
            // {x: 100, y: 100},
            // {x: 100, y: 0},
            // {x: 0, y: 0},
        ]
        can.onmousedown = (e) => {
            this.mouseDown = true
            const newPoint = new v2(e.clientX-this.canRect.left, e.clientY-this.canRect.top);
            this.drawing.push({x: newPoint.x - this.xoff, y: newPoint.y - this.yoff})
        }
        can.onmousemove = (e) => {
            if(this.mouseDown){
                const newPoint = new v2(e.clientX-this.canRect.left, e.clientY-this.canRect.top);
                this.drawing.push({x: newPoint.x - this.xoff, y: newPoint.y - this.yoff})
            }
        }
        can.onmouseup = (e) => {
            this.mouseDown = false
            this.setup()
            this.time = 0
            this.path = []
        }
        window.onkeydown = (e) => {
            // Leertaste
            if(e.keyCode === 32) {
                this.drawing = []
                this.setup()
                this.scale = 1.0
            }
            if(e.key === 'w') {
                this.scale *= 1.1
            }
            if(e.key === 's') {
                this.scale = Math.max(1, this.scale/1.1)
            }
            if(e.key === 'd') {
                this.num_interpolations = Math.max(1, this.num_interpolations-1)
                this.setup()
                this.time = 0
                this.path = []
            }
            if(e.key === 'a') {
                this.num_interpolations = Math.min(20, this.num_interpolations+1)
                this.setup()
                this.time = 0
                this.path = []
            }
            if(e.key === 'o') {
                this.show_orbits = !this.show_orbits
            }
        }
    }

    setup(){
        const linear_interpolated = []
        for (let i = 1; i < this.drawing.length; i++) {
            const start = this.drawing[i-1]
            const end = this.drawing[i]
            for (let j = 0; j < this.num_interpolations; j++) {
                const factor = j / this.num_interpolations
                const x = factor * end.x + (1-factor) * start.x
                const y = factor * end.y + (1-factor) * start.y
                linear_interpolated.push({x, y})
            }
        }
        this.x = linear_interpolated.map(x => new Complex(x.x, x.y))
        this.fourierX = dft(this.x)
        this.fourierX.sort((a, b) => b.amp - a.amp)
    }

    epicycles(x, y, rotation, fourier, compute_only){
        for (let i = 0; i < fourier.length; i++) {
            let prevx = x
            let prevy = y
            let freq = fourier[i].freq
            let radius = fourier[i].amp * this.scale
            let phase = fourier[i].phase
            x += radius * Math.cos(freq * this.time + phase + rotation)
            y += radius * Math.sin(freq * this.time + phase + rotation)

            if(!compute_only){
                this.ctx.beginPath()
                if(this.show_orbits){
                    // draw orbit
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${50/255}`
                    this.ellipse(prevx, prevy, radius, radius, 0, 0, Math.PI*2)
                    this.ctx.stroke()
                }
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${100/255}`
                this.ctx.beginPath()
                this.moveTo(prevx, prevy)
                this.lineTo(x, y)
                this.ctx.stroke()
            }
        }
        return new v2(x, y)
    }

    moveTo(x, y){
        this.ctx.moveTo(x + this.xoff, y + this.yoff)
    }

    lineTo(x, y){
        this.ctx.lineTo(x + this.xoff, y + this.yoff)
    }

    ellipse(prevx, prevy, radius){
        this.ctx.ellipse(prevx + this.xoff, prevy + this.yoff, radius, radius, 0, 0, Math.PI*2)
    }

    rect(x, y, w, h){
        this.ctx.rect(x + this.xoff, y + this.yoff, w, h)
    }

    async draw(){
        this.ctx.beginPath()
        this.ctx.rect(1, 1, width-2, height-2)
        this.ctx.fillStyle = 'black'
        this.ctx.fill()
        this.ctx.stroke()

        let v = this.epicycles(0, 0, 0, this.fourierX, true)
        this.path.unshift(v)
        if(Math.abs(this.scale - 1.0) < 0.1){
            this.xoff = width/2
            this.yoff = height/2
            this.draw_points = true
        }else{
            this.draw_points = false
            this.xoff =  - v.x + width/2
            this.yoff =  - v.y + height/2
        }
        this.epicycles(0, 0, 0, this.fourierX, false)

        this.ctx.beginPath()
        this.moveTo(this.path[0].x, this.path[0].y)
        for (let i = 1; i < this.path.length; i++) {
            this.lineTo(this.path[i].x, this.path[i].y)
        }
        this.ctx.strokeStyle = 'red'
        this.ctx.lineWidth = 3
        this.ctx.stroke()
        this.ctx.lineWidth = 1
        this.ctx.strokeStyle = 'white'
        
        const dt = Math.PI * 2 / (this.fourierX.length)
        this.time += dt

        if(this.time > Math.PI * 2)
        {
            this.time = 0
            this.path = []
        }

        // draw all points
        if(this.draw_points){
            this.ctx.fillStyle = 'rgba(100, 100, 100, 0.2)'
            for (let i = 0; i < this.drawing.length; i++) {
                const point = this.drawing[i];
                this.ctx.beginPath()
                this.rect(point.x-2,  point.y-2, 5, 5)
                this.ctx.fill()
            }
        }

        this.ctx.fillStyle = 'white'
        this.ctx.font = "20px Georgia";
        const text = [
            'Draw anything!',
            'Space: reset',
            'o: toggle orbits',
            'w/s: zoom',
            'a/d: speed',
            `Zoomlevel: ${this.scale.toFixed(1)}`,
            `Speedlevel: ${this.num_interpolations}`,
        ]
        for (let i = 0; i < text.length; i++) {
            const t = text[i];
            this.ctx.fillText(t, 10, 30 + 22 * i);
        }
        this.ctx.fillText('Checkout "The Coding Train" on Youtube for a detailed tutorial on the basic algorithm!', 10, height-20)

        this.tick += 1

        // this.xoff = Math.sin(this.tick/100) * 200

        window.requestAnimationFrame(this.draw.bind(this))
    }
}

const draw = new Drawing()
draw.setup()
draw.draw()