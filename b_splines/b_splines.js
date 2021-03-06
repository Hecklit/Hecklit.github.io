const can = document.getElementById('can');
const ctx = can.getContext('2d');
const degree_slider = document.getElementById("myRange");
const degree_out = document.getElementById("degree_out");
const width = can.width = window.innerWidth;
const height = can.height = window.innerHeight *0.8;
let canRect = can.getBoundingClientRect();
let mouseDown = false;
let current_knot_indx = null;
let current_point_indx = null;
const num_samples = 1000;
let curve;
let rendering_points = [];
let rendering_knots = [];
let degree = 2;
let show_debug = true;
let bspline = null;

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

window.onresize = (e) => {
    canRect = can.getBoundingClientRect();
};

can.onmouseup = () => {
    mouseDown = false;
}

degree_out.innerHTML = `Grad: ${degree_slider.value}`;
degree = +degree_slider.value;
console.log(degree)
degree_slider.oninput = () => {
    degree_out.innerHTML = `Grad: ${degree_slider.value}`;
    degree = +degree_slider.value;
    console.log(degree)
    init();
    redraw(1.0);
}

function init() {
    let points = [];
    let knots = [];
    points.push( [0.24353*width,0.44556*height]);
    points.push( [0.41487*width,0.16330*height]);
    points.push( [0.45581*width,0.71572*height]);
    points.push( [0.67780*width,0.17540*height]);
    points.push( [0.79310*width,0.52822*height]);
    for (let i = 0; i < points.length+degree+1; i++) {
        knots.push(i/(points.length+degree));
    }
    bspline = new BSpline(points, degree, knots)
}

function insert(pos) {
    let res = insert_knot(pos, degree, bspline.points, bspline.knots)
    bspline.points = res;
    for (let i = 0; i < bspline.knots.length; i++) {
        const knot = bspline.knots[i];
        if(knot >= pos){
            bspline.knots.splice(i, 0, pos)
            break;
        }
    }
}

function redraw(max_t = 1) {
    clear();
    draw_coord_system();
    if(bspline.points.length > 1) {
        // draw connection between controll points
        ctx.lineWidth = 2;
        for (let i = 0; i < bspline.points.length; i++) {
            let p = bspline.points[i];
                if(show_debug) {
                    if(i !== 0) {
                        let o = bspline.points[i-1]
                        ctx.strokeStyle = 'gray';//colorArray[i-1];
                        draw_line(p[0], p[1], o[0], o[1]);
                    }
                }
                if(i == current_point_indx) {
                    draw_point(new v2(p[0], p[1]), 8, 'white')
                }else{
                    draw_point(new v2(p[0], p[1]), 8, 'red')
                }
            }
            ctx.lineWidth = 1;
        rendering();
        // for(var t=0; t<max_t; t+=0.01) {
        //     var point = interpolate(t, degree, bspline.points, bspline.knots);
        //     draw_point(new v2(point[0], point[1]), 2, 'yellow')
        // }
    }
}

can.onmousedown = (e) => {
    mouseDown = true;
    const newPoint = new v2(e.clientX-canRect.left, e.clientY-canRect.top-20);
    if(e.ctrlKey) {
        let val = point_to_knot_scale(newPoint)
        insert(val) 
    }
    // check for collision with any knot
    const knotPoints = bspline.knots.map(x => knot_scale_to_point(x))
    let found = false;
    for (let i = 0; i < knotPoints.length; i++) {
        const knotPoint = knotPoints[i];
        const distance = newPoint.sub(knotPoint).length();
        if(distance <= 20) {
            current_knot_indx = i;
            found = true
            break
        }
    }
    if(!found) {
        current_knot_indx = null;
    }
    // check for collision with any point
    found = false;
    for (let i = 0; i < bspline.points.length; i++) {
        const point = bspline.points[i];
        const distance = newPoint.sub(new v2(point[0], point[1])).length();
        if(distance <= 20) {
            current_point_indx = i;
            found = true
            break
        }
    }
    if(!found) {
        current_point_indx = null;
    }
    redraw(1);
}

