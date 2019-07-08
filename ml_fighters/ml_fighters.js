const can = document.getElementById('can');
const ctx = can.getContext('2d');
const width = can.width = window.innerWidth * 0.9;
const height = can.height = window.innerHeight *0.9;
const center = new v2(width/2, height/2);
const MAX_COOLDOWN = 100;
const NUM_PLAYERS = 100;
const CROSSOVER_RATE = 0.5;
const CROSSOVER_SIZE = 20;
const MUTATION_RATE = 0.1; // per gen
const FOOD_SPAWN_CHANCE = 0.01
const NUM_BASES = 10
const OFFSPRING_RATE = 0.8

class MlFighters{
    constructor(){
        this.pointSize = 4;
        this.zoom = 1.0;
        this.dead_players = [];
        this.startTime = new Date();
        this.best_score = 0;
        this.best_genes = null;
        this.obstacles = [];
        this.fighters = [];
        this.bullets = [];
        this.food = [];
        this.bases = [];
    }

    draw() {
        clear(ctx);
        for (let i = 0; i < this.obstacles.length; i++) {
            const obstacle = this.obstacles[i];
            drawCircle(ctx, obstacle.pos, obstacle.r, true);
        }
        for (let i = 0; i < this.food.length; i++) {
            const f = this.food[i];
            drawCircle(ctx, f.pos, f.r, true, 'green');
        }
        for (let i = 0; i < this.bases.length; i++) {
            const b = this.bases[i];
            drawCircle(ctx, b.pos, b.r, true, 'brown');
        }
        for (let i = 0; i < this.fighters.length; i++) {
            const fighter = this.fighters[i];
            drawCircle(ctx, fighter.pos, fighter.r, true, `rgb(${fighter.color[0]},${fighter.color[1]},${fighter.color[2]})`);
            drawPoint(ctx, fighter.pos.add(fighter.dir.scale(fighter.r)), this.pointSize);
    
            // draw sensors
            const draw_sensors = false
            if(draw_sensors){
                for (let j = 0; j < fighter.sensors.length; j++) {
                    const sensor = fighter.sensors[j];
                    let color = 'red';
                    if(sensor.state !== 0) {
                        color = 'cyan';
                    }
                    if(sensor.state === 2) {
                        color = 'yellow';
                    }
                    drawPoint(ctx, sensor.pos, this.pointSize, color);
                }
            }
    
            // draw healthbar
            fill_rect(ctx, fighter.pos.add(new v2(-1.5 * fighter.r, fighter.r*-2)), fighter.r*3, fighter.r/2, 'red');
            fill_rect(ctx, fighter.pos.add(new v2(-1.5 * fighter.r, fighter.r*-2)), fighter.r*3 * fighter.health/max_health, fighter.r/2, '#00FF00');
        }
        for (let i = 0; i < this.bullets.length; i++) {
            const bullet = this.bullets[i];
            if(!bullet.alive) {
                continue;
            }
            drawCircle(ctx, bullet.pos, bullet.r, true, 'white');
            // drawPoint(ctx, bullet.pos.add(bullet.dir.scale(bullet.r)), this.pointSize);
        }
    
        // UI
        ctx.fillStyle = 'white';
        ctx.font="16px Georgia";
        ctx.fillText(`Best Score: ${this.best_score.toFixed(1)}`, 400, 30);
    
        let offset = 0;
        for (let i = 0; i < Math.min(this.dead_players.length, 5); i++) {
            const record = this.dead_players[i];
            ctx.fillStyle = `rgb(${record.pl.color[0]},${record.pl.color[1]},${record.pl.color[2]})`;
            ctx.fillText(`${record.pl.score.toFixed(1)} # ${record.pl.name}`, 30, 30 + offset++ * 30);
        }
    }

