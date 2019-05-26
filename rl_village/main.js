class Game {

    constructor() {
        this.can = document.getElementById('can');
        this.ctx = can.getContext('2d');
        this.width = can.width = window.innerWidth - 10;
        this.height = can.height = window.innerHeight * 0.9;
        this.can_rect = can.getBoundingClientRect();
        this.center = new v2(this.width / 2, this.height / 2);
        this.can.onmousemove = this.on_mouse_move.bind(this)

        // create the world
        this.village = new Village(BBox.from_centered_on(this.center, 274 * 0.125, 320 * 0.125))
        this.village.resources['Ore'] += 100
        this.village.resources['Wood'] += 42

        this.trees = []
        for (let i = 0; i < 10; i++) {
            const spread = 100
            const margin = spread * 0.1
            const pos = new v2(
                random_in_interval(spread + margin, this.width - spread - margin),
                random_in_interval(spread + margin, this.width - spread - margin))
            for (let a = 0; a < random_int(50)+ 5; a++) {
                const noise = new v2(Math.random()*spread, Math.random()*spread)
                const tree = new Tree(
                    BBox.from_centered_on(pos.add(noise),
                        80 *(0.2+Math.random()*0.3),
                        128 *(0.2+Math.random()*0.3)), 2+random_int(5))
                this.trees.push(tree)    
            }
        }
        this.agents = []
        for (let i = 0; i < 10; i++) {
            const pos = new v2(Math.random()*this.width, Math.random()*this.height)
            const agent = new Agent((BBox.from_centered_on(pos, 142*0.05, 312*0.05)));
            this.agents.push(agent)
        }

        this.tasks = []
        for (const agent of this.agents) {
            const tree = random_choice(this.trees)
            const task = new ChopWoodTask(agent, this, () => {
                print('done')
            })
            this.tasks.push(task)
        }
    }

    on_mouse_move(e) {
        //pos on canvas
        const mouse_pos = new v2(e.clientX - this.can_rect.left, e.clientY - this.can_rect.top);
        if (this.village.bbox.is_inside(mouse_pos)) {
            if (!this.village.info.visible) {
                this.village.info.visible = true
            }
        } else {
            if (this.village.info.visible) {
                this.village.info.visible = false
            }
        }
    }

    clear() {
        this.ctx.fillStyle = "#187249";
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    draw_Image(agent) {
        // draw shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        this.ctx.beginPath();
        const center = agent.bbox.center()
        this.ctx.ellipse(center.x, agent.bbox.y+agent.bbox.h, agent.bbox.w *0.3, agent.bbox.h*0.05/2, 0, 0, 2 * Math.PI);
        this.ctx.fill()

        const w = this.sprites[agent.spid].width
        const h = this.sprites[agent.spid].height
        const bot = agent.bbox.bottom_center()
        this.ctx.drawImage(this.sprites[agent.spid], 0, 0, w, h,
            bot.x - agent.bbox.w/2, bot.y - agent.bbox.h, agent.bbox.w, agent.bbox.h);
        this.t0 = Date.now()

        // for debug
        if(false){
            this.ctx.beginPath();
            this.ctx.rect(agent.bbox.x,agent.bbox.y, agent.bbox.w, agent.bbox.h)
            this.ctx.stroke()
        }
    }

    draw_bbox(bbox, color, text) {
        this.ctx.fillStyle = color
        this.ctx.fillRect(bbox.x, bbox.y, bbox.w, bbox.h)
        this.ctx.fillStyle = 'white'
        this.ctx.font = "20px Georgia";
        const xof = 10
        const yof = 26
        let i = 0
        const line_height = bbox.h / text.length
        for (const t of text) {
            this.ctx.fillText(t, bbox.x + xof, bbox.y + yof + i * line_height, bbox.w - xof);
            i += 1
        }
    }

    load_sprite_sheet(img_path, sprites){
        return new Promise(function(resolve, reject) {
            const image = new Image();
    
            image.onload = function () {
                let bitmaps = []
                for(const sprite of sprites){
                    const bm = createImageBitmap(image, sprite[0], sprite[1], sprite[2], sprite[3])
                    bitmaps.push(bm)
                }
                Promise.all(bitmaps).then(resolve);
            }
            image.src = img_path
        });
    }

    start() {
        const that = this
        // load all resources
        const w = 90
        Promise.all([
            this.load_sprite_sheet(Village.image_name, [[0, 0, 274, 320]]),
            this.load_sprite_sheet(Agent.image_name, [[0, 0, 73, 162]]),
            this.load_sprite_sheet(Tree.image_name, [
                [w*0, 128*0, w, 128],
                [w*1, 128*0, w, 128],
                [w*2, 128*0, w, 128],
                [w*3, 128*0, w, 128],
                [w*4, 128*0, w, 128],
                [289, 129, w, 60],
            ]),

        ]).then((sprites) => {
            this.sprites = []
            for (const sp of sprites) {
                for (const s of sp) {
                    this.sprites.push(s)
                }
            }
            this.on_load()
        })

    }

    on_load() {
        this.t0 = Date.now()
        this.draw()
    }

    draw() {
        // update
        for (const task of this.tasks) {
            task.update(Date.now() - this.t0)
        }
        this.t0 = Date.now()

        // draw

        this.clear()
        // z ordering
        let ent = [this.village].concat(this.trees, this.agents)
        ent = ent.sort((a, b) => a.bbox.y - b.bbox.y)
        for (const e of ent) {
            this.draw_Image(e)
        }

        // ui always last
        if(this.village.info.visible){
            this.draw_bbox(this.village.info.bbox, 'rgba(0, 0, 0, 0.5)', this.village.resources_list())
        }

        if(true){
            var tmp = this.ctx.lineWidth
            this.ctx.lineWidth = 4
            this.ctx.beginPath()
            this.ctx.rect(0, 0, this.width, this.height)
            this.ctx.stroke()
            this.ctx.lineWidth = tmp
        }

        window.requestAnimationFrame(this.draw.bind(this))
    }
}

class ChopWoodTask{
    constructor(agent, game){
        this.finished = false
        this.game = game
        this.cur_phase = 0
        this.wood = 0

        this.tree = random_choice(this.game.trees)
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
            this.tree = random_choice(this.game.trees)
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

class Agent {
    constructor(bbox){
        this.spid = 1
        this.bbox = bbox
        this.speed = 0.1
    }

}
Agent.image_name = 'res/char.png';

class Tree {
    
    constructor(bbox, spid){
        this.spid = spid
        this.bbox = bbox
        this.wood = 4 // random(0, 100)
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

class UIBox {
    constructor(bbox, text) {
        this.visible = false
        this.bbox = bbox
        this.text = text
    }
}

function main() {
    game = new Game()
    game.start()
}

main()