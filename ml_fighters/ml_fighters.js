const can = document.getElementById('can');
const ctx = can.getContext('2d');
const width = can.width = window.innerWidth * 0.9;
const height = can.height = window.innerHeight *0.9;
const center = new v2(width/2, height/2);
const pointSize = 4;
let zoom = 1.0;
let dead_players = [];
const startTime = new Date();
let best_score = 0;
let best_genes = null;

function draw() {
    clear();
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        drawCircle(obstacle.pos, obstacle.r, true);
    }
    for (let i = 0; i < food.length; i++) {
        const f = food[i];
        drawCircle(f.pos, f.r, true, 'green');
    }
    for (let i = 0; i < bases.length; i++) {
        const b = bases[i];
        drawCircle(b.pos, b.r, true, 'brown');
    }
    for (let i = 0; i < fighters.length; i++) {
        const fighter = fighters[i];
        drawCircle(fighter.pos, fighter.r, true, `rgb(${fighter.color[0]},${fighter.color[1]},${fighter.color[2]})`);
        drawPoint(fighter.pos.add(fighter.dir.scale(fighter.r)));

        // draw sensors
        for (let j = 0; j < fighter.sensors.length; j++) {
            const sensor = fighter.sensors[j];
            let color = 'red';
            if(sensor.state !== 0) {
                color = 'cyan';
            }
            if(sensor.state === 2) {
                color = 'yellow';
            }
            drawPoint(sensor.pos, color);
        }

        // draw healthbar
        fill_rect(fighter.pos.add(new v2(-1.5 * fighter.r, fighter.r*-2)), fighter.r*3, fighter.r/2, 'red');
        fill_rect(fighter.pos.add(new v2(-1.5 * fighter.r, fighter.r*-2)), fighter.r*3 * fighter.health/max_health, fighter.r/2, '#00FF00');
    }
    for (let i = 0; i < bullets.length; i++) {
        const bullet = bullets[i];
        if(!bullet.alive) {
            continue;
        }
        drawCircle(bullet.pos, bullet.r, true, 'white');
        // drawPoint(bullet.pos.add(bullet.dir.scale(bullet.r)));
    }

    // UI
    ctx.fillStyle = 'white';
    ctx.font="16px Georgia";
    ctx.fillText(`Best Score: ${best_score}`, 400, 30);

    let offset = 0;
    for (let i = 0; i < Math.min(dead_players.length, 5); i++) {
        const pl = dead_players[i];
        ctx.fillStyle = `rgb(${pl.pl.color[0]},${pl.pl.color[1]},${pl.pl.color[2]})`;
        ctx.fillText(`${pl.ts} : ${pl.pl.score} # ${pl.pl.name}`, 30, 30 + offset++ * 30);
    }
}

function argMax(array) {
    return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}

