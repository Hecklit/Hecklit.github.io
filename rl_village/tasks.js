
class ChopWoodTask{
    constructor(agent, game){
        this.finished = false
        this.game = game
        this.cur_phase = 0
        this.wood = 0

        const valid_trees = this.game.trees.filter((t) => t.wood > 0)
        if(valid_trees.length == 0) {
            this.finished = true
            return
        }
        this.tree = random_choice(valid_trees)
        this.tasks = [
            new WalkToTask(agent, this.tree.bbox.bottom_center(), this.next_phase.bind(this)),
            new WaitTask(agent, 100, this.next_phase.bind(this)),
            new WalkToTask(agent, this.game.village.bbox.bottom_center(), this.next_phase.bind(this)),
            new WaitTask(agent, 10, this.next_phase.bind(this)),
        ]
    }

    next_phase(){
        if(this.cur_phase == this.tasks.length-1){
            this.cur_phase = 0
            const valid_trees = this.game.trees.filter((t) => t.wood > 0)
            if(valid_trees.length == 0) {
                this.finished = true
                return
            }
            this.tree = random_choice(valid_trees)
            this.tasks[0].target = this.tree.bbox.bottom_center()
            this.game.village.resources['Wood'] += this.wood
            this.wood = 0
        }else if(this.cur_phase == 1){
            this.wood = this.tree.take_wood(5)
            this.cur_phase += 1
        }else{
            this.cur_phase += 1
        }
        this.tasks[this.cur_phase].reset()
    }

    update(dt){
        if(this.finished) return

        this.tasks[this.cur_phase].update(dt)
    }
}

class MineOreTask{
    constructor(agent, game){
        this.finished = false
        this.game = game
        this.cur_phase = 0
        this.ore = 0

        const valid_ore_deposits = this.game.ore_deposits.filter((t) => t.ore > 0)
        if(valid_ore_deposits.length == 0) {
            this.finished = true
            return
        }
        this.ore_deposit = random_choice(valid_ore_deposits)
        this.tasks = [
            new WalkToTask(agent, this.ore_deposit.bbox.bottom_center(), this.next_phase.bind(this)),
            new WaitTask(agent, 100, this.next_phase.bind(this)),
            new WalkToTask(agent, this.game.village.bbox.bottom_center(), this.next_phase.bind(this)),
            new WaitTask(agent, 10, this.next_phase.bind(this)),
        ]
    }

    next_phase(){
        if(this.cur_phase == this.tasks.length-1){
            this.cur_phase = 0
            const valid_ore_deposits = this.game.ore_deposits.filter((t) => t.ore > 0)
            if(valid_ore_deposits.length == 0) {
                this.finished = true
                return
            }
            this.ore_deposit = random_choice(valid_ore_deposits)
            this.tasks[0].target = this.ore_deposit.bbox.bottom_center()
            this.game.village.resources['Ore'] += this.ore
            this.ore = 0
        }else if(this.cur_phase == 1){
            this.ore = this.ore_deposit.take_ore(5)
            this.cur_phase += 1
        }else{
            this.cur_phase += 1
        }
        this.tasks[this.cur_phase].reset()
    }

    update(dt){
        if(this.finished) return

        this.tasks[this.cur_phase].update(dt)
    }
}

class WaitTask{
    constructor(agent, cycles, on_finish){
        this.agent = agent
        this.cycles = cycles
        this.cur_cycle = 0
        this.finished = false
        this.on_finish = on_finish
    }

    update(dt){
        if(this.finished) return

        if(this.cycles > this.cur_cycle){
            this.cur_cycle += dt
        }else{
            this.finished = true
            this.on_finish()
        }
    }

    reset(){
        this.finished = false
        this.cur_cycle = 0
    }
}

class WalkToTask{
    constructor(agent, target, on_finish){
        this.target = target
        this.on_finish = on_finish
        this.agent = agent
        this.finished = false
    }

    update(dt){
        if(this.finished) return

        let dir = this.target.sub(this.agent.bbox.bottom_center())
        let length = dir.length()
        if(length < this.agent.speed * dt){
            this.finished = true
            this.agent.bbox.set_bottom_center(this.target.x, this.target.y)
            this.on_finish()
        }else{
            dir = dir.normalize().scale(this.agent.speed * dt)
            this.agent.bbox.move(dir.x, dir.y)
        }
    }

    reset(){
        this.finished = false
    }
}