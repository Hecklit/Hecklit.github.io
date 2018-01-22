const can = document.getElementById('can');
const ctx = can.getContext('2d');
const width = can.width = window.innerWidth *0.8;
const height = can.height = window.innerHeight *0.8;
const center = new v2(width, height).scale(0.5);
let canRect = can.getBoundingClientRect();
let mouseDown = false;
let f = 40.0;
let debug = false;

window.onresize = (e) => {
    canRect = can.getBoundingClientRect();
};

can.onmouseup = () => {
    mouseDown = false;
}

can.onmousedown = (e) => {
    mouseDown = true;
}

can.onmousemove = (e) => {
    if(mouseDown) {
        calculate_distace(new v2(e.clientX-canRect.left, e.clientY-canRect.top));
    }
}

window.onkeydown = (e) => {
    // Leertaste
    if(e.keyCode === 32) {
        debug = !debug;
        draw();
    }
}

function randomInt(scalar) {
    return Math.floor(Math.random()*scalar);
}

function clear() {
    ctx.fillStyle = "#4a4f5c";
    ctx.fillRect(0,0, width, height);
}

function drawPoint(color, x, y) {
    ctx.fillStyle = color;
    if(!y) {
        y = x.y;
        x = x.x;
    }
    const size = 8;
    ctx.fillRect(x -size/2, y -size/2 , size, size);
}

let target_point, left_focal_point, right_focal_point, base_line, screen_width, left_screen, right_screen,
    left_camera_to_target, right_camera_to_target, y, left_intersect_x, right_intersect_x, left_intersect,
    right_intersect, left_disparity, right_disparity, disparity, distance, view_frustum_left, view_frustum_right;

screen_width = 80;


function calculate_distace(t_p) {
    target_point = t_p;
    left_screen = getScreen(base_line.start, screen_width, f);
    right_screen = getScreen(base_line.end, screen_width, f);
    left_camera_to_target = new line2d(left_focal_point, target_point);
    right_camera_to_target = new line2d(right_focal_point, target_point);
    y = left_screen.start.y;
    left_intersect_x = left_camera_to_target.x_at_y(y);
    right_intersect_x = right_camera_to_target.x_at_y(y);
    left_intersect = new v2(left_intersect_x, y);
    right_intersect = new v2(right_intersect_x, y);
    left_disparity = left_intersect_x - left_screen.start.x;
    right_disparity = right_intersect_x - right_screen.start.x;
    disparity = left_disparity - right_disparity;
    distance = base_line.length() * f / disparity;
    // Frustums
    const left_left_end = left_screen.start.add(left_screen.start.sub(left_focal_point).scale(width));
    const left_right_end = left_screen.end.add(left_screen.end.sub(left_focal_point).scale(width));
    view_frustum_left = {
        left: new line2d(left_screen.start, left_left_end),
        right: new line2d(left_screen.end, left_right_end)
    };
    const right_left_end = right_screen.start.add(right_screen.start.sub(right_focal_point).scale(width));
    const right_right_end = right_screen.end.add(right_screen.end.sub(right_focal_point).scale(width));
    view_frustum_right = {
        left: new line2d(right_screen.start, right_left_end),
        right: new line2d(right_screen.end, right_right_end)
    };
    draw();
}

function getScreen(point, width, focal_length) {
    let screen_left = new v2(point.x -width/2, point.y -focal_length);
    let screen_right = new v2(point.x +width/2, point.y -focal_length);
    return new line2d(screen_left, screen_right);
}

