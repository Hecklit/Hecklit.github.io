Array.prototype.sample = function(){
    return this[Math.floor(Math.random()*this.length)];
}

Array.prototype.remove = function(e){
    return this.filter(a => a !== e);
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

ctx.textAlign = 'center';
function text(t, x, y, size, color){
    ctx.fillStyle= color;
    ctx.font = ""+ size + "px serif";
    ctx.fillText(t, x, y);

}