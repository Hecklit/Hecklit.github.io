const can = document.getElementById('can');
const can_tree = document.getElementById('can_tree');
const ctx = can.getContext('2d');
const ctx_tree = can_tree.getContext('2d');
const width = can.width = can_tree.width = window.innerWidth * 0.45;
const height = can.height = can_tree.height = window.innerHeight * 0.9;
let canRect = can_tree.getBoundingClientRect();
let canRect_points = can.getBoundingClientRect();
const center = new v2(canRect.width / 2, canRect.height / 2);
let mouseDown = false;
let seed = new Date().getMilliseconds()/100;
const psize = 8;
const n = 40;
let points = [];
let X = [];
let Y = [];
let tree;
let query_result = [];
let query_result_points = [];
let new_point_mode = false;

const searchRange = {
    x1: 0,
    x2: width,
    y1: 0,
    y2: height / 2
};

function reset() {
    X = [];
    Y = [];
    tree = null;
    query_result = [];
    query_result_points = [];
}

function init() {
    // Creation with random Seed
    for (let i = 0; i < n; i++) {
        points.push(new v2(
            Math.floor(width * 0.05 + randomInt(width * 0.9)),
            Math.floor(height * 0.05 + randomInt(height * 0.9))
        ))
    }
    start();
}

function start() {
    // Sorting
    X = points.concat().sort((a, b) => {
        return a.x - b.x;
    });
    Y = points.concat().sort((a, b) => {
        return a.y - b.y;
    });
    tree = new Node();
    ConstructBalanced2DTree(0, points.length - 1, tree, true, X, Y);
    draw();
    displayTree(tree)
}
init();

window.onresize = (e) => {
    canRect = can_tree.getBoundingClientRect();
    canRect_points = can_tree.getBoundingClientRect();
};

can.onmouseup = () => {
    mouseDown = false;
}

can.onmousedown = (e) => {
    if(new_point_mode) {
        points.push(new v2(e.pageX - can.offsetLeft, e.pageY - can.offsetTop));
        reset();
        start();
    }else{
        mouseDown = true;
        searchRange.x1 = e.pageX - can.offsetLeft;
        searchRange.y1 = e.pageY - can.offsetTop;
    }
}

can.onmousemove = (e) => {
    if (mouseDown) {
        searchRange.x2 = e.pageX - can.offsetLeft;
        searchRange.y2 = e.pageY - can.offsetTop;

        sr = searchRange;
        draw();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(sr.x1, sr.y1, sr.x2 - sr.x1, sr.y2 - sr.y1);
        query_result = rangeSearch(tree, 'vertical', {
            x1: Math.min(sr.x1, sr.x2),
            x2: Math.max(sr.x1, sr.x2),
            y1: Math.min(sr.y1, sr.y2),
            y2: Math.max(sr.y1, sr.y2)
        });
        query_result_points = query_result.map(x => x.value);

        displayTree(tree);
    }
}

const h1 = document.getElementById('title');
window.onkeydown = (e) => {
    // Leertaste
    if (e.keyCode === 32) {
        new_point_mode = !new_point_mode;
        if(new_point_mode) {
            h1.innerHTML = 'KD-Tree (Point Mode)';
        }else{
            h1.innerHTML = 'KD-Tree (Selection Mode)';
        }
    }
}

function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}
function randomInt(scalar) {
    return Math.floor(random() * scalar);
}

function clear(canvas_ctx, color = '#fff') {
    canvas_ctx.fillStyle = color;
    canvas_ctx.fillRect(0, 0, width, height);
}

function draw() {
    clear(ctx, '#2f2f2f');
    ctx.fillStyle = "#000";
    for (i in points) {
        const point = points[i];
        if (query_result_points.includes(point)) {
            ctx.fillStyle = color_from_pos(point.x, point.y, width, height, 90);
        } else {
            ctx.fillStyle = color_from_pos(point.x, point.y, width, height);
        }
        ctx.fillRect(point.x - psize / 2, point.y - psize / 2, psize, psize);
        ctx.textAlign = "end";
        ctx.fillText(point + '', point.x - 4, point.y);
    }
    draw_partitioning(tree, false);
}

