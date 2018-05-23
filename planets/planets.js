const can = document.getElementById('can');
const ctx = can.getContext('2d');
const width = can.width = window.innerWidth *0.8;
const height = can.height = window.innerHeight *0.8;
let canRect = can.getBoundingClientRect();
let mouseDown = false;

planets = [];

window.onresize = (e) => {
    canRect = can.getBoundingClientRect();
};

can.onmouseup = () => {
}

can.onmousedown = (e) => {
}

can.onmousemove = (e) => {
    if(mouseDown) {
    }
}

window.onkeydown = (e) => {
    // Leertaste
    if(e.keyCode === 32) {
        planets.push({
            pos: new v2(width/2, height/2),
            vel: new v2(Math.random()*0.01, Math.random()*0.01),
            r: 10 + Math.random()*50
        })
    }
}

function randomInt(scalar) {
    return Math.floor(Math.random()*scalar);
}

function clear() {
    ctx.fillStyle = "#4a4f5c";
    ctx.fillRect(0,0, width, height);
}

function do_collide(p1, p2) {
    let diff = p2.pos.sub(p1.pos)
    let distance = diff.length()
    if(distance >= p1.r + p2.r) {
        return false
    }else{
        return p1.pos.add(diff.scale(0.5)) 
    }
}

function apply_force_from(source, p1, force) {
    let dir = p1.pos.sub(source).normalize();
    p1.vel = p1.vel.add(dir.scale(force));
}

function update() {
    for (let i = 0; i < planets.length; i++) {
        const planet_1 = planets[i];
        for (let j = i+1; j < planets.length; j++) {
            const planet_2 = planets[j];
            if(planet_1 === planet_2) {
                console.log('this should never happen');
                continue
            }
            let collision = do_collide(planet_1, planet_2);
            if(collision != false) {
                planet_1.vel = planet_1.vel.scale(0.9);
                planet_2.vel = planet_2.vel.scale(0.9);
                apply_force_from(collision, planet_1, 2);
                apply_force_from(collision, planet_2, 2);
            }else{
                let diff = planet_2.pos.sub(planet_1.pos);
                apply_force_from(planet_1.pos, planet_2, planet_1.r*-0.1/diff.length());
            }
        }
    }

    // bounnce on world edges
    for (let i = 0; i < planets.length; i++) {
        const p = planets[i];
        let next_pos = p.pos.add(p.vel)
        if(next_pos.x < p.r|| next_pos.x > width - p.r || next_pos.y < p.r || next_pos.y > height - p.r) {
            p.vel = p.vel.scale(-1);
        }
    }

    // move every planet according to vel
    for (let i = 0; i < planets.length; i++) {
        const p = planets[i];
        p.pos = p.pos.add(p.vel)
    }

    draw();
}

function draw() {
    clear();
    for (let i = 0; i < planets.length; i++) {
        const planet = planets[i];
        ctx.beginPath();
        ctx.fillStyle = 'gray'
        ctx.arc(planet.pos.x, planet.pos.y, planet.r, 0, 2*Math.PI);
        ctx.fill();
        
    }
    window.requestAnimationFrame(update);
}

clear();
update();