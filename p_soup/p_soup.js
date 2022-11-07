const can = document.getElementById('can');
const ctx = can.getContext('2d');
const width = can.width = window.innerWidth * 0.9;
const height = can.height = window.innerHeight * 0.9;
const center = new v2(width / 2, height / 2);
const NUM_PLAYERS = 200;
const AFFECTION_RADIUS = 200
const AFFINITY_SCALAR = 1.0
const DISTANCE_FALLOFF = 100;

class MlFighters {
    constructor() {
        this.pointSize = 4;
        this.zoom = 1.0;
        this.startTime = new Date();
        this.molecules = [];
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

    spawn_molecules(num) {
        let placed_molecules = 0;
        let iterations = 0;
        while (placed_molecules != num && iterations < 1000) {
            iterations += 1;
            let posib_x = random_around(width / 2, width * .4)
            let posib_y = random_around(height / 2, height * .4)
            let posib_r = 5;
            let new_molecule = new Molecule(new v2(posib_x, posib_y), Math.floor(360 * Math.random()), posib_r);

            // at this point the molecule is at a valid position

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
    app.spawn_molecules(NUM_PLAYERS);
    loop(app);
}

run_tests()
main()



