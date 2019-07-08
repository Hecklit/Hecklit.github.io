// contains standalone functions


// Random functions
function rand_element(arr) {
    return arr[rand_ind(arr)]
}

function rand_ind(arr) {
    return Math.floor(arr.length*Math.random())
}

function random(min, max=null) {
    if(max === null) {
        max = min;
        min = 0;
    }
    return min + Math.random()*(max-min);
}

function random_around(mean, range) {
    return mean + Math.random()*range*2 - range;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice(p) {
    var i, sum=0, r=Math.random();
    for (let i = 0; i < p.length; i++) {
        sum += p[i];
        if (r <= sum) return i;
    }
}

// Collider functions
function inside_rect(pos, sx, sy, w, h) {
    let ex = sx + w;
    let ey = sy + h;
    let x = pos.x;
    let y = pos.y;
    return x > sx && x < ex && y > sy && y < ey;
}

function circle_circle_collide(c1, c2) {
    const distance = c1.pos.sub(c2.pos).length();
    return distance <= (c1.r + c2.r);
}

function circle_circles_collide(c1, arr){
    let collisions = [];
    for (let a = 0; a < arr.length; a++) {
        const other = arr[a];
        if (circle_circle_collide(c1, other)) {
            collisions.push(other);
        }
    }
    return collisions;
}

function is_colliding(f, obstacles) {
    let is_col = false;
    let cols = circle_circles_collide(f, obstacles);
    is_col = cols.length > 0;
    return is_col; 
}

// utils/ convinence
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const print = console.log

// Math functions
function sum(arr) {
    return arr.reduce((total, cur) => total + cur, 0.0)
}


function softmax(arr) {
    const total = arr.reduce((total, cur) => total + Math.exp(cur), 0.0)
    return arr.map(x => Math.exp(x)/total)
}

function matmul(M, v) {
    // M is a 2d list
    // v is a 1d list
    return M.map((w) => {
        return w.reduce((acc, cur, i) => acc + cur * v[i], 0)
    })
}

function argMax(array) {
    return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}

function turn_vec(deg) {
    const angleInRad = (deg*2*Math.PI)/360;
    return new v2(Math.cos(angleInRad), Math.sin(angleInRad));
}

// graphics

function fill_rect(ctx, lefttop, w, h, color){
    let x = lefttop.x;
    let y = lefttop.y;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}


function drawPoint (ctx, vec, pointSize, color='#000') {
    ctx.fillStyle = color;
    ctx.fillRect(vec.x-pointSize/2, vec.y-pointSize/2, pointSize, pointSize);
}

function drawCircle(ctx, vec, r, fill=false, color='gray') {
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.arc(vec.x, vec.y, r, 0, 2*Math.PI);
    ctx.stroke();
    if(fill) {
        ctx.fillStyle = color;
        ctx.fill();
    }
}

const clear = (ctx) => {
    ctx.fillStyle = "#4a4f5c";
    ctx.fillRect(0,0, width, height);
}