function update() {
    // remove dead bullets
    deads = fighters.filter(x => !x.alive);
    bullets = bullets.filter(x => x.alive);
    fighters = fighters.filter(x => x.alive);
    for (let i = 0; i < deads.length; i++) {
        const d = deads[i];
        if(d.score > best_score){
            best_score = d.score;
            best_genes = d.w;
        }
        dead_players.push({'pl': d, 'ts': new Date() - startTime});
    }
    dead_players.sort((x, y) => x.pl.score - y.pl.score).reverse()
    dead_players = dead_players.slice(0, 100);
    spawn_players(deads.length)

    for (let i = 0; i < fighters.length; i++) {
        const f = fighters[i];
        // update sensors
        for (let j = 0; j < f.sensors.length; j++) {
            const sensor = f.sensors[j];
            if(is_colliding(sensor) || !inside_rect(sensor.pos, 10, 10, width-10, height-10)) {
                sensor.state = 1;
            }else if(circle_circles_collide(sensor, fighters).length > 0){
                sensor.state = 2;
            }else{
                sensor.state = 0;
            }
        }

        let decision = 0;
        if(Math.random() < 0.001) {
            decision = Math.floor((Math.random()*5))
        }else{
            // decide what todo
            // inputs: health, sensor_values, angle, pos
            // decisions: fire turn_l, turn_r, walk, wait
            const sens_vals = f.sensors.map(x => x.state);
            const decisions = [
                f.health/max_health *f.w[0][0] + sens_vals[0] *f.w[0][1] + sens_vals[1] *f.w[0][2] + sens_vals[2] *f.w[0][3] + sens_vals[3] *f.w[0][4] + sens_vals[4] *f.w[0][5] + f.angle/360.0 *f.w[0][6] + f.pos.y/height *f.w[0][7] + f.pos.x/width *f.w[0][8],
                f.health/max_health *f.w[1][0] + sens_vals[0] *f.w[1][1] + sens_vals[1] *f.w[1][2] + sens_vals[2] *f.w[1][3] + sens_vals[3] *f.w[1][4] + sens_vals[4] *f.w[1][5] + f.angle/360.0 *f.w[1][6] + f.pos.y/height *f.w[1][7] + f.pos.x/width *f.w[1][8],
                f.health/max_health *f.w[2][0] + sens_vals[0] *f.w[2][1] + sens_vals[1] *f.w[2][2] + sens_vals[2] *f.w[2][3] + sens_vals[3] *f.w[2][4] + sens_vals[4] *f.w[2][5] + f.angle/360.0 *f.w[2][6] + f.pos.y/height *f.w[2][7] + f.pos.x/width *f.w[2][8],
                f.health/max_health *f.w[3][0] + sens_vals[0] *f.w[3][1] + sens_vals[1] *f.w[3][2] + sens_vals[2] *f.w[3][3] + sens_vals[3] *f.w[3][4] + sens_vals[4] *f.w[3][5] + f.angle/360.0 *f.w[3][6] + f.pos.y/height *f.w[3][7] + f.pos.x/width *f.w[3][8],
                // f.health/max_health *f.w[4][0] + sens_vals[0] *f.w[4][1] + sens_vals[1] *f.w[4][2] + sens_vals[2] *f.w[4][3] + sens_vals[3] *f.w[4][4] + sens_vals[4] *f.w[4][5] + f.angle *f.w[4][6],
            ];
            let activation = decisions.map(x => Math.max(x, 0));
            decision = argMax(activation);
            if(f.last_decision !== decision) {
                f.score += 1;
            }
            if(f.last_decision === 1 && decision === 3 || f.last_decision === 2 && decision === 3) {
                f.score += 20;
            }
            if(f.last_decision === 3 && decision === 1 || f.last_decision === 3 && decision === 2) {
                f.score += 20;
            }
            f.last_decision = decision;
        }
        switch(decision) {
            case 0: //shoot
            shoot(f);
            break;
            case 1: //turn l
            f.turn(-10);
            break;
            case 2: //turn r
            f.turn(10);
            break;
            case 3: //walk
            move_fighter(f);
            break;
            case 4: //wait
            break;
        }
        f.deal_dmg(1);
        if(f.last_position === f.pos) {
            f.deal_dmg(5);
            f.score -= 10;
        }
        f.last_position = f.pos;
    }
    for (let i = 0; i < bullets.length; i++) {
        const bullet = bullets[i];
        move_bullet(bullet);
    }
}

