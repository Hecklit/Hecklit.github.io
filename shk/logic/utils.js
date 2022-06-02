Array.prototype.GameSample = function(){
    return this[Math.floor(Math.GameRandom()*this.length)];
}

Array.prototype.sample = function(){
    return this[Math.floor(Math.random()*this.length)];
}

Array.prototype.remove = function(e){
    return this.filter(a => a !== e);
}

Array.prototype.last = function(){
    return this[this.length-1];
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

function seedRandomNumberGenerator(a) {
    console.log("using seed ",a);
    Math.GameRandom = function() {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}