const can = document.getElementById('can');
const ctx = can.getContext('2d');
const width = can.width = window.innerWidth *0.8;
const height = can.height = window.innerHeight *0.8;
const center = new v2(width, height).scale(0.5);
let canRect = can.getBoundingClientRect();
let mouseDown = false;
let f = 40.0;

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

let target_point, first_focal_point, second_focal_point, base_line, screen_width, left_screen, right_screen,
    left_camera_to_target, right_camera_to_target, y, left_intersect_x, right_intersect_x, left_intersect,
    right_intersect, left_disparity, right_disparity, disparity, distance;

function calculate_distace(t_p) {
    target_point = t_p;
    screen_width = base_line.length()*0.9;
    left_screen = getScreen(base_line.start, screen_width, f);
    right_screen = getScreen(base_line.end, screen_width, f);
    left_camera_to_target = new line2d(first_focal_point, target_point);
    right_camera_to_target = new line2d(second_focal_point, target_point);
    y = left_screen.start.y;
    left_intersect_x = left_camera_to_target.x_at_y(y);
    right_intersect_x = right_camera_to_target.x_at_y(y);
    left_intersect = new v2(left_intersect_x, y);
    right_intersect = new v2(right_intersect_x, y);
    left_disparity = left_intersect_x - left_screen.start.x;
    right_disparity = right_intersect_x - right_screen.start.x;
    disparity = left_disparity - right_disparity;
    distance = base_line.length() * f / disparity;
    draw();
}

function getScreen(point, width, focal_length) {
    let screen_left = new v2(point.x -width/2, point.y -focal_length);
    let screen_right = new v2(point.x +width/2, point.y -focal_length);
    return new line2d(screen_left, screen_right);
}

function draw() {
    clear();
    drawPoint('#f00', target_point);
    drawPoint('#0f0', first_focal_point);
    drawPoint('#00f', second_focal_point);
    base_line.draw(ctx, '#ff0');
    left_screen.draw(ctx, '#0ff');
    right_screen.draw(ctx, '#0ff');
    left_camera_to_target.draw(ctx, '#f0f');
    right_camera_to_target.draw(ctx, '#f0f');
    drawPoint('#f0f', left_intersect);
    drawPoint('#f0f', right_intersect);
    ctx.fillStyle = '#000';
    ctx.font="26px Arial";
    ctx.fillText('f * len(baseline) / disparity = Distance', 10, 40);
    ctx.fillText(`${f.toFixed(2)} * ${base_line.length().toFixed(2)} / ${disparity.toFixed(2)} = ${distance.toFixed(2)}`, 10, 80);
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
        console.log(f);
    }
    if(e.target.id === 'b' || e.target.id === 'rb') {
        op = e.target.value;
        document.getElementById('b').value = op;
        document.getElementById('rb').value = op;
        first_focal_point = new v2(center.x - +op/2, center.y * 1.8)
        second_focal_point = new v2(center.x  + +op/2, center.y * 1.8)
        base_line = new line2d(first_focal_point, second_focal_point);
    }
    calculate_distace(new v2(center.x, center.y/2))
}

let op = 371;
first_focal_point = new v2(center.x - +op/2, center.y * 1.8)
second_focal_point = new v2(center.x  + +op/2, center.y * 1.8)
base_line = new line2d(first_focal_point, second_focal_point);
calculate_distace(new v2(center.x, center.y/2))