const can = document.getElementById('can');
const ctx = can.getContext('2d');
const width = can.width = window.innerWidth *0.8;
const height = can.height = window.innerHeight *0.8;
let canRect = can.getBoundingClientRect();
const points = [new v2(100, 100), new v2(150, 150), new v2(200, 100), new v2(300, 10)];
const psize = 4;
let mouseDown = false;
let algoRythm = 'grahams_scan';
// Handle Radio Button clicks
const radioButtons = document.algos.choices;
radioButtons.forEach(radio => {
    radio.addEventListener('change', (e) => {
        algoRythm = e.currentTarget.value;
        calcConvexHull(points);
    });
});

window.onresize = (e) => {
    canRect = can.getBoundingClientRect();
};

calcConvexHull(points);

can.onmouseup = () => {
    mouseDown = false;
}

can.onmousedown = (e) => {
    mouseDown = true;
    const newPoint = new v2(e.clientX-canRect.left, e.clientY-canRect.top);
    if(addToSet(newPoint)) {
        calcConvexHull(points);
    }
}

can.onmousemove = (e) => {
    if(mouseDown) {
        const newPoint = new v2(e.clientX-canRect.left, e.clientY-canRect.top);
        if(points.filter(p => p.x === newPoint.x && p.y === newPoint.y).length === 0) {
            points[points.length-1].x = newPoint.x;
            points[points.length-1].y = newPoint.y;
            calcConvexHull(points);
        }
    }
}

window.onkeydown = (e) => {
    // Leertaste
    if(e.keyCode === 32) {
        for (var i = 0; i < 5; i++) {
            addToSet(new v2(width*0.1+randomInt(width*0.8), height*0.1+randomInt(height*0.8)))
        }
        calcConvexHull(points);
    }
}

function randomInt(scalar) {
    return Math.floor(Math.random()*scalar);
}

function calcConvexHull(points) {
    clear();
    onUpdate();
    let convexHull = [];
    switch (algoRythm) {
        case 'grahams_scan':
            ctx.strokeStyle = "#F00";
            convexHull = grahamsScan(points);
            drawHull(convexHull);
            break;
            case 'jarvis_march':
            ctx.strokeStyle = "#0FF";
            convexHull = jarvisMarch(points);
            drawHull(convexHull);
            break;
        default:
            console.error("Unvalid Algorythm selected");
            break;
    }
}

function addToSet(newPoint) {
    if(points.filter(p => p.x === newPoint.x && p.y === newPoint.y).length === 0) {
        points.push(newPoint);
        return true;
    }
    return false;
}

function onUpdate () {
    ctx.fillStyle = "#000";
    for(i in points) {
        const point = points[i];
        ctx.fillRect(point.x, point.y, psize, psize);
    }
}

function clear() {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0, width, height);
}

function getCurve(p1, p2, p3) {
    p2p1 = p2.sub(p1);
    p3p1 = p3.sub(p1);

    const scalar = p2p1.dot(p3p1);
    return scalar;
}

function drawHull(arr) {
    if(arr.length < 1)
        return;
    ctx.beginPath();
    ctx.moveTo(arr[0].x, arr[0].y);
    for (var i = 0; i < arr.length; i++) {
        var element = arr[i];
        var next = arr[i+1];
        if(i === arr.length-1) {
            ctx.lineTo(arr[0].x, arr[0].y)
        }else{
            ctx.lineTo(next.x, next.y);
        }
    }
    ctx.stroke();
}