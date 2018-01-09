const can = document.getElementById('can');
const ctx = can.getContext('2d');
const width = can.width = window.innerWidth * 0.8;
const height = can.height = window.innerHeight * 0.8;
let canRect = can.getBoundingClientRect();
let mouseDown = false;
let startPos = null;
let color = 1;

window.onresize = (e) => {
    canRect = can.getBoundingClientRect();
};

can.onmouseup = (e) => {
    if (mouseDown) {
        mouseDown = false;
        const endPos = new v2(e.pageX - can.offsetLeft, e.pageY - can.offsetTop);
        const sx = Math.floor(startPos.x/size);
        const sy = Math.floor(startPos.y/size);
        const ex = Math.floor(endPos.x/size);
        const ey = Math.floor(endPos.y/size);
        fillArea(sx, sy, ex, ey, color);
    }
    draw(level);
}

can.onmousedown = (e) => {
    mouseDown = true;
    startPos = new v2(e.pageX - can.offsetLeft, e.pageY - can.offsetTop);
}

can.onmousemove = (e) => {
    if (mouseDown) {
        const endPos = new v2(e.pageX - can.offsetLeft, e.pageY - can.offsetTop);
        const sx = Math.floor(startPos.x/size);
        const sy = Math.floor(startPos.y/size);
        const ex = Math.floor(endPos.x/size);
        const ey = Math.floor(endPos.y/size);
        draw(level);
        ctx.fillStyle = (color==1)?'#aaa' : '#ddd';
        ctx.fillRect(sx*size, sy*size, (ex-sx)*size, (ey-sy)*size);
    }
}

window.onkeydown = (e) => {
    // Leertaste
    if (e.keyCode === 32) {
        if(color == 1){
            color = 0;
        }else{
            color = 1;
        }
    }
}

function randomInt(scalar) {
    return Math.floor(Math.random() * scalar);
}

function clear() {
    ctx.fillStyle = "#4a4f5c";
    ctx.fillRect(0, 0, width, height);
}

const level = [];
const numRows = 51 //Math.floor(height / size);
const numCols = 74 //Math.floor(width / size);
const size = Math.floor(width/numCols)//10;
for (let i = 0; i < numRows; i++) {
    level.push([]);
    for (let u = 0; u < numCols; u++) {
        level[i].push(0);
    }
}
function draw(level) {
    clear();
    for (let i = 0; i < numRows; i++) {
        for (let u = 0; u < numCols; u++) {
            if (level[i][u] === 0)
                ctx.fillStyle = '#ddd';
            if (level[i][u] === 1)
                ctx.fillStyle = '#aaa';
            ctx.fillRect(u * size, i * size, size, size);
        }
    }
    console.log(JSON.stringify(level))
}

function fillArea(sx, sy, ex, ey, color) {
    for (let i = sy; i < ey; i++) {
        for (let u = sx; u < ex; u++) {
            level[i][u] = color;
        }
    }
}

draw(level);