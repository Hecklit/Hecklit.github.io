const can = document.getElementById('can');
const width = can.width = window.innerWidth * 0.95;
const height = can.height = window.innerHeight * 0.9;
console.log('height', height)
let canRect = null, tdv = null, lcv = null, rcv = null;
setUpCanvas();
let mouseDown = false;
let cube = null;
let rendererTDV = null;
let rendererLCV = null;
let rendererRCV = null;
let scene = null;
let cameraTDV = null;
let cameraLCV = null;
let cameraRCV = null;

function setUpCanvas() {
    canRect = can.getBoundingClientRect();
    console.log(canRect)
    // Seperate the Canvas Rect Into 3 Parts
    /*
    top down view : full width height 2/3
    and the two camera views: width/2 height 1/3
    */
    tdv = {
        left: 0,
        right: width,
        top: 0,
        bottom: (2 / 3) * height,
        width: width - 0,
        height: ((2 / 3) * height),
        x: 0,
        y: 0
    };

    lcv = {
        left: 0,
        right: width / 2,
        top: tdv.bottom,
        bottom: height,
        width: (width / 2) - 0,
        height: height - tdv.bottom,
        x: 0,
        y: tdv.bottom
    };

    rcv = {
        left: lcv.right,
        right: width,
        top: tdv.bottom,
        bottom: height,
        width: width - lcv.right,
        height: height - tdv.bottom,
        x: lcv.right,
        y: tdv.bottom
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

function addWindowLabel(text, x, y) {
    var text2 = document.createElement('div');
    text2.style.position = 'absolute';
    //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
    text2.style.width = 100;
    text2.style.height = 100;
    text2.style.color = "white";
    text2.innerHTML = text;
    text2.style.top = y + 'px';
    text2.style.left = x + 'px';
    can.appendChild(text2);
}

function addWebGLViewports() {
    // Top Down View
    scene = new THREE.Scene();
    scene.background = new THREE.Color().setHSL(0.6, .2, .2);
    scene.fog = new THREE.Fog(scene.background, 1, 5000);
    const yOffset = 50;
    cameraTDV = new THREE.OrthographicCamera(tdv.width / - 10, tdv.width / 10, tdv.height / 10 + yOffset, tdv.height / - 10 + yOffset, 1, 1000);

    rendererTDV = window.WebGLRenderingContext ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
    rendererTDV.setSize(tdv.width, tdv.height);
    let tdvHTML = can.appendChild(rendererTDV.domElement);
    let boundBox = tdvHTML.getBoundingClientRect();
    addWindowLabel('Top-Down View', boundBox.x + 8, boundBox.y + 8);

    var geometry = new THREE.CubeGeometry(20, 20, 20);
    var material = new THREE.MeshStandardMaterial({ color: 0x0000FF });
    cube = new THREE.Mesh(geometry, material);
    cube.position.z = -40;
    scene.add(cube);

    var geometry = new THREE.CubeGeometry(20, 20, 20);
    var material = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
    cube = new THREE.Mesh(geometry, material);
    cube.position.z = -30;
    cube.position.x = -30;
    scene.add(cube);

    var geometry = new THREE.CubeGeometry(20, 20, 20);
    var material = new THREE.MeshStandardMaterial({ color: 0x00FF00 });
    cube = new THREE.Mesh(geometry, material);
    cube.position.z = -80;
    cube.position.x = 60;
    scene.add(cube);

    hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    var light = new THREE.PointLight(0xff00ff, 1.5, 1000, 0);
    scene.add(light)

    var light = new THREE.DirectionalLight(0xff00ff, 1.5, 1000, 0);
    scene.add(light)

    cameraTDV.position.y = 100;
    cameraTDV.rotation.x = -90 * Math.PI / 180

    // Left Camera View
    cameraLCV = new THREE.PerspectiveCamera(75, lcv.width / lcv.height, 0.1, 1000);

    rendererLCV = window.WebGLRenderingContext ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
    rendererLCV.setSize(lcv.width, lcv.height);
    let lcvHTML = can.appendChild(rendererLCV.domElement);
    boundBox = lcvHTML.getBoundingClientRect();
    addWindowLabel('Left Camera View', boundBox.x + 8, boundBox.y + 8);

    cameraLCV.position.x = -10;

    // Right Camera View
    cameraRCV = new THREE.PerspectiveCamera(75, rcv.width / rcv.height, 0.1, 1000);

    rendererRCV = window.WebGLRenderingContext ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
    rendererRCV.setSize(rcv.width, rcv.height);
    let rcvHTML = can.appendChild(rendererRCV.domElement);
    boundBox = rcvHTML.getBoundingClientRect();
    addWindowLabel('Right Camera View', boundBox.x + 8, boundBox.y + 8);

    cameraRCV.position.x = 10;

    scene.add(new THREE.CameraHelper(cameraLCV));
    scene.add(new THREE.CameraHelper(cameraRCV));

    rendererLCV.render(scene, cameraLCV);
    rendererRCV.render(scene, cameraRCV);
    rendererTDV.render(scene, cameraTDV);
}
addWebGLViewports();

window.onkeydown = (e) => {
    // Leertaste
    if(e.keyCode === 32) {
        cube.position.x += 0.5;
        rendererLCV.render(scene, cameraLCV);
        rendererRCV.render(scene, cameraRCV);
        rendererTDV.render(scene, cameraTDV);
    }
}

