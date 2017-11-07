const can = document.getElementById('can');
const ctx = can.getContext('2d');
const width = can.width = window.innerWidth;
const height = can.height = window.innerHeight;
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
    ctx.strokeStyle = "#f00";
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


window.onkeydown = (e) => {
    console.log(e);
    if(e.keyCode === 38) {
        curDeg += 5;
    }else if(e.keyCode === 40){
        curDeg -= 5;
    }
    draw();
}


function makeALeftTurn(a, b, c) {
    const vecA = c.sub(a);
    const vecB = b.sub(a);
    console.log('vecA', vecA.toString())
    console.log('vecB', vecB.toString())
    const scalar = (b.x - a.x) * (c.y-a.y)  - (b.y-a.y)* (c.x -a.x);
    return (scalar) < 0;
}

draw();