function fill_rect(lefttop, w, h, color){
    let x = lefttop.x;
    let y = lefttop.y;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function inside_rect(pos, sx, sy, w, h) {
    let ex = sx + w;
    let ey = sy + h;
    let x = pos.x;
    let y = pos.y;
    return x > sx && x < ex && y > sy && y < ey;
}

function drawPoint (vec, color='#000') {
    ctx.fillStyle = color;
    ctx.fillRect(vec.x-pointSize/2, vec.y-pointSize/2, pointSize, pointSize);
}

function drawCircle(vec, r, fill=false, color='gray') {
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.arc(vec.x, vec.y, r, 0, 2*Math.PI);
    ctx.stroke();
    if(fill) {
        ctx.fillStyle = color;
        ctx.fill();
    }
}

const clear = () => {
    ctx.fillStyle = "#4a4f5c";
    ctx.fillRect(0,0, width, height);
}

function random(min, max=null) {
    if(max === null) {
        max = min;
        min = 0;
    }
    return min + Math.random()*(max-min);
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

function random_around(mean, range) {
    return mean + Math.random()*range*2 - range;
}

function is_colliding(f) {
    let is_col = false;
    let cols = circle_circles_collide(f, obstacles);
    is_col = cols.length > 0;
    return is_col; 
}

function move_fighter(f) {
    let old_pos = f.pos;
    let new_pos = f.pos.add(f.dir.scale(4.0));
    f.pos = new_pos;
    if(is_colliding(f) || !inside_rect(f.pos, 10, 10, width-10, height-10)) {
        f.pos = old_pos;
        f.score -= 2;
        // f.turn(5);
    }else{
        f.health = Math.min(f.health+1, max_health);
        f.score += 5;
    }
    f.set_sensor_pos();
    if(circle_circles_collide(f, food).length > 0){
        if(!f.carries_food){
            f.health = max_health;
            f.carries_food = true;
            f.score += 100;
        }
    }
    if(circle_circles_collide(f, bases).length > 0){
        if(f.carries_food){
            f.health = max_health;
            f.carries_food = false;
            f.score += 3000;
        }
    }
}

function shoot(f) {
    if(f.cd > 0) {
        f.cd--;
        return;
    }
    f.cd = 10;
    const bullet = new Bullet(f.pos.add(f.dir.scale(3)), f.dir, 10, 2, f);
    bullets.push(bullet);
}

function move_bullet(b) {
    if(!b.alive) {
        return;
    }
    b.pos = b.pos.add(b.dir.scale(b.vel));
    if(is_colliding(b) || !inside_rect(b.pos, 10, 10, width-10, height-10)) {
        b.alive = false;
        return;
    }
    cols = circle_circles_collide(b, fighters);
    for (let c = 0; c < cols.length; c++) {
        const collision = cols[c];
        b.alive = false;
        b.pl.score += 8;
        b.pl.health = Math.min(b.pl.health+10, max_health);
        collision.deal_dmg(10);
        collision.score -= 20;
    }
}

const obstacles = [];
let fighters = [];
let bullets = [];
let food = [];
let bases = [];

function create_map(num_obstacles, num_bases, num_food) {
    let placed_obstacles = 0;
    let iterations = 0;
    while(placed_obstacles != num_obstacles && iterations < 1000) {
        iterations += 1;
        let posib_x = random_around(width/2, width*.5)
        let posib_y = random_around(height/2, height*.5)
        let posib_r = random(10, 50);
        let new_obst = new Obstacle(new v2(posib_x, posib_y), posib_r);
        let colls = circle_circles_collide(new_obst, obstacles);
        if(colls.length > 0){
            continue;
        }
        obstacles.push(new_obst);
        placed_obstacles += 1;
    }
    iterations = 0;
    while(food.length != num_food && iterations < 1000) {
        iterations += 1;
        let posib_x = random_around(width/2, width*.5)
        let posib_y = random_around(height/2, height*.5)
        let posib_r = random(10, 50);
        let new_obst = new Food(new v2(posib_x, posib_y), posib_r);
        let colls = circle_circles_collide(new_obst, obstacles);
        if(colls.length > 0){
            continue;
        }
        colls = circle_circles_collide(new_obst, food);
        if(colls.length > 0){
            continue;
        }
        food.push(new_obst);
    }
    iterations = 0;
    while(bases.length != num_bases && iterations < 1000) {
        iterations += 1;
        let posib_x = random_around(width/2, width*.5)
        let posib_y = random_around(height/2, height*.5)
        let posib_r = random(10, 50);
        let new_obst = new Base(new v2(posib_x, posib_y), posib_r);
        let colls = circle_circles_collide(new_obst, obstacles);
        if(colls.length > 0){
            continue;
        }
        colls = circle_circles_collide(new_obst, bases);
        if(colls.length > 0){
            continue;
        }
        bases.push(new_obst);
    }
}

function rand_ind(arr) {
    return Math.floor(arr.length*Math.random())
}

function spawn_players(num) {
    let placed_fighters = 0;
    let iterations = 0;
    while(placed_fighters != num && iterations < 1000) {
        iterations += 1;
        let posib_x = random_around(width/2, width*.4)
        let posib_y = random_around(height/2, height*.4)
        let posib_r = 5;
        let new_fighter = new Fighter(new v2(posib_x, posib_y), Math.floor(360*Math.random()), posib_r);
        let colls = circle_circles_collide(new_fighter, obstacles);
        if(colls.length > 0){
            continue;
        }
        if(best_genes !== null) {
            if(Math.random() > 0.2){
                const sum = dead_players.reduce((acc, cur) => acc+cur.pl.score, 0);
                for (let u = 0; u < dead_players.length; u++) {
                    const du = dead_players[u];
                    if(Math.random() <= du.pl.score/sum) {
                        new_fighter.w = du.pl.w;
                        new_fighter.color = du.pl.color;
                        break;
                    }
                    let ind = rand_ind(dead_players)
                    let other = dead_players[ind];
                    if(Math.random() <= du.pl.score/sum) {
                        let ind2 = rand_ind(new_fighter.w);
                        new_fighter.w[ind2] = other.pl.w[ind2];
                        new_fighter.color = du.pl.color;
                        break;
                    }
                }
            }else{
                new_fighter.w = best_genes;
                let ind = rand_ind(new_fighter.w)
                let ind2 = rand_ind(new_fighter.w[ind])
                new_fighter.w[ind][ind2] = Math.random(); 
            }
        }
        fighters.push(new_fighter);
        placed_fighters += 1;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }  

async function loop() {
    update();
    draw();
    await sleep(17);
    loop()
}

create_map(15, 6, 2);
spawn_players(200);
loop();
