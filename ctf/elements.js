class Match{
    constructor(teams, map){
        if(teams === undefined){
            teams = [
                new Team('red', 10),
                new Team('blue', 10),
            ]
        }
        if(map === undefined){
            map = new Map(100, 100, teams.length)
        }
        this.teams = teams
        this.map = map
    }

    get_random_player(team){
        return randomElement(this.teams[team-1].players)
    }

    get_base(team){
        return this.teams[team-1].base
    }

    get_points(team){
        return this.teams[team-1].points
    }

    update(dt){
        this.map.update(dt)
        for (const team of this.teams) {
            team.update(dt)
        }

        check_for_collision()
    }

    check_for_collision(){
        // creating list with all entities
        const entities = [];
        for (const team of this.teams) {
            entities.push(team.base)
            for (const pl of team.players) {
                entities.push(pl)
            }
        }

        // checking collision from everyone to everyone
        for (let i = 0; i < entities.length; i++) {
            for (let j = i+1; j < entities.length; j++) {
                if(i==j) continue;

                const e1 = entities[i];
                const e2 = entities[j];
                if(circleCollide(e1, e2)){
                    e1.on_collide(e2)
                    e2.on_collide(e1)
                }
            }
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
        this.points = 0
        this.players = []
        for (let i = 0; i < size; i++) {
            this.players.push(
                new Player(null, this)
            )
        }
    }

    spawn_players(){
        for (const pl of this.players) {
            pl.set_pos(this.base.pos)
        }
    }

    on_score_point(){
        this.points += 1
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
    constructor(pos, team){
        this.pos = pos
        this.r = 5
        this.flag = null
        this.team = team
    }

    update(dt){

    }

    draw(){
        ellipse(this.pos.x, this.pos.y, this.r, this.r)
    }

    set_pos(pos){
        this.pos = pos
    }

    give_flag(flag){
        this.flag = flag
    }

    on_collide(e){

    }
}

class Base{
    constructor(pos, team){
        this.team = team
        this.pos = pos
        this.r = 20
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
        ellipse(this.pos.x, this.pos.y, this.r, this.r)
    }

    set_team(team){
        this.team = team
    }

    give_flag(pl){
        pl.give_flag(this.flag)
        this.flag = null
    }

    on_collide(e){
        if(e instanceof Player && this.flag !== null){
            if(e.team.id !== this.team.id){
                // enemy player got took flag
                this.give_flag(e)
            }else{
                // own player on base
                if(e.flag instanceof Flag){
                    // reset flag to base
                    e.team.on_score_point()
                    e.flag.team.base.flag = e.flag
                    e.flag = null
                }
            }
        }
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