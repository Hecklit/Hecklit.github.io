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
let curves = [];
let bounding_boxes = false;
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
random.onclick = (e) => {
    let points = [];
    for (let i = 0; i < 4; i++) {
        points.push(new v2(Math.random()*width, Math.random()*height));
    }
    curves.push(new Bezier(points));
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
var colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
		  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
		  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
		  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
		  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
		  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
		  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
		  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
		  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
'#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

function redraw(max_t = 1) {
    clear();
    for (let i = 0; i < curves.length; i++) {
        const curve = curves[i];
        curve.color = colorArray[i];
        // curve.naive_plot(ctx, num_samples, bounding_boxes, max_t);
        curve.plot(ctx, 5);

        // intersections

        for (let j = i+1; j < curves.length; j++) {
            let inter = curve.find_intersections_with_other(curves[j]);
            for(p in inter) {
                draw_point(inter[p], 6, 'white');
            }
        }

        // self intersections
        let self_inters = curve.find_self_intersections();
        for(p in self_inters) {
            draw_point(self_inters[p], 6, 'black');
        }
    }
}

can.onmousedown = (e) => {
    if(e.button === 2) {
        console.log('Cn-1 Übergang');
        const newPoint = new v2(e.clientX-canRect.left, e.clientY-canRect.top);
        const newBezier = curves[curves.length-1].cn_minus_one_transition(newPoint);
        curves.push(newBezier);
        redraw();
        return;
    }
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

// scale = 500.0
// let points = [
//     new v2(lerp(0, width, 100.0/scale), lerp(0, width, 100.0/scale)),
//     new v2(lerp(0, width, 90.0/scale), lerp(0, width, 400.0/scale)),
//     new v2(lerp(0, width, 300.0/scale), lerp(0, width, 80.0/scale)),
//     new v2(lerp(0, width, 400.0/scale), lerp(0, width, 120.0/scale)),
//     new v2(lerp(0, width, 430.0/scale), lerp(0, width, 350.0/scale)),
// ];

// console.log(points)

// ctx.lineWidth = 2;
// points.sort((a, b) => {
//     if(a.x > b.x){
//         return true;
//     }else if (b.x > a.x) {
//         return false;
//     }else{
//         if(a.y > b.y){
//             return true;
//         }else if (b.y > a.y) {
//             return false;
//         }else{
//             // they are the same point
//             return true;
//         }
//     }
// });
// let curve1 = new Bezier(points);
// curves.push(curve1);
// redraw();

random.onclick({});