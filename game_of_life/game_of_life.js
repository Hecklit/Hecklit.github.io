const can = document.getElementById('can');
const ctx = can.getContext('2d');
const width = can.width = window.innerWidth * 0.9;
const height = can.height = window.innerHeight * 0.9;
let canRect = can.getBoundingClientRect();
let mouseDown = false;
const figure_keys = Object.keys(figures);
let figure_index = 0;
let paused = true;
let alive_cells = {};

window.onresize = (e) => {
    canRect = can.getBoundingClientRect();
};

can.onmouseup = (e) => {
    const cur_x = e.clientX - canRect.left;
    const cur_y = e.clientY - canRect.top;
    const cur_cell_x = Math.floor(cur_x / cell_size);
    const cur_cell_y = Math.floor(cur_y / cell_size);
    if (selectionBox.inside(cur_x, cur_y)) {
        // console.log('inside')
    } else {
        add_figure(figures[figure_keys[figure_index]], cur_cell_x, cur_cell_y);
    }
}

can.onmousedown = (e) => {
}

can.onmousemove = (e) => {
}

window.onkeydown = (e) => {
    // Leertaste
    console.log(e.keyCode)
    if (e.keyCode === 65) {
        if(figure_index < 1) {
            figure_index = figure_keys.length-1
        }else{
            figure_index--;
        }
        console.log(figure_index)
    }
    if (e.keyCode === 68) {
        figure_index = Math.abs((figure_index + 1) % figure_keys.length);
    }
    if (e.keyCode === 32) {
        paused = !paused;
    }
    if (e.keyCode === 87) {
        update();
    }
}

function clear() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
}

function drawGrid() {
    ctx.fillStyle = '#fff';
    // console.log('drawGrid', Object.keys(alive_cells).length)
    for (const k in alive_cells) {
        if (alive_cells.hasOwnProperty(k)) {
            const coord = k.split(',');
            ctx.fillRect(coord[0] * cell_size, coord[1] * cell_size, cell_size, cell_size)
        }
    }
        // const col = (y + x ) * 360 / numX;
    // const light = 40;
    // const sat = 10;
    // ctx.fillStyle = `hsl(${col}, ${sat}%, ${light}%)`;
}

const row = 250;
const col = row*2;
let cell_size = 4;
let selectionBox;

function init() {
    // init gui
    selectionBox = new box2d(col * cell_size, 0, width, height);
    var reader = new FileReader();
    loop();
}

function update() {
    const neighbours_of_living = {};
    const newLiving = {};
    for (const k in alive_cells) {
        if (alive_cells.hasOwnProperty(k)) {
            const cell = alive_cells[k];
            const coords = k.split(',');
            const neighKeys = create_neighbours_keys(coords[0], coords[1]);
            for (let i = 0; i < neighKeys.length; i++) {
                const key = neighKeys[i];
                if(neighbours_of_living.hasOwnProperty(key)) {
                    neighbours_of_living[key]++;
                }else{
                    neighbours_of_living[key] = 1;
                }
            }
            // console.log('numNeigh', numNeigh)
        }
    }
    console.log(neighbours_of_living)
    for (const key in neighbours_of_living) {
        if (neighbours_of_living.hasOwnProperty(key)) {
            const numNeigh = neighbours_of_living[key];
            if(numNeigh == 2 || numNeigh == 3)
                newLiving[key] = true;
            // else
            //     console.log(k)
        }
    }
    alive_cells = newLiving;
}

function calc_alive_neighbours(x, y) {
    let alive = 0;
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx == 0 && dy == 0)
                continue;
            if (isAlive(+x + dx, +y + dy))
                alive++;
        }
    }
    return alive
}

function create_neighbours_keys(x, y) {
    let neigh = [];
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx == 0 && dy == 0)
                continue;
            neigh.push([+x + dx, +y + dy].join())
        }
    }
    return neigh;
}

function isAlive(x, y) {
    // console.log('isAlive', x, y)
    if (!alive_cells.hasOwnProperty([x, y].join()))
        return false;
    return true;
}

function set(x, y, val) {
    if (x < 0 || x >= col || y < 0 || y >= row)
        return false;
    const key = [x, y].join();
    if(val) {
        // console.log('cell set', key)
        alive_cells[key] = true;
    }else{
       // if(alive_cells.hasOwnProperty(key))
            delete alive_cells[key];
    }
}

function safe_get(x, y, collection) {
    if (x < 0 || x >= collection.length || y < 0 || y >= collection[0].length)
        return false;
    return collection[x][y];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function add_figure(figure, x_offset, y_offset) {
    for (let x = 0; x < figure.length; x++) {
        for (let y = 0; y < figure[0].length; y++) {
            set(x + x_offset, y + y_offset, figure[x][y]);
        }
    }
}

function draw_figure_icon(figure, size, x_offset, y_offset) {
    let icon_cell_size = 8 // Math.floor(size / figure.length + 2);
    for (let x = -1; x < figure.length + 1; x++) {
        for (let y = -1; y < figure[0].length + 1; y++) {
            if (safe_get(x, y, figure)) {
                ctx.fillStyle = '#fff';
            } else {
                ctx.fillStyle = '#000';
            }
            ctx.fillRect(x_offset + (x + 1) * icon_cell_size, y_offset + (y + 1) * icon_cell_size, icon_cell_size, icon_cell_size);
        }
    }
}

async function loop() {
    // update
    if (!paused)
        update();
    // draw
    clear();
    drawGrid();
    // draw ui
    ctx.fillStyle = '#fff';
    ctx.fillText(figure_keys[figure_index], 20, 20);
    if(paused)
        ctx.fillText('PAUSED', 20, 40);
    // selectionBox.fill(ctx, '#A00000');
    // draw_figure_icon(figures[figure_keys[figure_index]], 40, selectionBox.start.x + 40, 40);
    // await sleep(100);
    window.requestAnimationFrame(loop);
}

init();