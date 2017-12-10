const can = document.getElementById('can');
let canRect = can.getBoundingClientRect();
const ctx = can.getContext('2d');
const width = can.width = window.innerWidth*0.9;
const height = can.height = window.innerHeight*0.9;
const center = new v2(width/2, height/2);
const lines = [];
let interP = [];
let mouseDown = false;
let startPoint = null;
clearScreen();

function draw() {
    clearScreen();
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        drawLine(line.start.x, line.start.y, line.end.x, line.end.y)      
    }
    for (let i = 0; i < interP.length; i++) {
        const point = interP[i];
        ctx.beginPath();
        ctx.arc(point.x,point.y,4,0,2*Math.PI);
        ctx.fillStyle = '#f00';
        ctx.fill();
        ctx.stroke();
    }
}

function clearScreen () {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0, width, height);
}

can.onmousedown = (e) => {
    mouseDown = true;
    startPoint = new v2(e.clientX-canRect.left, e.clientY-canRect.top); 
}

can.onmousemove = (e) => {
    // for the visuals
    if(mouseDown && startPoint != null) {
        draw();
        endPoint = new v2(e.clientX-canRect.left, e.clientY-canRect.top);
        lineSegVec = endPoint.sub(startPoint);
        let type = null;
        if(Math.abs(lineSegVec.x) > Math.abs(lineSegVec.y)) {
            // horizontal
            drawLine(startPoint.x,startPoint.y, endPoint.x,startPoint.y)
        } else {
            // vertical
            drawLine(startPoint.x,startPoint.y, startPoint.x, endPoint.y);
        }
    }
}

can.onmouseup = (e) => {
    if(mouseDown && startPoint != null) {
        // add a new line seg
        // determin if its horizontal or vertical
        endPoint = new v2(e.clientX-canRect.left, e.clientY-canRect.top);
        lineSegVec = endPoint.sub(startPoint);
        let type = null;
        if(Math.abs(lineSegVec.x) > Math.abs(lineSegVec.y)) {
            // horizontal
            type = 'h'
            endPoint.y = startPoint.y;
        } else {
            // vertical
            type = 'v'
            endPoint.x = startPoint.x;
        }
        lines.push({
          start: startPoint,
          end: endPoint,
          type: type
        })
        // Start with Algo
        events = generateEvents(lines);
        intersectionPoints = intersectIsoOritentedLineSeg(events);
        interP = intersectionPoints;
        // draw Points
        for (let i = 0; i < intersectionPoints.length; i++) {
            const point = intersectionPoints[i];
            ctx.beginPath();
            ctx.arc(point.x,point.y,4,0,2*Math.PI);
            ctx.fillStyle = '#f00';
            ctx.fill();
            ctx.stroke();
        }
    }
    mouseDown = false;
}



function drawLine(sx, sy, ex, ey){
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
}