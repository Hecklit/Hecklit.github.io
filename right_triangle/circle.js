const can = document.getElementById('can');
const ctx = can.getContext('2d');
const width = can.width = window.innerWidth/2;
const height = can.height = window.innerHeight/2;
const center = new v2(width/2, height/2);
const pointSize = 4;
let curDeg = 45;

function draw() {
    clear();
    drawPoint(center);
    drawCircle(center, 100);
    const x1 = drawVector(center, 0, 200);
    const x2 = drawVector(center, curDeg, 200);
    ctx.fillStyle = "#000";
    ctx.fillText('Deg: '+curDeg, 100, 100);
    ctx.fillText('Dot: '+x1.dot(x2), 100, 120);
    const normal = x1.normal();
    ctx.fillText('Dot: '+normal.dot(x2), 100, 140);
}

function drawPoint (vec) {
    ctx.filLStyle = "#000";
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
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0, width, height);
}


function makeALeftTurn(a, b, c) {
    const vecA = c.sub(a);
    const vecB = b.sub(a);
    console.log('vecA', vecA.toString())
    console.log('vecB', vecB.toString())
    const scalar = (b.x - a.x) * (c.y-a.y)  - (b.y-a.y)* (c.x -a.x);
    return (scalar) < 0;
}

function calculateTriangleFromAdjAndOp(adj, op) {
    const hyp = Math.sqrt(adj*adj + op * op);
    const alpha = arctan(op/adj);
    return {
        a: adj,
        b: op,
        c: hyp,
        alpha: alpha,
        beta: 90-alpha,
        gamma: 90
    } 
}

function drawTriangle(t) {
    clear();
    ctx.strokeStyle = '#000'
    let scale = 70;
    drawPoint(center);
    point = drawVector(center, 0, t.a*scale);
    drawVector(center, 90, -t.b*scale);
    drawVector(point.add(center), t.alpha -180, t.c*scale)
}
const tria = calculateTriangleFromAdjAndOp(4, 2);
drawTriangle(tria);

var inputs = document.getElementsByTagName('input');
for(var i = 0; i < inputs.length; i++) {
    inputs[i].onchange = onChange;
}
var inputs = document.getElementsByTagName('range');
for(var i = 0; i < inputs.length; i++) {
    inputs[i].oninput = onChange;
    inputs[i].onchange = onChange;
}

let adj = 4;
let op = 2;
function onChange(e) {
    if(e.target.id === 'a' || e.target.id === 'ra') {
        adj = e.target.value;
        document.getElementById('a').value = adj;
        document.getElementById('ra').value = adj;
    }
    if(e.target.id === 'b' || e.target.id === 'rb') {
        op = e.target.value;
        document.getElementById('b').value = op;
        document.getElementById('rb').value = op;
    }
    const tria = calculateTriangleFromAdjAndOp(adj, op);
    drawTriangle(tria);
}

function arctan(x) {
    const radians = Math.atan(x);
    return radians * 180 / Math.PI;
}