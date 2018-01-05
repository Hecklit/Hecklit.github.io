const can = document.getElementById('can');
const ctx = can.getContext('2d');
const width = can.width = window.innerWidth * 0.9;
const height = can.height = window.innerHeight * 0.9;
let canRect = can.getBoundingClientRect();
let mouseDown = false;
const figure_keys = Object.keys(figures);
let figure_index = 0;
let paused = false;

window.onresize = (e) => {
    canRect = can.getBoundingClientRect();
};

can.onmousedown = (e) => {
    const cur_x = e.clientX - canRect.left;
    const cur_y = e.clientY - canRect.top;
    const cur_cell_x = Math.floor(cur_x / cell_size);
    const cur_cell_y = Math.floor(cur_y / cell_size);
    if (selectionBox.inside(cur_x, cur_y)) {
        console.log('inside')
    } else {
        add_figure(figures[figure_keys[figure_index]], cur_cell_x, cur_cell_y);
    }
}

can.onmouseup = (e) => {
}

can.onmousemove = (e) => {
    // const cur_x = Math.floor((e.clientX - canRect.left)/cell_size);
    // const cur_y = Math.floor((e.clientY - canRect.top)/cell_size);
    // if (mouseDown) {
    // }
    // console.log(selectionBox.inside(cur_x, cur_y))
}

window.onkeydown = (e) => {
    // Leertaste
    // console.log(e.keyCode)
    if (e.keyCode === 65) {
        if(figure_index < 1) {
            figure_index = figure_keys.length-1
        }else{
            figure_index--;
        }
        // console.log(figure_index)
    }
    if (e.keyCode === 68) {
        figure_index = Math.abs((figure_index + 1) % figure_keys.length);
    }
    if (e.keyCode === 32) {
        paused = !paused;
    }
}

function randomInt(scalar) {
    return Math.floor(Math.random() * scalar);
}

function clear() {
    ctx.fillStyle = "#4a4f5c";
    ctx.fillRect(0, 0, width, height);
}

function drawGrid(data_grid) {
    const numX = data_grid.length;
    const numY = data_grid[0].length;

    for (let x = 0; x < numX; x++) {
        for (let y = 0; y < numY; y++) {
            // const col = (y + x ) * 360 / numX;
            // const light = 40;
            // const sat = 10;
            // ctx.fillStyle = `hsl(${col}, ${sat}%, ${light}%)`;
            ctx.fillStyle = (data_grid[x][y]) ? 'rgb(247, 230, 208)' : '#000';
            ctx.fillRect(x * cell_size, y * cell_size, cell_size, cell_size)
        }
    }
}

const row = 100;
const col = row*2;
let data_grid = [];
let cell_size = 0;
let selectionBox;

function init() {
    data_grid = []
    for (let i = 0; i < col; i++) {
        data_grid.push([]);
    }
    for (let x = 0; x < col; x++) {
        for (let y = 0; y < row; y++) {
            data_grid[x].push(false);
        }
    }
    cell_size = Math.min((width / col), (height / row));

    // init gui
    selectionBox = new box2d(col * cell_size, 0, width, height);
    var reader = new FileReader();

    reader.addEventListener("load", function () {
        var image = new Image();
        image.height = 100;
        image.title = file.name;
        image.src = this.result;
        preview.appendChild(image);
    }, false);

    loop();
}

function update() {
    var newArray = [];
    for (var i = 0; i < data_grid.length; i++)
        newArray[i] = data_grid[i].slice();

    for (let x = 0; x < col; x++) {
        for (let y = 0; y < row; y++) {
            const alive = calc_alive_neighbours(x, y);
            if (data_grid[x][y]) {
                // Any live cell with two or three live neighbours lives on to the next generation.
                // Any live cell with more than three live neighbours dies, as if by overpopulation.
                // Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
                if (alive > 3 || alive < 2)
                    newArray[x][y] = false;

            } else {
                // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
                if (alive === 3)
                    newArray[x][y] = true;
            }
        }
    }
    data_grid = newArray;
}

function calc_alive_neighbours(x, y) {
    let alive = 0;
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx == 0 && dy == 0)
                continue;
            if (isAlive(x + dx, y + dy))
                alive++;
        }
    }
    return alive
}

function isAlive(x, y) {
    if (x < 0){
        x += col;
    }
    if(x >= col){
        x -= col;
    }
    if(y < 0) {
        y += row;
    }
    if(y >= row) {
        y -= row;
    }
    return data_grid[x][y];
}

function set(x, y, val) {
    if (x < 0){
        x += col;
    }
    if(x >= col){
        x -= col;
    }
    if(y < 0) {
        y += row;
    }
    if(y >= row) {
        y -= row;
    }
    data_grid[x][y] = val;
    return true;
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
                ctx.fillStyle = 'rgb(247, 230, 208)';
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
    drawGrid(data_grid);
    // draw ui
    ctx.fillStyle = 'rgb(247, 230, 208)';
    ctx.font = "30px Arial";
    ctx.fillText('Click to spawn a '+figure_keys[figure_index], 10, 40);
    if(paused)
    ctx.fillText('Paused', 10, 80);
    // selectionBox.fill(ctx, '#A00000');
    // draw_figure_icon(figures[figure_keys[figure_index]], 40, selectionBox.start.x + 40, 40);
    await sleep(10);
    window.requestAnimationFrame(loop);
}

init();