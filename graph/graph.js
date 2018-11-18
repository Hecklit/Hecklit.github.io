const can = document.getElementById('can');
const ctx = can.getContext('2d');
const width = can.width = window.innerWidth*0.95;
const height = can.height = window.innerHeight*0.95;
const center = new v2(width/2, height/2);
const pointSize = 4;
let moveX = 0.5;
const history = []

function draw(t, color, last=false) {

    draw_on_scale(height/6, t, color)
    
    xt = 5*Math.sin(t)
    yt = 5*Math.cos(Math.sqrt(t*t*t*t))
    
    draw_on_carthesian(center, 400, 400, new v2(xt, yt), color)
    
    res = xt + yt
    
    
    draw_on_scale(height - height/6,  res, color)
    
    if(last){
        // first
        draw_text_box(width/5, height/8, width, 30, (x, y) => {
        ctx.fillStyle = 'white'
            ctx.font = "20px Arial";
            ctx.fillText(`t = ${t.toFixed(2)}`,x, y)
        })

        // middle
        draw_text_box(width/5, height/4, width, 30, (x, y) => {
            ctx.fillStyle = 'white'
                ctx.font = "20px Arial";
                ctx.fillText(`xt = 5 * sin(t) = ${xt.toFixed(2)}`,x, y)
        })
        draw_text_box(width/5, height/4 + 30, width, 30, (x, y) => {
            ctx.fillStyle = 'white'
                ctx.font = "20px Arial";
                ctx.fillText(`yt = 5 * sin(sqrt(t^4)) = ${yt.toFixed(2)}`,x, y)
        })

        // end
        draw_text_box(width/5, height-height/10, width, 30, (x, y) => {
            ctx.fillStyle = 'white'
                ctx.font = "20px Arial";
                ctx.fillText(`xt * yt = ${res.toFixed(2)}`,x, y)
        })
    }
}

function draw_text_box(x, y, w, h, func) {
    // ctx.fillStyle = "#aaa";
    // ctx.fillRect(x,y, w, h);
    func(x, y)
}

function drawPoint (vec, color) {
    ctx.fillStyle = color;
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
    ctx.fillStyle = "#aaa";
    ctx.fillRect(0,0, width, height);
    draw_scale(height/6,)
    draw_carthesian(center, 400, 400)
    draw_scale(height - height/6)
}

function arctan(x) {
    const radians = Math.atan(x);
    return radians * 180 / Math.PI;
}

function draw_carthesian(o, w, h){
    hw = w/2
    hh = h/2
    draw_line(o.x - hw, o.y, o.x + hw, o.y)
    draw_line(o.x, o.y -hh, o.x , o.y + hh)
    ctx.fillStyle = 'black'
    startx = o.x - hw
    starty = o.y - hh
    scalex = w/20
    scaley = h/20
    for (let i = 1; i < 20; i++) {
        draw_line(startx + i * scalex,  o.y -4, startx + i * scalex,  o.y +4)
        ctx.font = "10px Arial";
        ctx.fillText("" + i - 20/2, i * scalex -4 + startx,  o.y +24); 
    }
    for (let i = 1; i < 20; i++) {
        draw_line(o.x -4, starty + i * scaley,  o.x +4, starty + i * scaley)
        ctx.font = "10px Arial";
        ctx.fillText("" + 20 - i - 20/2, o.x -24, i * scaley +4 + starty); 
    }
}

function draw_on_carthesian(o, w, h, point, color){
    scalex = w/20
    scaley = h/20

    point = point.scale(scalex, scaley)
    point.y = -point.y
    drawPoint(o.add(point), color)
}

function draw_scale(value){
    draw_h_line(value)
    ctx.fillStyle = 'black'
    scale = width/20
    for (let i = 1; i < 20; i++) {
        draw_line(i * scale, value -10, i * scale, value +10)
        ctx.font = "10px Arial";
        ctx.fillText("" + i - 20/2, i * scale -4, value +20); 
    }
}

function draw_on_scale(value, point, color){
    scale = width/20

    drawPoint(new v2(point * scale + 20/2 * scale, value), color)
}



function draw_h_line(value){
    draw_line(0, value, width, value)
}

function draw_v_line(value){
    draw_line(value, 0, value, height);
}

function draw_line(x1, y1, x2, y2) {
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

let mouseDown = false
can.onmouseup = () => {
    mouseDown = false;
}

can.onmousedown = (e) => {
    mouseDown = true;
}

can.onmousemove = (e) => {
    if (mouseDown) {
        let pos = new v2(e.pageX - can.offsetLeft, e.pageY - can.offsetTop)
        let difx = center.sub(pos).x
        history.push(-10* difx/(width/2))
        if(history.length > 5) {
            start_index = history.length - 5
        }else{
            start_index = 0
        }
        clear();
        for (let i =start_index; i < history.length; i++) {
            const element = history[i];
            index = (i-start_index)/(history.length-start_index)
            draw(element, `rgba(255, 255, 255, ${index})`, i===history.length-1)
        }
    }
}

clear();
draw(0, 'white', true)