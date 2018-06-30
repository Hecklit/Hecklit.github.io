const can = document.getElementById('can');
const ctx = can.getContext('2d');
const width = can.width = window.innerWidth*.98;
const height = can.height = window.innerHeight*.9;
const center = new v2(width/2, height/2);
const pointSize = 4;

function draw_human(head_height, head_width, offset) {
    // draw markers
    let marker_pos = [];
    for (let a = -4; a < 5; a++) {
        marker_pos.push(new v2(center.x + offset, center.y + a * head_height - head_height/2));
    }
    
    // draw body
    draw_head(marker_pos[0].x, marker_pos[0].y + head_height/2, head_height/2, head_width/2);
    draw_upper_body(marker_pos[2].x, marker_pos[2].y, 3*head_width/2, 2*head_height/2)
    draw_lower_body(marker_pos[3].x, marker_pos[3].y + head_height/2,head_width,  head_height/2 )
    
    const upper_leg_start_right  = new v2(marker_pos[4].x + head_width/2, marker_pos[4].y);
    const upper_leg_end_right  = new v2(marker_pos[6].x + head_width, marker_pos[6].y);
    draw_leg(upper_leg_start_right, upper_leg_end_right, head_width, head_height);
    
    const lower_leg_start_right  = new v2(marker_pos[6].x + head_width, marker_pos[6].y);
    const lower_leg_end_right  = new v2(marker_pos[8].x + head_width, marker_pos[8].y);
    draw_leg(lower_leg_start_right, lower_leg_end_right, head_width*0.8, head_height);
    
    const upper_leg_start_left  = new v2(marker_pos[4].x - head_width/2, marker_pos[4].y);
    const upper_leg_end_left  = new v2(marker_pos[6].x - head_width, marker_pos[6].y);
    draw_leg(upper_leg_start_left, upper_leg_end_left, head_width, head_height);
    
    const lower_leg_start_left  = new v2(marker_pos[6].x - head_width, marker_pos[6].y);
    const lower_leg_end_left  = new v2(marker_pos[8].x - head_width, marker_pos[8].y);
    draw_leg(lower_leg_start_left, lower_leg_end_left, head_width*0.8, head_height);

    // marker_pos.forEach(x => drawPoint(x))
}

function drawPoint (vec) {
    ctx.fillStyle = "red";
    ctx.fillRect(vec.x-pointSize/2, vec.y-pointSize/2, pointSize, pointSize);
}

function drawCircle(vec, r) {
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.arc(vec.x, vec.y, r, 0, 2*Math.PI);
    ctx.stroke();
}

function drawVector(sp, angle, len) {
    const angleInRad = (angle*2*Math.PI)/360;
    // len *= Math.cos(angleInRad*200)+1;
    const end = (new v2(Math.cos(angleInRad), Math.sin(angleInRad))).scale(len).add(sp);
    ctx.beginPath();
    ctx.moveTo(sp.x, sp.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    return end.sub(sp);
}

const clear = () => {
    ctx.fillStyle = "#4a4f5c";
    ctx.fillRect(0,0, width, height);
}

function arctan(x) {
    const radians = Math.atan(x);
    return radians * 180 / Math.PI;
}

function fill(color='black') {
    ctx.fillStyle = color;
    ctx.fill();
}

function stroke(color='black') {
    ctx.strokeStyle = color;
    ctx.stroke();
}

function draw_head(x, y, head_height, head_width){
    ctx.beginPath();
    ctx.ellipse(x, y, head_width, head_height, 0, 0, 2*Math.PI);
    fill('gray');
    stroke('black');
}

function draw_upper_body(x, y, width, height) {
    ctx.beginPath();
    ctx.ellipse(x, y, width, height, 0, 0, 2*Math.PI);
    fill('gray');
    stroke('black');
}

function draw_lower_body(x, y, width, height) {
    ctx.beginPath();
    ctx.ellipse(x, y, width, height, 0, 0, 2*Math.PI);
    fill('gray');
    stroke('black');
}

function draw_leg(start, end, width, height) {
    const leg_vec = end.sub(start);
    const leg_center = start.add(leg_vec.scale(0.5));
    const rot = Math.asin(leg_vec.dot(new v2(-1, 0)));
    ctx.beginPath();
    ctx.ellipse(leg_center.x, leg_center.y, width/2, height, rot, 0, 2*Math.PI);
    fill('gray');
    stroke('black');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function update() {
    
    clear();
    for (let i = -4; i < 5; i++) {
        draw_human(40*Math.random(), 40*Math.random(), i * 3*41);
    }
    await sleep(90);
    requestAnimationFrame(update)
}

update()

// clear();
// draw_human(40, 40, 0);
