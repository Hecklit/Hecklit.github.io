const can = document.getElementById('can');
const ctx = can.getContext('2d');
const width = can.width = window.innerWidth * 0.9;
const height = can.height = window.innerHeight * 0.9;
const center = new v2(width / 2, height / 2);
const MAX_COOLDOWN = 100;
const NUM_PLAYERS = 300;
const CROSSOVER_RATE = 0.5;
const CROSSOVER_SIZE = 20;
const MUTATION_RATE = 0.1; // per gen
const FOOD_SPAWN_CHANCE = 0.01
const NUM_BASES = 10
const OFFSPRING_RATE = 0.8
const AFFECTION_RADIUS = 300
const AFFINITY_SCALAR = 1.0
const DISTANCE_FALLOFF = 100;

class MlFighters {
    constructor() {
        this.pointSize = 4;
        this.zoom = 1.0;
        this.dead_players = [];
        this.startTime = new Date();
        this.best_score = 0;
        this.best_genes = null;
        this.obstacles = [];
        this.molecules = [];
        this.bullets = [];
        this.food = [];
        this.bases = [];
    }

    draw() {
        clear(ctx);
        for (let i = 0; i < this.molecules.length; i++) {
            const molecule = this.molecules[i];
            drawCircle(ctx, molecule.pos, molecule.r, true, `rgb(${molecule.color[0]},${molecule.color[1]},${molecule.color[2]})`);
            // molecule.attachmentPoints.forEach(ap => {
            //     const pos = molecule.getAttachementPosition(ap);
            //     const c = ap.getAttachementColor();
            //     drawCircle(ctx, pos, this.pointSize * 0.5, true, `rgb(${c.x},${c.y},${c.z})`);
            // })

        }
    }

    update() {
        // remove dead bullets
        const deads = this.molecules.filter(x => !x.alive);
        this.bullets = this.bullets.filter(x => x.alive);
        this.molecules = this.molecules.filter(x => x.alive);
        for (let i = 0; i < deads.length; i++) {
            const d = deads[i];
            if (d.score > this.best_score) {
                this.best_score = d.score;
                this.best_genes = d.w;
            }
            this.dead_players.push({'pl': d, 'ts': new Date() - this.startTime});
        }
        this.dead_players = this.dead_players.sort((x, y) => x.pl.score - y.pl.score)
        this.dead_players.reverse()
        this.dead_players = this.dead_players.slice(0, NUM_PLAYERS);
        this.spawn_molecules(deads.length)

        this.molecules.forEach(m => this.move_molecule(m));
    }

    move_molecule(f) {
        if (!f.pos) {
            return;
        }

        let old_pos = f.pos;
        // let new_pos = f.pos.add(f.dir.scale(0.5));

        // get influence of all others in range
        const new_pos = this.molecules.reduce((acc, cur) => {
            const dist = cur.pos.sub(f.pos).length();
            if (dist === 0 || dist > AFFECTION_RADIUS) {
                return acc;
            }

            const distMod = DISTANCE_FALLOFF / dist;

            const out =  cur.attachmentPoints.reduce((a, c) => {
                const affinity = c.affinity[f.atom];
                return a.add(cur.getAttachementPosition(c).sub(f.pos).normalize().scale(affinity * AFFINITY_SCALAR * distMod));
            }, acc);
            // console.log("out.length()", out.length())

            return out;
        }, f.pos);

        f.pos = new_pos.add(f.external_force);
        f.external_force = f.external_force.scale(0.9);

        const border = 20;
        if ( !inside_rect(f.pos, border, border, width - border, height - border)) {
            f.pos = old_pos;
            f.external_force = new v2(width/2, height/2).sub(f.pos).normalize().scale(20);
            return false
        }
        //
        // f.dir = f.pos.sub(old_pos).normalize();
        // f.angle = get_angle_between(f.dir, new v2(0, 1));

        return true
    }

