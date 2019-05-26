
class Agent {
    constructor(bbox){
        this.spid = 1
        this.bbox = bbox
        this.speed = 0.1
        this.tasks = []
        this.cur_task = null
    }

    add_task(task){
        this.tasks.push(task)
    }

    choose_task(){
        // choose task
        this.cur_task = random_choice(this.tasks)
    }

    update(dt){
        if(this.cur_task){
            this.cur_task.update(dt)
        }
    }

}
Agent.image_name = 'res/char.png';

class Tree {
    
    constructor(bbox, spid){
        this.spid = spid
        this.bbox = bbox
        this.wood = 50 + random_int(350)
    }

    take_wood(num){
        if(num >= this.wood){
            var wood = this.wood
            this.wood = 0
            this.spid = 7
            return wood
        }else{
            this.wood -= num
            return num
        }
    }
}
Tree.image_name = 'res/tree_ss.png';

class OreDeposit {
    
    constructor(bbox, spid){
        this.spid = 8
        this.bbox = bbox
        this.ore = 2000 + random_int(500)
    }

    take_ore(num){
        if(num >= this.ore){
            var ore = this.ore
            this.ore = 0
            this.spid = 7
            return ore
        }else{
            this.ore -= num
            return num
        }
    }
}
OreDeposit.image_name = 'res/ore.png';

class Village {
    
    constructor(bbox) {
        this.spid = 0
        this.bbox = bbox
        const info_bbox = BBox.from_centered_on(bbox.center(), 300, 200)
        this.info = new UIBox(info_bbox)
        this.resources = {
            'Food': 0,
            'Money': 0,
            'Wood': 0,
            'Ore': 0,
            'Clothes': 0,
        }
    }
    
    resources_list(){
        const arr = []
        for (var key in this.resources) {
            arr.push(`${key}: ${this.resources[key]}`);
        }
        return arr
    }
}
Village.image_name = 'res/main_house.png';