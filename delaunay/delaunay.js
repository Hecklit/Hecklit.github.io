const can = document.getElementById('can');
const ctx = can.getContext('2d');
const width = can.width = window.innerWidth * 0.8;
const height = can.height = window.innerHeight * 0.9;
let canRect = can.getBoundingClientRect();
let mouseDown = false;

window.onresize = (e) => {
    canRect = can.getBoundingClientRect();
};

can.onmouseup = () => {
}

can.onmousedown = (e) => {
    const D = compute_delauny(points);
    if (D !== null) {
        draw(D, points);
    }
    points.push(new Point(e.pageX - can.offsetLeft, e.pageY - can.offsetTop));
    compute_and_draw();
}

can.onmousemove = (e) => {
}

window.onkeydown = (e) => {
    // Leertaste
    if (e.keyCode === 32) {
        for (let i = 0; i < 10; i++) {
            let p = new Point(Math.random() * width, Math.random() * height);
            points.push(p);
        }
        compute_and_draw();
    }
    if (e.keyCode === 37) {
        event_index = (event_index > 0) ? event_index - 1 : 0;
        compute_and_draw(false);
        display_events();
    }
    if (e.keyCode === 39) {
        event_index = (event_index >= gl_events.length - 1) ? gl_events.length - 1 : event_index + 1;
        compute_and_draw(false);
        display_events();
    }
}

function clear() {
    ctx.fillStyle = "#4a4f5c";
    ctx.fillRect(0, 0, width, height);
}

function draw(D, points) {
    clear();

    ctx.strokeStyle = 'black';
    ctx.beginPath();
    for (i = 0; i < D.length; i += 3) {

        let i0 = D[i];
        let i1 = D[i + 1];
        let i2 = D[i + 2];

        let p0 = points[i0];
        let p1 = points[i1];
        let p2 = points[i2];

        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p0.x, p0.y);

    }
    ctx.stroke();
    draw_points();
}

function draw_points() {
    ctx.fillStyle = '#009ddc';
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        ctx.fillRect(point.x - 2, point.y - 2, 4, 4);
    }
}

function compute_and_draw(compute = true) {
    let result = null;
    if (compute) {
        result = compute_delauny(points);
        if (result !== null) {
            const { indices, events } = result;
            gl_events = events;
            gl_indices = indices;
            draw(indices, points);
            display_events();
        } else {
            clear();
            draw_points();
        }
    } else {
        draw(gl_indices, points);
        display_events();
    }
}

function display_events() {
    if (gl_events.length < 1) return;

    if (event_index < 0) event_index = 0;
    if (event_index >= gl_events.length) event_index = gl_events.length - 1;

    const event = gl_events[event_index];
    if (event.type === 'tri') {
        let str = '';
        ctx.fillStyle = 'red';
        ctx.strokeStyle = 'red';

        const A = event.indices[0];
        const B = event.indices[1];
        const C = event.indices[2];
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.lineTo(C.x, C.y);
        ctx.lineTo(A.x, A.y);
        ctx.stroke();
        for (let i = 0; i < event.indices.length; i++) {
            const ind = event.indices[i];
            ctx.fillRect(ind.x - 2, ind.y - 2, 4, 4);
            str += ' (' + ind.x + '|' + ind.y + ')';
        }
        console.log('Event ' + event_index + ': ' + event.desc + ' ' + str);
    }else{
        console.log(`circle event: ${JSON.stringify(event)}`);
        ctx.strokeStyle = 'yellow';
        const c = event.circle;
        ctx.beginPath();
        ctx.arc(c.x, c.y, Math.sqrt(c.radius), 0, 2*Math.PI);
        ctx.stroke();
        ctx.strokeStyle = 'black';
    }
}

let event_index = 0;
let gl_events = [];
let gl_indices = [];
let points = [];
function main() {
    compute_and_draw();
}
main();