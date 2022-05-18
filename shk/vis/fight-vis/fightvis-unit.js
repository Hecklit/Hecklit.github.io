class FightvisUnit {

    constructor(roll, x, y, dirx, color, type) {
        this.roll = roll;
        this.target = null;
        this.x = x;
        this.y = y;
        this.dirx = dirx;
        this.color = color;
        this.type = type;
        this.dice = {x, y, dx: 0, dy: 0,
            number: range(7, 1).sample(),
            alive: false, color: "white"}
        this.alive = true;
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

    throwDiceAtTarget() {
        if (!this.target) {
            return;
        }
        this.dice.color = this.color;
        this.throwDice(-2, 0, 20);
    }

    throwDice(mx = 3.5, my = 10, dy = 2) {
        const strength = mx + Math.random() * 2;
        this.dice.alive = true;
        this.dice.dx = this.dirx * strength;
        this.dice.dy = -spread(my, dy);
    }

    updateHomingMissiles(mills = 1) {
        if (!this.target) {
            return;
        }

        this.dice.x += this.dice.dx * mills;
        this.dice.y += this.dice.dy * mills;

        const dx = this.target.cx - this.dice.x;
        const dy = this.target.cy - this.dice.y;

        const distance = Math.abs(dx) + Math.abs(dy);

        const speed = 30;
        const dirx = speed * dx / distance;
        const diry = speed * dy / distance;

        if (distance < 10) {
            // reached target
            this.dice.x = this.target.cx;
            this.dice.y = this.target.cy;
            this.dice.dx = 0;
            this.dice.dy = 0;
            this.target.alive = false;
            // this.dice.alive = false;

        } else {
            // steer towards target
            const steerForceX = 0.06;
            this.dice.dx = (dirx * steerForceX) + (this.dice.dx * (1 - steerForceX));
            const steerForceY = 0.055;
            this.dice.dy = (diry * steerForceY) + (this.dice.dy * (1 - steerForceY));

        }
    }

    update(mills = 1) {
        if(!this.roll) {
            return;
        }
        const gravity = 1;
        this.dice.x += this.dice.dx * mills;
        this.dice.y += this.dice.dy * mills;

        if (this.dice.y < this.y) {
            // should fall down
            this.dice.dy += gravity;
        } else {
            if (Math.abs(this.dice.dy) < 3) {
                this.dice.dy = 0;
                this.dice.number = this.roll.n;
            } else {
                this.dice.dy *= -0.8;
                this.dice.number = range(7, 1).sample();
            }
            this.dice.y = this.dice.y - 1;
            this.dice.dx *= 0.90;

        }
    }

    draw() {
        if (this.alive) {
            Fightvis.instance.e.ctx.fillStyle = this.color;
            Fightvis.instance.e.circle(this.cx, this.cy, this.l / 2, true);
            Fightvis.instance.e.text(this.type, this.cx, this.cy + this.l / 4, this.l * 0.9, "white");
        }

        // dice
        if (this.dice.alive) {

            Fightvis.instance.e.ctx.fillStyle = this.color;
            const circleRadius = this.l * 0.25;
            // Fightvis.instance.e.ctx.fillRect(this.dice.x, this.dice.y, circleRadius , circleRadius);
            Fightvis.instance.e.text(this.dice.number, this.dice.x, this.dice.y + circleRadius /1.4, this.l * 0.5, this.dice.color);
        }

    }


}