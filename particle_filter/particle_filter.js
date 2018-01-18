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
    // console.log(e.keyCode)
    if (e.keyCode === 32) { // leertaste
        debug = !debug;
    }
    if (e.keyCode === 87 || e.keyCode === 38) { //W
        moveRobot(0, -1);
    }
    if (e.keyCode === 65 || e.keyCode === 37) { //A
        moveRobot(-1, 0);
    }
    if (e.keyCode === 83 || e.keyCode === 40) { //S
        moveRobot(0, 1);
    }
    if (e.keyCode === 68 || e.keyCode === 39) { //D
        moveRobot(1, 0);
    }
}

function randomInt(scalar) {
    return Math.floor(Math.random() * scalar);
}

function clear(ctx) {
    ctx.fillStyle = "#4a4f5c";
    ctx.fillRect(0, 0, width, height);
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

    const groundTruth = getLaserSensorValues(indexToScreenPos(curPos.x, curPos.y), true);
    const removals = [];
    for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        const res = drawPathForParticle(particle, path);
        const newPos = res.lastPos;
        const validPath = res.validPath;
        if(!validPath)
        {
            removals.push(particle);
            continue;
        }
        // laser scan evalutation
        let laser_scanner_result;
        if (newPos !== null) {
            laser_scanner_result = getLaserSensorValues(newPos);
        }else{
            laser_scanner_result = getLaserSensorValues(particle);
        }
        let diff = 0;
        for (let a = 0; a < groundTruth.length; a++) {
            const truth = groundTruth[a].step;
            diff += Math.abs(laser_scanner_result[a].step - truth);
        }
        let radius = 4;
        if(diff > 3500){
            removals.push(particle);
            continue;
        }else{
            const red_val = 255-Math.floor(255*diff/3500);
            radius *= 1 - (diff/3500);
            ctx.fillStyle = `rgb(${red_val}, 0, 0)`;
        }
        if (newPos !== null) {
            ctx.beginPath();
            ctx.arc(newPos.x, newPos.y, radius, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, radius, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    particles = getArrayDiff(particles, removals);
}

function getArrayDiff(a, b) {
    var ret = [];
    if (!(Array.isArray(a) && Array.isArray(b))) {
        return ret;
    }
    var i;
    var key;

    for (i = a.length - 1; i >= 0; i--) {
      key = a[i];
      if (-1 === b.indexOf(key)) {
        ret.push(key);
      }
    }

    return ret;
}

function chooseOne(arr) {
    return arr[Math.floor(Math.random()*arr.length)];
}

function isValidPos(screenX, screenY) {
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

function screenToIndex(screenX, screenY) {
    return new v2(
        Math.floor(screenX / size),
        Math.floor(screenY / size)
    );
}

function scatter() {
    const newParticles = [];
    for (let i = 0; i < particles.length && particles.length <= numParticles; i++) {
        const particle = particles[i];
        const new_particle = new v2(
            particle.x + size/2 - 1 * size * Math.random(),
            particle.y + size/2 - 1 * size * Math.random()
        );
        new_particle.dir = chooseOne([new v2(1, 1),new v2(-1, 1),new v2(1, -1),new v2(-1, -1)]);
        newParticles.push(new_particle);
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

        scatter();
        if(particles.length <= numParticles*0.5) {
            for (let i = 0; i < numParticles; i++) {
                if(particles.length > numParticles*0.8){
                    break;
                }
                const particle = new v2(
                    Math.floor(Math.random() * (size*numCols)) - size,
                    Math.floor(Math.random() * (size*numRows)) - size
                );
                particle.dir = chooseOne([new v2(1, 1),new v2(-1, 1),new v2(1, -1),new v2(-1, -1)]);
                particles.push(particle)
            }
        }
        const res = getLaserSensorValues(indexToScreenPos(curPos.x, curPos.y), true);
        drawZoomedView(level);
        draw(level);
        for (let i = 0; i < res.length; i++) {
            const val = res[i];
            drawDebugPoint(
                unzoomedToZoomedScreenPos(val.start),
                unzoomedToZoomedScreenPos(val.cur_pos));
        }
    }
}

function drawPathForParticle(particle, path) {
    ctx.beginPath();
    let lastPos = null;
    let validPath = true;
    for (let i = Math.max(0, path.length - 1 -10); i < path.length - 1; i++) {
        const s = path[i];
        const e = path[i + 1];
        const posS = indexToScreenPos(s.x, s.y);
        const posE = indexToScreenPos(e.x, e.y);
        ctx.moveTo(
            (posS.x*particle.dir.x) + particle.x - size * 2,
            (posS.y*particle.dir.y) + particle.y - size * 2
        );
        lastPos = new v2(
            (posE.x*particle.dir.x) + particle.x - size * 2,
            (posE.y*particle.dir.y) + particle.y - size * 2
        );
        ctx.lineTo(lastPos.x, lastPos.y);
        if(!isValidPos(lastPos.x, lastPos.y)){
            validPath = false;
            break;
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

function unzoomedToZoomedScreenPos(pos) {
    return new v2(
        pos.x * zoomFactor - curPos.x * size * zoomFactor + width / 2 - (size / 2 * zoomFactor),
        pos.y * zoomFactor - curPos.y * size * zoomFactor + height / 2 - (size / 2 * zoomFactor)
    );
}

function getLaserSensorValues(pos, debug) {
    const theta = 360/16;
    const results = [];
    for (let i = 0; i < 16; i++) {
        results[i] = rayCast(pos, degree_to_unit_vector(theta*i), 0.5, debug);
    }
    return results;
}

function rayCast(start, dir, step_size, debug) {
    let step = 0;
    let cur_pos = start;
    while(step < 9000)
    {
        step++;
        cur_pos = start.add(dir.scale(step_size*step));
        if(!isValidPos(cur_pos.x, cur_pos.y)){
            return {step, start, cur_pos};
        }
    }
    drawDebugPoint(start, cur_pos);
    return {step: -1, start, cur_pos};
}

function drawDebugPoint(start, pos) {
    start.x += size*zoomFactor/2;
    start.y += size*zoomFactor/2;
    ctx_zoom.fillStyle = 'green';
    ctx_zoom.strokeStyle = 'green';
    ctx_zoom.beginPath()
    ctx_zoom.moveTo(start.x, start.y);
    ctx_zoom.lineTo(pos.x, pos.y);
    ctx_zoom.stroke();
    ctx_zoom.fillRect(pos.x, pos.y, size, size);
}

function indexToScreenPos(ix, iy) {
    return new v2(
        ix * size,
        iy * size
    );
}

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

function degree_to_unit_vector(theta) {
    const x = Math.cos(theta*Math.PI / 180);
    const y = Math.sin(theta*Math.PI / 180);
    return new v2(x, y);
}

function printDebug(str) {
    if(debug)
        console.log(str);
}

let level = base_level;
let debug = false;
const numRows = 51 //Math.floor(height / size);
const numCols = 74 //Math.floor(width / size);
const size = Math.floor(height / numRows)//10;
let particles = [];
const numParticles = 1000;
const path = [];
for (let i = 0; i < numParticles; i++) {
    const particle = new v2(
        Math.floor(Math.random() * (size*numCols)) - size,
        Math.floor(Math.random() * (size*numRows)) - size
    );
    particle.dir = chooseOne([new v2(1, 1),new v2(-1, 1),new v2(1, -1),new v2(-1, -1)]);
    particles.push(particle)
}

let curPos = new v2(2, 6);
const perfect_particle = new v2(2.5*size, 6.5*size);
perfect_particle.dir = new v2(1,1);
perfect_particle.isPerfectParticle = true;
particles.push(perfect_particle);
path.push(new v2(curPos.x, curPos.y));
const zoomFactor = 4;
draw(level);
drawZoomedView(level);
filter();
draw(level);