    create_map(num_obstacles, num_bases, num_food) {
        let placed_obstacles = 0;
        let iterations = 0;
        while (placed_obstacles != num_obstacles && iterations < 1000) {
            iterations += 1;
            let posib_x = random_around(width / 2, width * .5)
            let posib_y = random_around(height / 2, height * .5)
            let posib_r = random(10, 50);
            let new_obst = new Obstacle(new v2(posib_x, posib_y), posib_r);
            let colls = circle_circles_collide(new_obst, this.obstacles);
            if (colls.length > 0) {
                continue;
            }
            this.obstacles.push(new_obst);
            placed_obstacles += 1;
        }
        this.spawn_food(num_food)

        iterations = 0;
        while (this.bases.length != num_bases && iterations < 1000) {
            iterations += 1;
            let posib_x = random_around(width / 2, width * .5)
            let posib_y = random_around(height / 2, height * .5)
            let posib_r = random(10, 50);
            let new_obst = new Base(new v2(posib_x, posib_y), posib_r);
            let colls = circle_circles_collide(new_obst, this.obstacles);
            if (colls.length > 0) {
                continue;
            }
            colls = circle_circles_collide(new_obst, this.bases);
            if (colls.length > 0) {
                continue;
            }
            this.bases.push(new_obst);
        }
    }

    spawn_food(num) {
        let iterations = 0;
        const wanted_size = this.food.length + num
        while (this.food.length < wanted_size && iterations < 1000) {
            iterations += 1;
            let posib_x = random_around(width / 2, width * .5)
            let posib_y = random_around(height / 2, height * .5)
            let posib_r = random(5, 10);
            let new_obst = new Food(new v2(posib_x, posib_y), posib_r);
            let colls = circle_circles_collide(new_obst, this.obstacles);
            if (colls.length > 0) {
                continue;
            }
            colls = circle_circles_collide(new_obst, this.food);
            if (colls.length > 0) {
                continue;
            }
            this.food.push(new_obst);
        }
    }

    spawn_molecules(num) {
        let placed_molecules = 0;
        let iterations = 0;
        while (placed_molecules != num && iterations < 1000) {
            iterations += 1;
            let posib_x = random_around(width / 2, width * .4)
            let posib_y = random_around(height / 2, height * .4)
            let posib_r = 5;
            let new_molecule = new Molecule(new v2(posib_x, posib_y), Math.floor(360 * Math.random()), posib_r);
            let colls = circle_circles_collide(new_molecule, this.obstacles);
            if (colls.length > 0) {
                continue;
            }

            // at this point the molecule is at a valid position

            if (this.dead_players.length > 1 && Math.random() < OFFSPRING_RATE) {
                const total = this.dead_players.reduce((total, cur) => total + cur.pl.score, 0.0)
                let probs = null
                if (total === 0.0) {
                    probs = this.dead_players.map(x => 1.0 / this.dead_players.length)
                } else {
                    probs = this.dead_players.map(x => x.pl.score / total)
                }
                // selection
                const d1 = this.dead_players[choice(probs)].pl
                new_molecule.w = d1.w
                new_molecule.color = d1.color
                new_molecule.name = d1.name + ' Jr.'

                // crossover
                if (Math.random() < CROSSOVER_RATE) {
                    const d2 = this.dead_players[choice(probs)].pl

                    for (let i = 0; i < CROSSOVER_SIZE; i++) {
                        let ind = rand_ind(new_molecule.w)
                        let ind2 = rand_ind(new_molecule.w[ind])
                        new_molecule.w[ind][ind2] = d2.w[ind][ind2]
                    }
                }

                // mutation
                for (let i = 0; i < new_molecule.w.length; i++) {
                    const row = new_molecule.w[i];
                    for (let j = 0; j < row.length; j++) {
                        if (Math.random() < MUTATION_RATE) {
                            new_molecule.w[i][j] += Math.random() - 0.5
                        }
                    }
                }
            }

            this.molecules.push(new_molecule);
            placed_molecules += 1;
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
    app.spawn_molecules(NUM_PLAYERS);
    loop(app);
}

run_tests()
main()