    update() {
        // remove dead bullets
        const deads = this.fighters.filter(x => !x.alive);
        this.bullets = this.bullets.filter(x => x.alive);
        this.fighters = this.fighters.filter(x => x.alive);
        for (let i = 0; i < deads.length; i++) {
            const d = deads[i];
            if(d.score > this.best_score){
                this.best_score = d.score;
                this.best_genes = d.w;
            }
            this.dead_players.push({'pl': d, 'ts': new Date() - this.startTime});
        }
        this.dead_players = this.dead_players.sort((x, y) => x.pl.score - y.pl.score)
        this.dead_players.reverse()
        this.dead_players = this.dead_players.slice(0, NUM_PLAYERS);
        this.spawn_players(deads.length)
        if(Math.random() < FOOD_SPAWN_CHANCE){
            this.spawn_food(getRandomInt(1, 5))
        }
    
        for (let i = 0; i < this.fighters.length; i++) {
            const f = this.fighters[i];
            if(f.alive){
                f.score += 0.001
            }

            // update sensors
            for (let j = 0; j < f.sensors.length; j++) {
                const sensor = f.sensors[j];
                if(is_colliding(sensor, this.obstacles) || !inside_rect(sensor.pos, 10, 10, width-10, height-10)) {
                    sensor.state = 1;
                }else if(circle_circles_collide(sensor, this.fighters).length > 0){
                    sensor.state = 2;
                }else{
                    sensor.state = 0;
                }
            }
    
            // decide what todo
            // inputs: health, sensor_values, angle, pos
            // decisions: fire turn_l, turn_r, walk, wait
            const sens_vals = f.sensors.map(x => x.state).concat([
                f.health/max_health,
                f.angle/360.0,
                f.pos.y/height,
                f.pos.x/width,
                f.cd/MAX_COOLDOWN,
            ])

            const logits = matmul(f.w, sens_vals)
            const probs = softmax(logits)

            if(probs[0] > 0.3){
                //shoot
                this.shoot(f);
            }
            if(probs[1] > 0.3){
                //turn l
                f.turn(-10);
            }
            if(probs[2] > 0.3){
                //turn r
                f.turn(10);
            }
            if(probs[3] > 0.3){
                //walk
                if(this.move_fighter(f, this.obstacles)){
                    f.deal_dmg(-6) // heal only if actually moved
                }
            }
            if(probs[4] > 0.3){
                //wait
            }
            
            f.deal_dmg(3);
        }
        for (let i = 0; i < this.bullets.length; i++) {
            const bullet = this.bullets[i];
            this.move_bullet(bullet);
        }
    }

    move_fighter(f) {
        let old_pos = f.pos;
        let new_pos = f.pos.add(f.dir.scale(4.0));
        f.pos = new_pos;
        if(is_colliding(f, this.obstacles) || !inside_rect(f.pos, 10, 10, width-10, height-10)) {
            f.pos = old_pos;
            return false
        }else{
            // f.health = Math.min(f.health+1, max_health);
        }
        f.set_sensor_pos();

        const collisions = circle_circles_collide(f, this.food)
        if(collisions.length > 0){
            if(!f.carries_food){
                f.health = max_health;
                f.score += 1;
                f.carries_food = true;
                // remove food gathered
                this.food = this.food.filter(function(item){
                    return collisions.indexOf(item) === -1;
                  });
            }
        }
        if(circle_circles_collide(f, this.bases).length > 0){
            if(f.carries_food){
                f.health = max_health;
                f.carries_food = false;
                f.score += 1;
            }
        }
        return true
    }

    shoot(f) {
        if(f.cd > 0) {
            f.cd--;
            return;
        }
        f.cd = MAX_COOLDOWN;
        const bullet = new Bullet(f.pos.add(f.dir.scale(3)), f.dir, 10, 2, f);
        this.bullets.push(bullet);
        f.deal_dmg(2)
    }

    move_bullet(b) {
        if(!b.alive) {
            return;
        }
        b.pos = b.pos.add(b.dir.scale(b.vel));
        if(is_colliding(b, this.obstacles) || !inside_rect(b.pos, 10, 10, width-10, height-10)) {
            b.alive = false;
            return;
        }
        let cols = circle_circles_collide(b, this.fighters);
        for (let c = 0; c < cols.length; c++) {
            const collision = cols[c];
            b.alive = false;
            // b.pl.health = Math.min(b.pl.health+10, max_health);
            b.pl.score += 0.1
            collision.deal_dmg(50);
        }
    }

