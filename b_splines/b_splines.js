const can = document.getElementById('can');
const ctx = can.getContext('2d');
const new_curve = document.getElementById('new_curve');
const boxes = document.getElementById('boxes');
const demo_btn = document.getElementById('demo');
const random = document.getElementById('random');
const clear_btn = document.getElementById('clear');
const width = can.width = window.innerWidth;
const height = can.height = window.innerHeight *0.8;
let canRect = can.getBoundingClientRect();
let mouseDown = false;
const num_samples = 1000;
let curve;

window.onresize = (e) => {
    canRect = can.getBoundingClientRect();
};

can.onmouseup = () => {
    mouseDown = false;
}

function redraw(max_t = 1) {
    clear();
    for (let i = 0; i < curves.length; i++) {
        const curve = curves[i];
        curve.color = colorArray[i];
        curve.plot(ctx, 5);
    }
}

can.onmousedown = (e) => {
    mouseDown = true;
    const newPoint = new v2(e.clientX-canRect.left, e.clientY-canRect.top);
    curves[curves.length-1].add_point(newPoint);
    redraw();
}

can.onmousemove = (e) => {
    if(mouseDown) {
        curves[curves.length-1].change_point(curves[curves.length-1]._points.length-1, e.clientX-canRect.left, e.clientY-canRect.top);
        redraw();
    }
}

window.onkeydown = (e) => {
    // Leertaste
    if(e.keyCode === 32) {
    }
}

function randomInt(scalar) {
    return Math.floor(Math.random()*scalar);
}

function clear() {
    ctx.fillStyle = "#4a4f5c";
    ctx.fillRect(0,0, width, height);
}

function draw_point(p, size, color) {
    ctx.fillStyle = color
    ctx.fillRect(p.x - size/2, p.y - size/2, size, size);
}

function knot_scale_to_point(knot) {
    return new v2(width*0.1 + width * 0.8 * knot, height *.9);
}

function draw_line(sx, sy, ex, ey) {
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
}

function draw_coord_system() {
    ctx.strokeStyle = 'white';
    draw_line(width/2, 0, width/2, height);
    draw_line(0, height/2.0, width, height/2.0);
    ctx.strokeStyle = 'cyan';
    draw_line(width*0.1, height*.9, width*0.9, height*.9);

    for (let i = 0; i < curve.knots.length; i++) {
        const knot = curve.knots[i];
        draw_point(knot_scale_to_point(knot), 10, 'magenta');
    }
    
    ctx.strokeStyle = 'blue';
    for (let i = 0; i < curve._points.length-1; i++) {
        const f = curve._points[i];
        const s = curve._points[i+1];
        draw_line(f.x, f.y, s.x, s.y);
    }

    for (let i = 0; i < curve._points.length; i++) {
        const point = curve._points[i];
        draw_point(point, 10, 'red');
    }

}


curve = new B_Spline([
    new v2(width*.1, height*.25),
    new v2(width*.4, height*.65),
    new v2(width*.5, height*.25),
    new v2(width*.6, height*.65),
    new v2(width*.9, height*.25),
])
clear();
draw_coord_system();
let tria = curve.insert_knot(0.6);
tria = curve.insert_knot(0.6);
for (let i = 0; i < tria.length; i++) {
    for (let j = 0; j < tria[i].length; j++) {
        const tr = tria[i][j];
        draw_point(tr, 15, 'green');
    }
}