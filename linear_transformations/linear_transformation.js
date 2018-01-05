const can = document.getElementById('can');
const ctx = can.getContext('2d');
const width = can.width = 2 * window.innerWidth / 3;
const height = can.height = 2 * window.innerHeight / 3;
const center = new v2(width / 2, height / 2);

function draw() {
    clear();
    drawPoint(center);
}

function drawPoint(vec) {
    ctx.filLStyle = "#000";
    ctx.fillRect(vec.x - pointSize / 2, vec.y - pointSize / 2, pointSize, pointSize);
}

function drawCircle(vec, r) {
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.arc(vec.x, vec.y, r, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawVector(sp, angle, len) {
    const angleInRad = (angle * 2 * Math.PI) / 360;
    const end = (new v2(Math.cos(angleInRad), Math.sin(angleInRad))).scale(len).add(sp);
    ctx.beginPath();
    ctx.moveTo(sp.x, sp.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    return end.sub(sp);
}

function drawLine(sx, sy, ex, ey) {
    ctx.beginPath();
    ctx.moveTo(sx + center.x, sy + center.y);
    ctx.lineTo(ex + center.x, ey + center.y);
    ctx.stroke();
}

function drawVectorFromVector(sv, ev) {
    ctx.beginPath();
    sv = sv.scale(scale);
    ev = ev.scale(scale);
    ctx.moveTo(sv.x + center.x, (-1 * sv.y) + center.y);
    ctx.lineTo(sv.x + ev.x + center.x, (-1 * (sv.y + ev.y)) + center.y);
    ctx.stroke();
}

const clear = () => {
    ctx.fillStyle = "#4a4f5c";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#2a2d34";
    drawGrid(new v2(1, 0), new v2(0, 1));
}

var inputs = document.getElementsByTagName('input');
for (var i = 0; i < inputs.length; i++) {
    inputs[i].onchange = onChange;
}


let ihat, jhat;
let curIHat, curJHat;
let aniComplete = 0;
function onChange(e) {
    ihatx = document.getElementById('aa').value;
    ihaty = document.getElementById('ba').value;
    jhatx = document.getElementById('ab').value;
    jhaty = document.getElementById('bb').value;
    curIHat = ihat;
    curJHat = jhat;
    ihat = new v2(ihatx, ihaty);
    jhat = new v2(jhatx, jhaty);
    aniComplete = 0;
    animateToIHatJHat();
}

function animateToIHatJHat() {
    if (aniComplete > 1|| curIHat === undefined || curJHat === undefined) {
        return;
    }
    aniComplete += 0.01;
    curIHat = curIHat.scale(1 - aniComplete).add(ihat.scale(aniComplete));
    curJHat = curJHat.scale(1 - aniComplete).add(jhat.scale(aniComplete));
    clear();
    ctx.strokeStyle = "rgb(247, 230, 208)";
    drawGrid(curIHat, curJHat);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#f0721d";
    drawVectorFromVector(new v2(0, 0), new v2(curIHat.x, curIHat.y));
    ctx.strokeStyle = "#009ddc";
    drawVectorFromVector(new v2(0, 0), new v2(curJHat.x, curJHat.y));
    ctx.lineWidth = 1;
    document.getElementById('det').innerHTML = 'Determinante: ' + (curIHat.x * curJHat.y - curIHat.y * curJHat.x);
    requestAnimationFrame(animateToIHatJHat);
}

function arctan(x) {
    const radians = Math.atan(x);
    return radians * 180 / Math.PI;
}

const scale = 70;
const repeat = 100;
function drawGrid(ihat, jhat) {
    for (let i = -1 * repeat; i < repeat; i++) {
        drawVectorFromVector(ihat.scale(i), jhat.scale(repeat))
        drawVectorFromVector(ihat.scale(i), jhat.scale(-1 * repeat))
    }
    for (let i = -1 * repeat; i < repeat; i++) {
        drawVectorFromVector(jhat.scale(i), ihat.scale(repeat))
        drawVectorFromVector(jhat.scale(i), ihat.scale(-1 * repeat))
    }
}

clear();
onChange();