can.onmousemove = (e) => {
    if(mouseDown && current_knot_indx !== null) {
        if(current_knot_indx > 0 && current_knot_indx < bspline.knots.length-1) {
            const newPoint = new v2(e.clientX-canRect.left, e.clientY-canRect.top);
            let tmp_val = point_to_knot_scale(newPoint);
            if(tmp_val >= bspline.knots[current_knot_indx-1] && tmp_val <= bspline.knots[current_knot_indx+1]){
                bspline.knots[current_knot_indx] = tmp_val;
                redraw(1);
            }
        }
    }
    if(mouseDown && current_point_indx !== null) {
        const newPoint = new v2(e.clientX-canRect.left, e.clientY-canRect.top);
        bspline.points[current_point_indx] = [newPoint.x, newPoint.y];
        redraw(1);
    }
}

window.onkeydown = (e) => {
    // Leertaste
    if(e.keyCode === 32) {
        show_debug = !show_debug;
        redraw(1)
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

function point_to_knot_scale(point) {
    return (point.x - width*0.1)/(width * 0.8);
}

function draw_line(sx, sy, ex, ey) {
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
}

function draw_coord_system() {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'white';
    draw_line(width/2, 0, width/2, height);
    draw_line(0, height/2.0, width, height/2.0);
    ctx.strokeStyle = 'lightgray';
    draw_line(width*0.1, height*.9, width*0.9, height*.9);

    for (let i = 0; i < bspline.knots.length; i++) {
        const knot = bspline.knots[i];
        if(i == current_knot_indx) {
            draw_point(knot_scale_to_point(knot), 10, 'white');
        }else{
            draw_point(knot_scale_to_point(knot), 10, 'lightgray');
        }
    }
}

function rendering() {
    rendering_points = bspline.points.slice();
    rendering_knots = bspline.knots.slice();
    for (let i = degree; i < bspline.knots.length-degree; i++) {
        const knot = bspline.knots[i];
        for (let j = 0; j < degree-1; j++) {
            // new points
            rendering_points = insert_knot(knot, degree, rendering_points, rendering_knots)
            // new knot vector
            for (let i = 0; i < rendering_knots.length; i++) {
                if(rendering_knots[i] >= knot){
                    rendering_knots.splice(i, 0, knot)
                    break;
                }
            }
        }
    }
    rendering_points = rendering_points.map(x => new v2(x[0], x[1]))
    let beziers = [];
    for (let i = degree-1; i < rendering_points.length-degree; i+=degree) {
        const bezier_points = rendering_points.slice(i, i+degree+1);
        if(show_debug) {
            for (let j = 0; j < bezier_points.length; j++) {
                const pnt = bezier_points[j];
                draw_point(pnt, 4, colorArray[i]);
                
            }
        }
        let bez = new Bezier(bezier_points, colorArray[i]);
        beziers.push(bez);
        bez.plot(ctx, 10);
    }
    let intersections = []
    for (let i = 0; i < beziers.length; i++) {
        const one = beziers[i];
        const self_inter = one.find_self_intersections();
        intersections = intersections.concat(self_inter);
        for (let j = i+1; j < beziers.length; j++) {
            const other = beziers[j];
            const inters = one.find_intersections_with_other(other);
            intersections = intersections.concat(inters);
        }
    }

    for (let i = 0; i < intersections.length; i++) {
        const inters = intersections[i];
        draw_point(inters, 5, 'red')
    }
}

max_t = 1
delta_t = 0.01
function loop() {
    if(max_t >= 1 || max_t <= 0){
        delta_t *= -1
    }
    max_t += delta_t
    redraw(max_t)
    requestAnimationFrame(loop)
}
init()
redraw(1.0)