    create_map(num_obstacles, num_bases, num_food) {
        let placed_obstacles = 0;
        let iterations = 0;
        while(placed_obstacles != num_obstacles && iterations < 1000) {
            iterations += 1;
            let posib_x = random_around(width/2, width*.5)
            let posib_y = random_around(height/2, height*.5)
            let posib_r = random(10, 50);
            let new_obst = new Obstacle(new v2(posib_x, posib_y), posib_r);
            let colls = circle_circles_collide(new_obst, this.obstacles);
            if(colls.length > 0){
                continue;
            }
            this.obstacles.push(new_obst);
            placed_obstacles += 1;
        }
        this.spawn_food(num_food)

        iterations = 0;
        while(this.bases.length != num_bases && iterations < 1000) {
            iterations += 1;
            let posib_x = random_around(width/2, width*.5)
            let posib_y = random_around(height/2, height*.5)
            let posib_r = random(10, 50);
            let new_obst = new Base(new v2(posib_x, posib_y), posib_r);
            let colls = circle_circles_collide(new_obst, this.obstacles);
            if(colls.length > 0){
                continue;
            }
            colls = circle_circles_collide(new_obst, this.bases);
            if(colls.length > 0){
                continue;
            }
            this.bases.push(new_obst);
        }
    }

    spawn_food(num){
        let iterations = 0;
        const wanted_size = this.food.length + num
        while(this.food.length < wanted_size && iterations < 1000) {
            iterations += 1;
            let posib_x = random_around(width/2, width*.5)
            let posib_y = random_around(height/2, height*.5)
            let posib_r = random(5, 10);
            let new_obst = new Food(new v2(posib_x, posib_y), posib_r);
            let colls = circle_circles_collide(new_obst, this.obstacles);
            if(colls.length > 0){
                continue;
            }
            colls = circle_circles_collide(new_obst, this.food);
            if(colls.length > 0){
                continue;
            }
            this.food.push(new_obst);
        }
    }

    spawn_players(num) {
        let placed_fighters = 0;
        let iterations = 0;
        while(placed_fighters != num && iterations < 1000) {
            iterations += 1;
            let posib_x = random_around(width/2, width*.4)
            let posib_y = random_around(height/2, height*.4)
            let posib_r = 5;
            let new_fighter = new Fighter(new v2(posib_x, posib_y), Math.floor(360*Math.random()), posib_r);
            let colls = circle_circles_collide(new_fighter, this.obstacles);
            if(colls.length > 0){
                continue;
            }

            // at this point the fighter is at a valid position

            if(this.dead_players.length > 1 && Math.random() < OFFSPRING_RATE){
                const total = this.dead_players.reduce((total, cur) => total + cur.pl.score, 0.0)
                let probs = null
                if(total === 0.0){
                    probs = this.dead_players.map(x => 1.0/this.dead_players.length)
                }else{
                    probs = this.dead_players.map(x => x.pl.score/total)
                }
                // selection
                const d1 = this.dead_players[choice(probs)].pl
                new_fighter.w = d1.w
                new_fighter.color = d1.color
                new_fighter.name = d1.name + ' Jr.'
    
                // crossover
                if(Math.random() < CROSSOVER_RATE){
                    const d2 = this.dead_players[choice(probs)].pl
                    
                    for (let i = 0; i < CROSSOVER_SIZE; i++) {
                        let ind = rand_ind(new_fighter.w)
                        let ind2 = rand_ind(new_fighter.w[ind])
                        new_fighter.w[ind][ind2] = d2.w[ind][ind2]
                    }
                }
                
                // mutation
                for (let i = 0; i < new_fighter.w.length; i++) {
                    const row = new_fighter.w[i];
                    for (let j = 0; j < row.length; j++) {
                        if(Math.random() < MUTATION_RATE){
                            new_fighter.w[i][j] += Math.random() - 0.5
                        }
                    }
                }
            }

            this.fighters.push(new_fighter);
            placed_fighters += 1;
        }
    }
}

async function loop(app) {
    app.update();
    app.draw();
    await sleep(17);
    loop(app) // might not wanna do that watch memory
}

function main() {
    const app = new MlFighters()
    app.create_map(3, NUM_BASES, 1);
    app.spawn_players(NUM_PLAYERS);
    loop(app);
}

run_tests()
main()



