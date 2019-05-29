
class Inventory{

    constructor(info){
        this.info = info
        this.res = {
            'Food': 0,
            'Money': 0,
            'Wood': 0,
            'Ore': 0,
            'Clothes': 0,
            'Swords': 0,
        }
    }

    add(type, num){
        if(Array.isArray(type) && Array.isArray(num)){
            const item_dict = make_dict(type, num)
            give_items(item_dict, this.res)
        }else{
            this.res[type] += num
        }
    }

    take(type, num){
        if(Array.isArray(type) && Array.isArray(num)){
            const item_dict = make_dict(type, num)
            if (has_items(item_dict, this.res)) {
                for (let i = 0; i < type.length; i++) {
                    this.take(type[i], num[i])
                }
                return true
            }else{
                return false
            }
        }else{
            if(this.res[type] >= num){
                this.res[type] -= num
                return true
            }else{
                return false
            }
        }
    }

    get_max_key(){
        var ma = 0
        var ma_key = ''
        for(var key in this.res){
            if(this.res[key] > ma){
                ma = this.res[key]
                ma_key = key
            }
        }
        return ma_key
    }

    get_max_val(){
        var ma = 0
        for(var key in this.res){
            if(this.res[key] > ma){
                ma = this.res[key]
            }
        }
        return ma
    }

    inv_list(all=false){
        const arr = []
        for (var key in this.res) {
            if(!all && this.res[key] == 0){
                continue
            }
            arr.push(`${key}: ${this.res[key]}`);
        }
        return arr
    }

    missing_items(wants){
        return missing_items(wants, this.res)
    }

    num(item){
        return this.res[item]
    }

    take_all(item){
        const num = this.res[item]
        this.res[item] = 0
        return num
    }
}

class Agent {
    constructor(bbox){
        this.spid = 1
        this.bbox = bbox
        this.speed = 0.1
        this.tasks = []
        this.cur_task = null
        const info_bbox = BBox.from_centered_on(bbox.center(), 300, 200)
        this.inv = new Inventory(new UIBox(info_bbox))
    }

    add_task(task){
        this.tasks.push(task)
    }

    choose_task(){
        // choose task
        this.cur_task = random_choice(this.tasks)
        // this.cur_task.reset()
    }

    update(dt){
        if(this.cur_task){
            this.cur_task.update(dt)
        }
    }

}
Agent.image_name = 'res/char.png';

class Resource {
    constructor(type){
        this.type = type
        this.inv = new Inventory()
    }

    gather(num){
        if(this.inv.take(this.type, num)){
            return num
        }else{
            this.spid = 7
            const left = this.inv.num(this.type)
            this.inv.take(this.type, left)
            return left
        }
    }
}

class Tree extends Resource{

    constructor(bbox, spid){
        super('Wood')
        this.spid = spid
        this.bbox = bbox
        const info_bbox = BBox.from_centered_on(bbox.center(), 300, 200)
        this.inv.info = new UIBox(info_bbox)
        this.inv.add('Wood', 50 + random_int(350))
    }
}
Tree.image_name = 'res/tree_ss.png';

class OreDeposit extends Resource{
    
    constructor(bbox){
        super('Ore')
        this.spid = 8
        this.bbox = bbox
        const info_bbox = BBox.from_centered_on(bbox.center(), 300, 200)
        this.inv.info = new UIBox(info_bbox)
        this.inv.add('Ore', 2000 + random_int(500))
    }
}
OreDeposit.image_name = 'res/ore.png';

class Village {
    
    constructor(bbox) {
        this.spid = 0
        this.bbox = bbox
        const info_bbox = BBox.from_centered_on(bbox.center(), 300, 200)
        this.inv = new Inventory(new UIBox(info_bbox))
    }
}
Village.image_name = 'res/main_house.png';

class Forge {
    
    constructor(bbox) {
        this.spid = 9
        this.bbox = bbox
        const info_bbox = BBox.from_centered_on(bbox.center(), 300, 200)
        this.inv = new Inventory(new UIBox(info_bbox))
        this.recipes = {
            'Sword': {
                'Ore': 50,
                'Wood': 20,
            }
        }
    }
    
    make_item(item){
        const dict = this.recipes[item]
        return this.inv.take(Object.keys(dict), Object.values(dict))
    }
    
    missing_items_for(item){
        return this.inv.missing_items(this.recipes[item])
    }
}
Forge.image_name = 'res/forge.png';