function draw() {
    clear();
    base_line.draw(ctx, '#000');
    left_screen.draw(ctx, '#000');
    right_screen.draw(ctx, '#000');
    fill_frustum(view_frustum_right, "rgba(255, 255, 0, 0.2");
    fill_frustum(view_frustum_left, "rgba(255, 255, 0, 0.2");
    left_camera_to_target.draw(ctx, '#000');
    right_camera_to_target.draw(ctx, '#000');
    drawPoint('#f0f', left_intersect);
    drawPoint('#f0f', right_intersect);
    drawPoint('#f00', target_point);
    drawPoint('#0f0', left_focal_point);
    drawPoint('#00f', right_focal_point);

    if(debug) {
        ctx.fillStyle = '#000';
        ctx.font="26px Arial";
        ctx.fillText('f * len(baseline) / disparity = distance', 10, 40);
        ctx.fillText(`${f.toFixed(2)} * ${base_line.length().toFixed(2)} / ${disparity.toFixed(2)} = ${distance.toFixed(2)}`, 10, 80);
        ctx.strokeStyyle = '#f00';
        // f
        ctx.font="18px Arial";
        const left_brennweite = (new line2d(left_focal_point, new v2(left_focal_point.x, left_screen.start.y)));
        left_brennweite.draw(ctx, '#f00');
        ctx.fillStyle = '#f00';
        ctx.fillText(left_brennweite.length(), left_focal_point.x + 10, left_focal_point.y - left_brennweite.length()/2);
        const right_brennweite = (new line2d(right_focal_point, new v2(right_focal_point.x, right_screen.start.y)));
        right_brennweite.draw(ctx, '#f00');
        ctx.fillText(right_brennweite.length(), right_focal_point.x + 10, right_focal_point.y - right_brennweite.length()/2);
        // baseline to target
        const baseline_to_target = (new line2d(target_point, new v2(target_point.x, base_line.start.y)))
        baseline_to_target.draw(ctx, '#0f0');
        ctx.fillStyle = '#0f0';
        ctx.fillText(baseline_to_target.length().toFixed(2), target_point.x + 10, target_point.y + baseline_to_target.length()/2);
        // disparity
        const disparity_left = (new line2d(left_intersect, new v2(left_focal_point.x, left_screen.start.y)))
        disparity_left.draw(ctx, '#fff');
        ctx.fillStyle = '#fff';
        ctx.fillText(disparity_left.length().toFixed(2), left_intersect.x + disparity_left.length()/2, left_intersect.y - 10);
        const disparity_right = (new line2d(right_intersect, new v2(right_focal_point.x, right_screen.start.y)));
        disparity_right.draw(ctx, '#fff');
        ctx.fillText(disparity_right.length().toFixed(2), right_intersect.x + disparity_right.length()/2, right_intersect.y - 10);


    }else{
        ctx.fillStyle = '#000';
        ctx.font="26px Arial";
        ctx.fillText('f * len(baseline) / disparity = distance', 10, 40);
        ctx.fillText(`${f.toFixed(2)} * ${base_line.length().toFixed(2)} / ${disparity.toFixed(2)} = ${distance.toFixed(2)}`, 10, 80);
    }
}

var inputs = document.getElementsByTagName('input');
for(var i = 0; i < inputs.length; i++) {
    inputs[i].onchange = onChange;
}
var inputs = document.getElementsByTagName('range');
for(var i = 0; i < inputs.length; i++) {
    inputs[i].oninput = onChange;
    inputs[i].onchange = onChange;
}

function onChange(e) {
    if(e.target.id === 'a' || e.target.id === 'ra') {
        f = +e.target.value;
        document.getElementById('a').value = f;
        document.getElementById('ra').value = f;
    }
    if(e.target.id === 'b' || e.target.id === 'rb') {
        op = e.target.value;
        document.getElementById('b').value = op;
        document.getElementById('rb').value = op;
        left_focal_point = new v2(center.x - +op/2, center.y * 1.8)
        right_focal_point = new v2(center.x  + +op/2, center.y * 1.8)
        base_line = new line2d(left_focal_point, right_focal_point);
    }
    calculate_distace(new v2(center.x, center.y/2))
}

function moveTo(vec) {
    ctx.moveTo(vec.x, vec.y);
}

function lineTo(vec) {
    ctx.lineTo(vec.x, vec.y);
}

function fill_frustum(f, color) {
    ctx.beginPath();
    moveTo(f.left.start);
    lineTo(f.left.end);
    lineTo(f.right.end);
    lineTo(f.right.start);
    lineTo(f.left.start);
    ctx.fillStyle = color;
    ctx.fill();
}

let op = 371;
left_focal_point = new v2(center.x - +op/2, center.y * 1.8)
right_focal_point = new v2(center.x  + +op/2, center.y * 1.8)
base_line = new line2d(left_focal_point, right_focal_point);
calculate_distace(new v2(center.x, center.y/2))