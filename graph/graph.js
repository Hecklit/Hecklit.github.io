const can = document.getElementById('can');
const ctx = can.getContext('2d');
const width = can.width = window.innerWidth*0.95;
const height = can.height = window.innerHeight*0.95;
const center = new v2(width/2, height/2);
const pointSize = 4;
let moveX = 0.5;

function draw() {
    clear();
    ctx.fillStyle = "#0f0";
    draw_function(x => Math.sin((x+moveX)*Math.PI/180)*(x+moveX)*(x+moveX), -100, 100);
    ctx.fillStyle = "#00f";
    draw_function(x => Math.tan((x+moveX)*Math.PI/180), -1000, 1000);
    moveX += Marh.sin(moveX);
    console.log('test');
    window.requestAnimationFrame(draw);
}

function drawPoint (vec) {
    ctx.fillStyle = "#000";
    ctx.fillRect(vec.x-pointSize/2, vec.y-pointSize/2, pointSize, pointSize);
}

function drawCircle(vec, r) {
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.arc(vec.x, vec.y, r, 0, 2*Math.PI);
    ctx.stroke();
}

function drawVector(sp, angle, len) {
    const angleInRad = (angle*2*Math.PI)/360;
    // len *= Math.cos(angleInRad*200)+1;
    const end = (new v2(Math.cos(angleInRad), Math.sin(angleInRad))).scale(len).add(sp);
    ctx.beginPath();
    ctx.moveTo(sp.x, sp.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    return end.sub(sp);
}

const clear = () => {
    ctx.fillStyle = "#aaa";
    ctx.fillRect(0,0, width, height);
    draw_line(0, center.y, width, center.y);
    draw_line(center.x, 0, center.x, height);
}

// function onChange(e) {
//     if(e.target.id === 'a' || e.target.id === 'ra') {
//         adj = e.target.value;
//         document.getElementById('a').value = adj;
//         document.getElementById('ra').value = adj;
//     }
//     if(e.target.id === 'b' || e.target.id === 'rb') {
//         op = e.target.value;
//         document.getElementById('b').value = op;
//         document.getElementById('rb').value = op;
//     }
// }

function arctan(x) {
    const radians = Math.atan(x);
    return radians * 180 / Math.PI;
}

function draw_line(x1, y1, x2, y2) {
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function draw_function(func, fromX, toX, step_size = 1) {
    for (let x = fromX; x < toX; x++) {
        let y = func(x);
        const size_input = toX -fromX;
        const x_scale = width/size_input;
        const x_screen = center.x + x*x_scale;
        const y_screen = center.y - y;
        ctx.fillRect(x_screen, y_screen, 4, 4);
    }
}

draw();