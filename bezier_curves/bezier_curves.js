const can = document.getElementById('can');
const ctx = can.getContext('2d');
const new_curve = document.getElementById('new_curve');
const boxes = document.getElementById('boxes');
const demo_btn = document.getElementById('demo');
const clear_btn = document.getElementById('clear');
const width = can.width = window.innerWidth;
const height = can.height = window.innerHeight *0.8;
let canRect = can.getBoundingClientRect();
let mouseDown = false;
const num_samples = 1000;
let curves = [];
let bounding_boxes = true;
let demo_mode = false;
let demo_progess = 0;
let demo_mode_dir = 1;

window.onresize = (e) => {
    canRect = can.getBoundingClientRect();
};

new_curve.onclick = (e) => {
    curves.push(new Bezier([]));
};
boxes.onclick = (e) => {
    bounding_boxes = !bounding_boxes;
    redraw();
};
demo_btn.onclick = (e) => {
    demo_mode = !demo_mode;
    if(demo_mode) {
        window.requestAnimationFrame(demo);
    }else{
        redraw();
    }
};
clear_btn.onclick = (e) => {
    curves = [new Bezier([])];
    redraw();
};


can.onmouseup = () => {
    mouseDown = false;
}

function redraw(max_t = 1) {
    clear();
    for (let i = 0; i < curves.length; i++) {
        const curve = curves[i];
        curve.naive_plot(ctx, num_samples, bounding_boxes, max_t);
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

function draw_point(p, size) {
    ctx.fillStyle = 'red'
    ctx.fillRect(p.x - size/2, p.y - size/2, size/2, size/2);
}

function demo() {
    demo_progess += demo_mode_dir*10.0/num_samples;
    if(demo_progess > 1) {
        demo_mode_dir *= -1;
        demo_progess = 1;
    }
    if(demo_progess < 0) {
        demo_mode_dir *= -1;
        demo_progess = 0;
    }
    redraw(demo_progess);
    if(demo_mode) {
        window.requestAnimationFrame(demo);
    }else{
        redraw();
    }
}

clear();

scale = 500.0
let points = [
    new v2(lerp(0, width, 100.0/scale), lerp(0, width, 100.0/scale)),
    new v2(lerp(0, width, 90.0/scale), lerp(0, width, 400.0/scale)),
    new v2(lerp(0, width, 300.0/scale), lerp(0, width, 80.0/scale)),
    new v2(lerp(0, width, 400.0/scale), lerp(0, width, 120.0/scale)),
    new v2(lerp(0, width, 430.0/scale), lerp(0, width, 350.0/scale)),
];

console.log(points)

ctx.lineWidth = 2;
points.sort((a, b) => {
    if(a.x > b.x){
        return true;
    }else if (b.x > a.x) {
        return false;
    }else{
        if(a.y > b.y){
            return true;
        }else if (b.y > a.y) {
            return false;
        }else{
            // they are the same point
            return true;
        }
    }
});
let curve1 = new Bezier(points);
curves.push(curve1);
redraw();