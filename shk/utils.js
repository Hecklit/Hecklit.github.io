Array.prototype.sample = function(){
    return this[Math.floor(Math.random()*this.length)];
}

Array.prototype.remove = function(e){
    return this.filter(a => a !== e);
}

Array.prototype.shuffle = function() {
    const array = [...this];
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

class IdGen {
    static id = 0;
    static get() {
        return "id" + IdGen.id++;
    }
}

function circle(x, y, r, fill=true) {

    if(fill) {
        ctx.beginPath();
        ctx.ellipse(x, y, r, r, 0, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.ellipse(x, y, r, r, 0, 0, Math.PI * 2);

    }
    ctx.stroke();
}

function text(t, x, y, size, color){
    ctx.fillStyle= color;
    ctx.font = ""+ size + "px serif";
    ctx.fillText(t, x, y);
}

function arrow(fx, fy, tx, ty, color ="black") {
    const tmp = ctx.strokeStyle;
    ctx.strokeStyle = color;
    const headlen = 10; // length of head in pixels
    const dx = tx - fx;
    const dy = ty - fy;
    const angle = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(tx, ty);
    ctx.lineTo(tx - headlen * Math.cos(angle - Math.PI / 6), ty - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx - headlen * Math.cos(angle + Math.PI / 6), ty - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
    ctx.strokeStyle = tmp;
}

function sleep(t) {
    return new Promise(resolve => setTimeout(resolve, t));
}

function range(end, start= null){
        const res = [];
    if(!start) {
        for (let i = 0; i < end; i++) {
            res.push(i);
        }
    }else {
        for (let i = start; i < end; i++) {
            res.push(i);
        }
    }
    return res;
}

function spread(center, deviation) {
    return center + Math.random() * deviation - deviation/2;
}
