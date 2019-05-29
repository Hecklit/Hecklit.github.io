
class ForgeWeaponTask{
    constructor(agent, game, on_fail){
        this.finished = false
        this.on_fail = on_fail
        this.game = game
        this.cur_phase = 0
        this.agent = agent

        this.forge = random_choice(this.game.forges)
        this.tasks = [
            new WalkToTask(agent, this.forge.bbox.bottom_center(), this.next_phase.bind(this)),
            new GetItemTaks(this.agent, this.game, this.forge,
                null, null, this.next_phase.bind(this), this.on_get_item_failure.bind(this)),
            new WaitTask(agent, 3000, this.next_phase.bind(this)),
            new WalkToTask(agent, this.game.village.bbox.bottom_center(), this.next_phase.bind(this)),
            new WaitTask(agent, 10, this.next_phase.bind(this)),
        ]
    }

    reset(){
        this.finished = false
        this.cur_phase = 0
        this.tasks[this.cur_phase].reset()
    }

    on_get_item_failure(failure_phase){
        if(failure_phase == 1){
            // village does not have enough resources
            this.on_fail()
        }else{
            // lost resources on the way somehow
            this.tasks[1].reset()
        }
    }

    next_phase(){
        if(this.cur_phase == this.tasks.length-1){
            const num = this.agent.inv.take_all('Swords')
            this.game.village.inv.add('Swords', num)
            this.reset()

            this.forge = random_choice(this.game.forges)
            this.tasks[0].target = this.forge.bbox.bottom_center()
        }else if(this.cur_phase == 0 || this.cur_phase == 1){
            const mi = this.forge.missing_items_for('Sword')
            const keys = Object.keys(mi)
            if(keys.length > 0){
                print(`missing ${keys[0]}`)
                this.cur_phase = 1
                this.tasks[this.cur_phase].item = keys[0]
                this.tasks[this.cur_phase].amount = mi[keys[0]]
            }else{
                this.forge.make_item('Sword')
                this.agent.inv.add('Swords', 1)
                this.cur_phase = 2
            }
        }else{
            this.cur_phase += 1
        }
        this.tasks[this.cur_phase].reset()
    }

    update(dt){
        if(this.finished){
            print('update early return forge weapon')
            return
        }

        this.tasks[this.cur_phase].update(dt)
    }
}

class GetItemTaks{
    constructor(agent, game, target, item, amount, on_finish, on_fail){
        this.game = game
        this.cur_phase = 0
        this.target = target
        this.item = item
        this.amount = amount
        this.on_finish = on_finish
        this.on_fail = on_fail
        this.agent = agent
        this.tasks = [
            new WalkToTask(this.agent, this.game.village.bbox.bottom_center(), this.next_phase.bind(this)),
            new WaitTask(this.agent, 10, this.next_phase.bind(this)),
            new WalkToTask(this.agent, this.target.bbox.bottom_center(), this.next_phase.bind(this)),
            new WaitTask(this.agent, 10, this.next_phase.bind(this)),
        ]
    }

    next_phase(){
        if(this.cur_phase == this.tasks.length-1){
            // deliver the goods
            if(this.agent.inv.take(this.item, this.amount)){
                // has the goods
                this.target.inv.add(this.item, this.amount)
                this.on_finish()
            }else{
                // does not have -> failed
                this.on_fail(this.cur_phase)
            }
        }else if(this.cur_phase == 1){
            if(this.game.village.inv.take(this.item, this.amount)){
                // village center has enough resources
                this.cur_phase += 1
                this.agent.inv.add(this.item, this.amount)
            }else{
                // not enough resources -> failed
                this.on_fail(this.cur_phase)
            }
        }else{
            this.cur_phase += 1
        }
        this.tasks[this.cur_phase].reset()
    }

    update(dt){
        if(this.finished){
            print('update early return get item')
            return
        }

        this.tasks[this.cur_phase].update(dt)
    }

    reset(){
        this.cur_phase = 0
        this.tasks[this.cur_phase].reset()
    }
}

class GatherTask {
    constructor(agent, game, type, resources, amount, on_fail){
        this.on_fail = on_fail
        this.type = type
        this.amount = amount
        this.finished = false
        this.game = game
        this.cur_phase = 0
        this.agent = agent
        this.resources = resources

        if(!this.is_valid_task()){
            this.on_fail()
            print(`${type} Task could not be initalized`)
            return
        }

        this.resource = random_choice(this.resources)
        this.tasks = [
            new WalkToTask(agent, this.resource.bbox.bottom_center(), this.next_phase.bind(this)),
            new WaitTask(agent, 1000, this.next_phase.bind(this)),
            new WalkToTask(agent, this.game.village.bbox.bottom_center(), this.next_phase.bind(this)),
            new WaitTask(agent, 100, this.next_phase.bind(this)),
        ]
    }

    reset(){
        this.cur_phase = 0
        this.finished = false
        this.tasks[this.cur_phase].reset()
    }

    is_valid_task(){
        const valid_resources = this.resources.filter((t) => t.inv.num(this.type) > 0)
        return !(valid_resources.length == 0)
    }

    next_phase(){
        if(this.cur_phase == this.tasks.length-1){
            this.cur_phase = 0

            if(!this.is_valid_task()){
                this.on_fail()
                return
            }

            // choose a new resource
            this.resource = random_choice(this.resources)
            this.tasks[0].target = this.resource.bbox.bottom_center()

            // give all resources to the village
            let num = this.agent.inv.take_all('Wood')
            this.game.village.inv.add('Wood', num)
            num = this.agent.inv.take_all('Ore')
            this.game.village.inv.add('Ore', num)
            num = this.agent.inv.take_all(this.type)
            this.game.village.inv.add(this.type, num)

        }else if(this.cur_phase == 1){
            this.agent.inv.add(this.type, this.resource.gather(this.amount))
            this.cur_phase += 1
        }else{
            this.cur_phase += 1
        }
        this.tasks[this.cur_phase].reset()
    }

    update(dt){
        if(this.finished){
            print('update early return gather')
            return
        }

        this.tasks[this.cur_phase].update(dt)
    }
}

class ChopWoodTask extends GatherTask{
    constructor(agent, game, on_fail){
        super(agent, game, 'Wood', game.trees, 5, on_fail)
    }
}

class MineOreTask extends GatherTask{
    constructor(agent, game, on_fail){
        super(agent, game, 'Ore', game.ore_deposits, 5, on_fail)
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
        if(this.finished){
            print('update early return wait')
            return
        }

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
        if(this.finished){
            print('update early return walk to')
            return
        }


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