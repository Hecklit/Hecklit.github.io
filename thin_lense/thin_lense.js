const can = document.getElementById('can');
const desc = document.getElementById('desc');
const ctx = can.getContext('2d');
const width = can.width = window.innerWidth -20;
const height = can.height = window.innerHeight *0.8;
const center = new v2(width, height).scale(0.5);
let canRect = can.getBoundingClientRect();
let mouseDown = false;
let f = 40.0;
let debug = false;
let x_lens_center = center.x;
let y_p = height/6;

window.onresize = (e) => {
    canRect = can.getBoundingClientRect();
};

can.onmouseup = () => {
    mouseDown = false;
}

can.onmousedown = (e) => {
    mouseDown = true;
    const newPoint = new v2(e.clientX-canRect.left, e.clientY-canRect.top);
    x_lens_center = newPoint.x;
    y_p = newPoint.y;
    if(x_lens_center < width*0.1 + width*0.025) {
        x_lens_center = width*0.1 + width*0.025;
    }
    if(x_lens_center > width*0.9 - width*0.025) {
        x_lens_center = width*0.9 - width*0.025;
    }
    if(y_p < height*0.1 + 10) {
        y_p = height*0.1 + 10;
    }
    if(y_p > height*0.9 - 10) {
        y_p = height*0.9 - 10;
    }
    draw();
}

can.onmousemove = (e) => {
    if(mouseDown) {
        const newPoint = new v2(e.clientX-canRect.left, e.clientY-canRect.top);
        x_lens_center = newPoint.x;
        y_p = newPoint.y;
        if(x_lens_center < width*0.1 + width*0.025) {
            x_lens_center = width*0.1 + width*0.025;
        }
        if(x_lens_center > width*0.9 - width*0.025) {
            x_lens_center = width*0.9 - width*0.025;
        }
        if(y_p < height*0.1 + 10) {
            y_p = height*0.1 + 10;
        }
        if(y_p > height*0.9 - 10) {
            y_p = height*0.9 - 10;
        }
        draw();
    }
}

window.onkeydown = (e) => {
    // Leertaste
    if(e.keyCode === 32) {
        debug = !debug;
        draw();
    }
}

function randomInt(scalar) {
    return Math.floor(Math.random()*scalar);
}

function clear() {
    ctx.fillStyle = "#4a4f5c";
    ctx.fillRect(0,0, width, height);
}

function drawPoint(color, x, y=null) {
    if(y === null) {
        y = x.y;
        x = x.x;
    }
    ctx.fillStyle = color;
    if(!y) {
        y = x.y;
        x = x.x;
    }
    const size = 4;
    ctx.fillRect(x -size/2, y -size/2 , size, size);
}

function draw_line(start, end) {
    ctx.beginPath()
    moveTo(start);
    lineTo(end);
    ctx.stroke();
}

function line_through_point(p, horizontal, scale_rel_img=0.6) {
    if(horizontal) {
        let start = p.add(new v2(-1, 0).scale(width*scale_rel_img))
        let end = p.add(new v2(1, 0).scale(width*scale_rel_img))
        draw_line(start, end)
        return [start, end];
    }else{
        let start = p.add(new v2(0, -1).scale(height*scale_rel_img))
        let end = p.add(new v2(0, 1).scale(height*scale_rel_img))
        draw_line(start, end)
        return [start, end];
    }
}

function draw() {
    clear();
    const lens_center = new v2(x_lens_center, center.y);
    const real_world_center = new v2(width*0.9, height/2);
    const p = new v2(real_world_center.x, y_p);
    const p_on_lense = new v2(lens_center.x, p.y);
    const projection_center = new v2(width*0.1, height/2);
    const z = p.x - lens_center.x;
    const z_prime = lens_center.x - projection_center.x;
    const y = lens_center.y - p.y;
    const y_prime = - z_prime/z * y;
    const p_projected = projection_center.sub(new v2(0, y_prime));
    const f = 1/(1/z + 1/z_prime); // thin lense equation
    // desc.innerText = `f = 1/(1/z' + 1/z)   z' = ${z_prime.toFixed(2)} z = ${z.toFixed(2)} f = ${f.toFixed(2)}`;
    const focal_point = lens_center.sub(new v2(f, 0))
    
    // horizontal/ vertical lines
    ctx.strokeStyle = 'black';
    line_through_point(lens_center, true, 1.0);
    line_through_point(projection_center, false);
    line_through_point(real_world_center, false);
    const lens_endpoints = line_through_point(lens_center, false, 0.4);
    const lens_start = lens_endpoints[0];
    const lens_end = lens_endpoints[1];

    // draw lense
    ctx.beginPath();
    moveTo(lens_start);
    ctx.quadraticCurveTo(lens_center.x+width*0.05,lens_center.y,lens_end.x,lens_end.y);
    ctx.stroke();
    ctx.beginPath();
    moveTo(lens_start);
    ctx.quadraticCurveTo(lens_center.x-width*0.05,lens_center.y,lens_end.x,lens_end.y);
    ctx.stroke();
    
    // draw linesegments
    ctx.strokeStyle = 'gray';
    draw_line(p, p_on_lense);
    draw_line(p_on_lense, p_projected);
    draw_line(p, p_projected);

    // explanation lines
    if(width > 600) {
        ctx.font =  "20px Arial";
    }else{
        ctx.font =  "16px Arial";
    }
    
    ctx.strokeStyle = 'yellow';
    ctx.fillStyle = 'yellow'
    draw_line(new v2(projection_center.x, lens_end.y), lens_end);
    ctx.fillText(`z' = ${z_prime.toFixed(2)}`, (projection_center.x + lens_end.x)/2, lens_end.y + 20);
    
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white'
    draw_line(lens_center, focal_point);
    ctx.fillText(`f = ${f.toFixed(2)}`, (lens_center.x + focal_point.x)/2, lens_center.y + 20);
    
    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'red'
    draw_line(projection_center, p_projected);
    ctx.fillText(`y' = ${y_prime.toFixed(2)}`, p_projected.x , (projection_center.y + p_projected.y)/2);
    
    ctx.strokeStyle = 'orange';
    ctx.fillStyle = 'orange'
    draw_line(real_world_center, p);
    ctx.fillText(`y = ${y.toFixed(2)}`, real_world_center.x -60, (real_world_center.y + p.y)/2);

    // points
    drawPoint('red', p.x, p.y);
    drawPoint('red', p_on_lense.x, p_on_lense.y);
    drawPoint('red', p_projected);
    drawPoint('red', focal_point);
    drawPoint('black', lens_center);
}

function moveTo(vec) {
    ctx.moveTo(vec.x, vec.y);
}

function lineTo(vec) {
    ctx.lineTo(vec.x, vec.y);
}

function fill_frustum(f, color) {
    ctx.beginPath();
    moveTo(f.left.start);
    lineTo(f.left.end);
    lineTo(f.right.end);
    lineTo(f.right.start);
    lineTo(f.left.start);
    ctx.fillStyle = color;
    ctx.fill();
}

draw();