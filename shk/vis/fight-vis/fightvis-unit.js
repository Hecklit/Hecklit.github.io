class FightvisUnit {

    constructor(rolls, x, y, dirx, color, type, hp, totalHp) {
        this.x = x;
        this.y = y;
        this.dirx = dirx;
        this.color = color;
        this.type = type;
        this.dice = rolls.map(r => ({
            x, y, dx: 0, dy: 0,
            number: range(7, 1).sample(),
            roll: r,
            alive: false, color,
            target: null,
            targetReached: false,
        }));
        this.alive = true;
        this.hp = hp;
        this.totalHp = totalHp;
    }

    get cx() {
        return this.x + Fightvis.unitSize / 2;
    }

    get cy() {
        return this.y + Fightvis.unitSize / 2;
    }

    get l() {
        return Fightvis.unitSize;
    }

    throwDieAtTarget() {
        this.dice.forEach(die => {
            if(die.roll.h) {
            die.color = this.color;
            }
            this.throwDie(die,-2, 0, 20);
        });
    }

    throwDie(die, mx = 3.5, my = 10, dy = 2) {
        const strength = mx + Math.random() * 2;
        die.alive = true;
        die.dx = this.dirx * strength;
        die.dy = -spread(my, dy);
    }

    updateHomingMissiles(mills = 1) {
        this.dice.forEach(die => this.updateHomingMissilesForOneDie(die, mills))
    }

    updateHomingMissilesForOneDie(die, mills = 1) {
        if (!die.target) {
            return;
        }

        die.x += die.dx * mills;
        die.y += die.dy * mills;

        const dx = die.target.cx - die.x;
        const dy = die.target.cy - die.y;

        const distance = Math.abs(dx) + Math.abs(dy);

        const speed = 30;
        const dirx = speed * dx / distance;
        const diry = speed * dy / distance;

        if (distance < 10) {
            if (!die.targetReached) {
                // reached target
                die.x = die.target.cx;
                die.y = die.target.cy;
                die.dx = 0;
                die.dy = 0;
                die.target.totalHp -= 1;
                if (die.target.totalHp <= 0) {
                    die.target.alive = false;
                }
                die.targetReached = true;
                // die.alive = false;
            }

        } else {
            // steer towards target
            const steerForceX = 0.06;
            die.dx = (dirx * steerForceX) + (die.dx * (1 - steerForceX));
            const steerForceY = 0.055;
            die.dy = (diry * steerForceY) + (die.dy * (1 - steerForceY));
        }
    }

    update(mills=1){
        this.dice.forEach(die => this.updateOneDie(die, mills));
    }

    updateOneDie(die, mills = 1) {
        if (!die.roll) {
            return;
        }
        const gravity = 1;
        die.x += die.dx * mills;
        die.y += die.dy * mills;

        if (die.y < this.y) {
            // should fall down
            die.dy += gravity;
        } else {
            if (Math.abs(die.dy) < 3) {
                die.dy = 0;
                die.number = die.roll.n;
            } else {
                die.dy *= -0.8;
                die.number = range(7, 1).sample();
            }
            die.y = die.y - 1;
            die.dx *= 0.90;
        }
    }

    draw() {
        const e = Fightvis.instance.e;
        if (this.alive) {
            e.ctx.fillStyle = this.color;
            e.circle(this.cx, this.cy, this.l / 2, true);
            e.text(this.type, this.cx, this.cy + this.l / 4, this.l * 0.9, "white");
            // if (this.target) {
            //     e.arrow(this.cx, this.cy,
            //         this.target.cx, this.target.cy, this.color)
            // }

            // HP Bar
            e.fillRect(this.x, this.y,
                this.l, this.l * 0.1, "red");
            const hpRatio = this.totalHp / this.hp;
            e.fillRect(this.x, this.y,
                this.l * hpRatio, this.l * 0.1, "green");

        }

        // dice
        this.dice.forEach(die => {

        if (die.alive) {
            Fightvis.instance.e.ctx.fillStyle = this.color;
            const circleRadius = this.l * 0.25;
            // Fightvis.instance.e.ctx.fillRect(die.x, die.y, circleRadius , circleRadius);
            Fightvis.instance.e.text(die.number, die.x, die.y + circleRadius / 1.4, this.l * 0.5, die.color);
        }
        })

    }


}