const can = document.getElementById('can');
const ctx = can.getContext('2d');
const width = can.width = window.innerWidth *0.8;
const height = can.height = window.innerHeight *0.8;
let canRect = can.getBoundingClientRect();
let mouseDown = false;

window.onresize = (e) => {
    canRect = can.getBoundingClientRect();
};

can.onmouseup = () => {
}

can.onmousedown = (e) => {
}

can.onmousemove = (e) => {
    if(mouseDown) {
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
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0, width, height);
}
