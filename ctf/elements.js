class Match{
    constructor(teams, map){
        this.teams = teams
        this.map = map
    }

    update(dt){
        this.map.update(dt)
        for (const team of this.teams) {
            team.update(dt)
        }
    }

    draw(){
        this.map.draw()
        for (const team of this.teams) {
            team.draw()
        }
    }

    start(){
        for (const team of this.teams) {
            team.set_base(this.map.get_free_base())
            team.spawn_players()
        }
    }
}

class Map{
    constructor(w, h, num_bases){
        this.bounds = createVector(w, h)
        this.center = p5.Vector.div(this.bounds, 2)
        this.bases = []
        
        const offset = p5.Vector.mult(this.center, 0.7)
        const rad = TWO_PI / num_bases
        for (let i = 0; i < num_bases; i++) {
            offset.rotate(i * rad)
            const base_pos = p5.Vector.add(this.center, offset)
            this.bases.push(new Base(base_pos))
        }

        this.cur_base_index = 0
    }

    update(dt){

    }

    draw(){
        for (const base of this.bases) {
            base.draw()
        }
    }

    get_free_base(){
        const base = this.bases[this.cur_base_index]
        this.cur_base_index += 1
        return base
    }
}

class Team{
    constructor(color, size){
        this.color = color
        this.base = null
        this.size = size
        this.players = []
        for (let i = 0; i < size; i++) {
            this.players.push(
                new Player()
            )
        }
    }

    spawn_players(){
        for (const pl of this.players) {
            pl.set_pos(this.base.pos)
        }
    }

    set_base(base){
        this.base = base
        base.set_team(this)
    }

    add_player(pl){
        this.players.push(pl)
    }

    update(dt){
        for (const pl of this.players) {
            pl.update(dt)
        }
    }

    draw(){
        
    }
}

class Player{
    constructor(pos){
        this.pos = pos
    }

    update(dt){

    }

    draw(){
        ellipse(this.pos.x, this.pos.y, 3, 3)
    }

    set_pos(pos){
        this.pos = pos
    }
}

class Base{
    constructor(pos, team){
        this.team = team
        this.pos = pos
        this.flag = new Flag(pos, team)
    }

    update(dt){
       
    }

    draw(){
        if(this.team){
            fill(this.team.color)
        }else{
            fill('gray')
        }
        ellipse(this.pos.x, this.pos.y, 20, 20)
    }

    set_team(team){
        this.team = team
    }
}

class Flag{
    constructor(pos, team){
        this.team = team
        this.pos = pos
    }

    update(dt){

    }

    draw(){

    }
}