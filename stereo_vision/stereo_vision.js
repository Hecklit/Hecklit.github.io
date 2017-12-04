const can = document.getElementById('can');
const ctx = can.getContext('2d');
const width = can.width = window.innerWidth * 1;
const height = can.height = window.innerHeight * 0.9;
let canRect = null, tdv = null, lcv = null, rcv = null;
setUpCanvas();
let mouseDown = false;
clear();

// construct world
const cube1 = {
    color: '#0ff',
    pos: new v3()
}



function setUpCanvas() {
    canRect = can.getBoundingClientRect();
    // Seperate the Canvas Rect Into 3 Parts
    /*
    top down view : full width height 2/3
    and the two camera views: width/2 height 1/3
    */
    tdv = {
        left: 0,
        right: canRect.width,
        top: 0,
        bottom: (2 / 3) * canRect.height,
        width: canRect.width - 0,
        height: ((2 / 3) * canRect.height),
        x: 0,
        y: 0
    };

    lcv = {
        left: 0,
        right: canRect.width / 2,
        top: tdv.bottom + 1,
        bottom: canRect.height,
        width: (canRect.width / 2) - 0,
        height: canRect.height - tdv.bottom + 1,
        x: 0,
        y: tdv.bottom + 1
    };

    rcv = {
        left: lcv.right + 1,
        right: canRect.width,
        top: tdv.bottom + 1,
        bottom: canRect.height,
        width: canRect.width - lcv.right + 1,
        height: canRect.height - tdv.bottom + 1,
        x: lcv.right + 1,
        y: tdv.bottom + 1
    };

    // Add centers
    tdv.centerX = tdv.x + tdv.width / 2;
    tdv.centerY = tdv.y + tdv.height / 2;
    lcv.centerX = lcv.x + lcv.width / 2;
    lcv.centerY = lcv.y + lcv.height / 2;
    rcv.centerX = rcv.x + rcv.width / 2;
    rcv.centerY = rcv.y + rcv.height / 2;
}

window.onresize = (e) => {
    setUpCanvas();
};

can.onmouseup = () => {
}

can.onmousedown = (e) => {
}

can.onmousemove = (e) => {
    if (mouseDown) {
    }
}

window.onkeydown = (e) => {
    // Leertaste
    if (e.keyCode === 32) {
    }
}

function randomInt(scalar) {
    return Math.floor(Math.random() * scalar);
}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function clear() {
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    if (false) { // draw Debug Particion
        ctx.globalAlpha = 0.5;
        // Top Down
        ctx.fillStyle = "#0ff";
        ctx.fillRect(tdv.x, tdv.y, tdv.width, tdv.height);
        drawCrossHair(tdv);
        // Left Camera
        ctx.fillStyle = "#f0f";
        ctx.fillRect(lcv.x, lcv.y, lcv.width, lcv.height);
        drawCrossHair(lcv);
        // Right Camera
        ctx.fillStyle = "#ff0";
        ctx.fillRect(rcv.x, rcv.y, rcv.width, rcv.height);
        drawCrossHair(rcv);
    }
}

function drawCrossHair(box) {
    drawLine(box.centerX, box.top, box.centerX, box.bottom);
    drawLine(box.left, box.centerY, box.right, box.centerY);
}

function addWebGLViewports() {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // Define the perspective camera's attributes.

    var renderer = window.WebGLRenderingContext ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer(); // Fallback to canvas renderer, if necessary.
    renderer.setSize(window.innerWidth, window.innerHeight); // Set the size of the WebGL viewport.
    document.body.appendChild(renderer.domElement); // Append the WebGL viewport to the DOM.

    var geometry = new THREE.CubeGeometry(20, 20, 20); // Create a 20 by 20 by 20 cube.
    var material = new THREE.MeshBasicMaterial({ color: 0x0000FF }); // Skin the cube with 100% blue.
    var cube = new THREE.Mesh(geometry, material); // Create a mesh based on the specified geometry (cube) and material (blue skin).
    scene.add(cube); // Add the cube at (0, 0, 0).

    camera.position.z = 50; // Move the camera away from the origin, down the positive z-axis.

    renderer.render(scene, camera);
}

function projectTo2D(a, camera) {
    const { c, theta, width, height, distance } = camera;
    const { x, y, z } = a.sub(c);
    const sx = Math.sin(theta.x);
    const cx = Math.cos(theta.x);
    const sy = Math.sin(theta.y);
    const cy = Math.cos(theta.y);
    const sz = Math.sin(theta.z);
    const cz = Math.cos(theta.z);

    const dx = cy * (sz * y + cz * x) - sy * z;
    const dy = sx * (cy * z + sy * (sz * y + cz * x)) + cx * (cz * y - sz * x);
    const dz = cx * (cy * z + sy * (sz * y + cz * x)) - sx * (cz * y - sz * x);

    const rx = width;
    const ry = height;
    const rz = distance;

    return {
        x: (dx*sx)
    }
}