function draw_partitioning(node, horizontal, left = false, parent = null, grandgrandpa = null) {
    if (node === null || node.value === null) {
        return;
    }
    let point = node.value;
    if (query_result_points.includes(point)) {
        ctx.strokeStyle = color_from_pos(point.x, point.y, width, height, 90);
    } else {
        ctx.strokeStyle = color_from_pos(point.x, point.y, width, height);
    }
    if (parent !== null) {
        const {grandpa: b_gp, dir } = node.find_bounding_grandpa();
        if (b_gp !== null) {
            if (horizontal) {
                draw_line(node.value.x, parent.value.y, node.value.x, b_gp.value.y, ctx);
            } else {
                draw_line(b_gp.value.x, node.value.y, parent.value.x, node.value.y, ctx);
            }
            let point = node.value;
            const psize = 4;
            ctx.fillRect(point.x - psize / 2, point.y - psize / 2, psize, psize);
        } else {
            // no bounding grandparent
            if (horizontal) {
                if (left) {
                    draw_line(node.value.x, 0, node.value.x, parent.value.y, ctx);
                } else {
                    draw_line(node.value.x, parent.value.y, node.value.x, height, ctx);
                }
            } else {
                if (left) {
                    draw_line(0, node.value.y, parent.value.x, node.value.y, ctx);
                } else {
                    draw_line(parent.value.x, node.value.y, width, node.value.y, ctx);
                }
            }
        }
    } else {
        // no bounding parent and grandparent
        if (horizontal) {
            draw_line(node.value.x, 0, node.value.x, height, ctx);
        } else {
            draw_line(0, node.value.y, width, node.value.y, ctx);
        }
    }
    let gp = (node.parent) ? node.parent.parent : null;
    draw_partitioning(node.left, !horizontal, true, node, gp);
    draw_partitioning(node.right, !horizontal, false, node, gp);
}

function displayTree(root) {
    clear(ctx_tree, '#2f2f2f');
    const node_positions = {};
    const la = root.as_layer_array();
    let max_node_width = 0;
    const max_node_height = la.length;
    for (let i = 0; i < la.length; i++) {
        const layer = la[i];
        if (layer.length > max_node_width) {
            max_node_width = layer.length;
        }
    }
    const node_width = width * 0.7 / max_node_width;
    const node_height = (height * 0.9 / max_node_height) / 2;
    for (let i = 0; i < la.length; i++) {
        const layer = la[i];
        draw_layer(i, node_width, node_height, layer, node_positions);
    }

    // draw connections
    draw_connections(root, node_positions);
}

function draw_connections(root, node_pos) {
    if (root.value === null) {
        return;
    }
    const start_pos = node_pos[root.value + ''];
    if (root.left.value !== null) {
        const end_pos = node_pos[root.left.value + ''];
        draw_line(start_pos.x, start_pos.y, end_pos.x, end_pos.y, ctx_tree);
        draw_connections(root.left, node_pos)
    }
    if (root.right.value !== null) {
        const end_pos = node_pos[root.right.value + ''];
        draw_line(start_pos.x, start_pos.y, end_pos.x, end_pos.y, ctx_tree);
        draw_connections(root.right, node_pos)
    }
}

function draw_line(x1, y1, x2, y2, can_cont) {
    // can_cont.strokeStyle = '#000';
    can_cont.lineWidth = 2;
    can_cont.beginPath();
    can_cont.moveTo(x1, y1);
    can_cont.lineTo(x2, y2);
    can_cont.stroke();
}

function draw_layer(level, nw, nh, nodes, node_pos) {
    const y_coord = level * nh * 2 + 100;
    offset = (nodes.length % 2 == 0) ? 0 : nw / 2
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const x_coord =
            center.x - (nodes.length * nw * 1.25) / 2 + nw * i * 1.25 + offset;
        draw_node(x_coord, y_coord, nw, nh, node, node_pos);
    }
}

function draw_node(x, y, w, h, node, node_pos) {
    node_pos[node.value + ''] = { x: x, y: y };

    if (query_result.includes(node)) {
        ctx_tree.fillStyle = color_from_pos(node.value.x, node.value.y, width, height, 90);
    } else {
        ctx_tree.fillStyle = color_from_pos(node.value.x, node.value.y, width, height);
    }
    ctx_tree.fillRect(x - w / 2, y - h / 2, w, h);
    ctx_tree.fillStyle = '#000';
    ctx_tree.textAlign = "center";
    ctx_tree.fillText(node.value + '', x, y);
    if (query_result.includes(node)) {
        ctx_tree.strokeStyle = '#202020';
        ctx_tree.lineWidth = 2;
        ctx_tree.strokeRect(x - w / 2, y - h / 2, w, h);
    }
}

function color_from_pos(x, y, maxX, maxY, sat_offset = 0) {
    const col = Math.floor(((x*2) / maxX) * 45) + 120;
    const light = 40; // Math.floor((y / maxY) * 30) + 50;
    const sat = 10 + sat_offset;
    return `hsl(${col}, ${sat}%, ${light}%)`;
}
