function turn_vec(deg) {
    const angleInRad = (deg*2*Math.PI)/360;
    return new v2(Math.cos(angleInRad), Math.sin(angleInRad));
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const max_health = 500;
let fighter_count = 1;
class Fighter{
    constructor(pos, angle, r) {
        this.name = 'Fighter Nr. ' +  fighter_count++;
        this.pos = pos;
        this.angle = angle;
        this.r = r;
        const angleInRad = (angle*2*Math.PI)/360;
        this.dir = new v2(Math.cos(angleInRad), Math.sin(angleInRad));
        this.health = max_health;
        this.alive = true;
        this.sensors = [];
        this.set_sensor_pos();
        this.generate_weights();
        this.cd = 5;
        this.score = 0;
        this.last_decision = 0;
        this.last_position = pos;
        this.color = [getRandomInt(0, 256), getRandomInt(0, 256), getRandomInt(0, 256)]
        this.carries_food = false;
    }

    generate_weights(){
        this.w = [];
        for (let i = 0; i < 5; i++) {
            this.w.push([]);
            for (let j = 0; j < 9; j++) {
                this.w[i].push(Math.random());
            }
        }
    }

    set_sensor_pos() {
        let d = 60;
        let scale = d;
        if(!this.sensors.length > 0) {
            for (let i = -2; i < 3; i++) {
                if((i+2)%2 !== 0) {
                    scale = d*0.75;
                }else{
                    scale = d;
                }
                this.sensors.push(new Sensor(this.pos.add(turn_vec(this.angle + i*20).scale(d)), 0));
            }
        }else{
            let index = 0;
            for (let i = -2; i < 3; i++) {
                if(index%2 !== 0) {
                    scale = d*0.75;
                }else{
                    scale = d;
                }
                this.sensors[index++].pos = (this.pos.add(turn_vec(this.angle + i*20).scale(scale)));
            }
        }
    }

    turn(d_angle) {
        this.angle = (this.angle + d_angle)%360;
        const angleInRad = (this.angle*2*Math.PI)/360;
        this.dir = new v2(Math.cos(angleInRad), Math.sin(angleInRad));
        this.set_sensor_pos();
    }

    deal_dmg(dmg) {
        this.health -= dmg;
        if(this.health <= 0) {
            this.alive = false;
        }
    }
}

class Bullet{
    constructor(pos, dir, vel, r, pl) {
        this.pos = pos;
        this.dir = dir;
        this.vel = vel;
        this.r = r;
        this.alive = true;
        this.pl = pl
    }
}

class Sensor{
    constructor(pos, state) {
        this.pos = pos;
        this.state = state;
        this.r = 1;
    }
}