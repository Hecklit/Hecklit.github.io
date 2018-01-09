const can = document.getElementById('can');
const ctx = can.getContext('2d');
const can_zoom = document.getElementById('can_zoom');
const ctx_zoom = can_zoom.getContext('2d');
const width = can_zoom.width = can.width = window.innerWidth * 0.8;
const height = can_zoom.height = can.height = window.innerHeight * 0.45;
let canRect = can.getBoundingClientRect();
let mouseDown = false;
let startPos = null;
let color = 1;
let pathOffsetX = 0;
let pathOffsetY = 0;

window.onresize = (e) => {
    canRect = can.getBoundingClientRect();
};

can.onmouseup = (e) => {
}

can.onmousedown = (e) => {
}

can.onmousemove = (e) => {
}

window.onkeydown = (e) => {
    // console.log(e.keyCode);

    // Leertaste
    // if (e.keyCode === 87) { //W

    // }
    if (e.keyCode === 87) { //W
        moveRobot(0, -1);
    }
    if (e.keyCode === 65) { //A
        moveRobot(-1, 0);
    }
    if (e.keyCode === 83) { //S
        moveRobot(0, 1);
    }
    if (e.keyCode === 68) { //D
        moveRobot(1, 0);
    }
    filter();
    scatter();
    filter();
    drawZoomedView(level);
    draw(level);
}

function randomInt(scalar) {
    return Math.floor(Math.random() * scalar);
}

function clear(ctx) {
    ctx.fillStyle = "#4a4f5c";
    ctx.fillRect(0, 0, width, height);
}

let level = base_level;
const numRows = 51 //Math.floor(height / size);
const numCols = 74 //Math.floor(width / size);
const size = Math.floor(height / numRows)//10;
let particles = [];
const numParticles = 1000;
const path = [];
for (let i = 0; i < numParticles; i++) {
    const particle = new v2(
        Math.floor(Math.random() * (width)) - size,
        Math.floor(Math.random() * (height)) - size
    );
    particles.push(particle)
}
function draw(level) {
    clear(ctx);
    for (let i = 0; i < numRows; i++) {
        for (let u = 0; u < numCols; u++) {
            if (level[i][u] === 0)
                ctx.fillStyle = '#ddd';
            if (level[i][u] === 1)
                ctx.fillStyle = '#aaa';
            ctx.fillRect(u * size, i * size, size, size);
        }
    }

    const removals = [];
    for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        const res = drawPathForParticle(particle, path);
        const newPos = res.lastPos;
        const validPath = res.validPath;
        if(!validPath)
        {
            removals.push(i);
            continue;
        }
        if (newPos !== null) {
            //particles[i] = newPos
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.arc(newPos.x, newPos.y, 2, 0, 2 * Math.PI);
            ctx.stroke();
        } else {
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }
    for (let i = 0; i < removals.length; i++) {
        const index = removals[i];
        particles.splice(index, 1);
    }
}

function isValidPos(screenX, screenY) {
    // console.log(screenX, screenY)
    const sx = Math.floor(screenX / size);
    const sy = Math.floor(screenY / size);
    if (sy < 0 || sy >= level.length || sx < 0 || sy >= level[0].length)
        return false;

    return level[sy][sx] == 1;
}

function isValidInd(iX, iY) {
    return level[iY][iX] == 1;
}

function filter() {
    const offset = indexToScreenPos(pathOffsetX, pathOffsetY);
    particles = particles.filter(p => isValidPos(p.x + offset.x, p.y + offset.y));
}

function scatter() {
    const newParticles = [];
    for (let i = 0; i < particles.length && particles.length <= numParticles; i++) {
        const particle = particles[i];
        newParticles.push(new v2(
            particle.x + size/2 - 1 * size * Math.random(),
            particle.y + size/2 - 1 * size * Math.random()
        ))
    }
    particles = particles.concat(newParticles);
}

function moveRobot(dx, dy) {
    if (isValidInd(curPos.x + dx, curPos.y + dy)) {
        curPos.x += dx;
        curPos.y += dy;
        path.push(new v2(curPos.x, curPos.y));
        pathOffsetX += dx;
        pathOffsetY += dy;
    }
}

function drawPathForParticle(particle, path) {
    ctx.beginPath();
    let lastPos = null;
    let validPath = true;
    for (let i = Math.max(0, path.length - 1 -20); i < path.length - 1; i++) {
        const s = path[i];
        const e = path[i + 1];
        const posS = indexToScreenPos(s.x, s.y);
        const posE = indexToScreenPos(e.x, e.y);
        ctx.moveTo(
            posS.x + particle.x - size * 2,
            posS.y + particle.y - size * 2
        );
        lastPos = new v2(
            posE.x + particle.x - size * 2,
            posE.y + particle.y - size * 2
        );
        ctx.lineTo(lastPos.x, lastPos.y);
        if(!isValidPos(lastPos.x, lastPos.y)){
            validPath = false;
        }
    }
    ctx.strokeStyle = "rgba(0, 255, 0, 0.01)";;
    ctx.stroke();
    return {
        lastPos,
        validPath
    };
}

function drawPath(path) {
    ctx_zoom.beginPath();
    for (let i = 0; i < path.length - 1; i++) {
        const s = path[i];
        const e = path[i + 1];
        const posS = indexToZoomedScreenPos(s.x, s.y);
        const posE = indexToZoomedScreenPos(e.x, e.y);
        ctx_zoom.moveTo(
            posS.x + (size / 2 * zoomFactor),
            posS.y + (size / 2 * zoomFactor)
        );
        ctx_zoom.lineTo(
            posE.x + (size / 2 * zoomFactor),
            posE.y + (size / 2 * zoomFactor)
        );
    }
    ctx_zoom.strokeStyle = 'red';
    ctx_zoom.stroke();
}

function indexToZoomedScreenPos(ix, iy) {
    return new v2(
        ix * size * zoomFactor - curPos.x * size * zoomFactor + width / 2 - (size / 2 * zoomFactor),
        iy * size * zoomFactor - curPos.y * size * zoomFactor + height / 2 - (size / 2 * zoomFactor)
    );
}

function indexToScreenPos(ix, iy) {
    return new v2(
        ix * size,
        iy * size
    );
}

let curPos = new v2(2, 2);
path.push(new v2(curPos.x, curPos.y));
const zoomFactor = 4;
function drawZoomedView(level) {
    clear(ctx_zoom);
    for (let i = 0; i < numRows; i++) {
        for (let u = 0; u < numCols; u++) {
            if (level[i][u] === 0)
                ctx_zoom.fillStyle = '#ddd';
            if (level[i][u] === 1)
                ctx_zoom.fillStyle = '#aaa';
            const pos = indexToZoomedScreenPos(u, i);
            ctx_zoom.fillRect(
                pos.x,
                pos.y
                , size * zoomFactor, size * zoomFactor);
            ctx_zoom.fillStyle = 'red';
            ctx_zoom.beginPath();
            ctx_zoom.arc(
                width / 2,
                height / 2,
                10, 0, 2 * Math.PI);
            ctx_zoom.fill();
        }
    }
    drawPath(path);
}

draw(level);
drawZoomedView(level);
filter();
draw(level);