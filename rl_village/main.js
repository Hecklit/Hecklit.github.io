class Game {

    constructor() {
        this.can = document.getElementById('can');
        this.ctx = can.getContext('2d');
        this.width = can.width = window.innerWidth - 10;
        this.height = can.height = window.innerHeight * 0.9;
        this.can_rect = can.getBoundingClientRect();
        this.center = new v2(this.width / 2, this.height / 2);
        this.can.onclick = this.on_mouse_move.bind(this)
        this.fps = 0
        this.ts = 0
        this.ctx.font = "20px Georgia";

        // create the world
        this.village = new Village(BBox.from_centered_on(this.center, 274 * 0.125, 320 * 0.125))
        this.village.inv.add('Ore', 50)
        this.village.inv.add('Wood', 20)

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

        this.ore_deposits = []
        for (let i = 0; i < 10; i++) {
            const spread = 0
            const margin = 10
            const pos = new v2(
                random_in_interval(spread + margin, this.width - spread - margin),
                random_in_interval(spread + margin, this.width - spread - margin))
            const ore_deposit = new OreDeposit(
                BBox.from_centered_on(pos,
                    200 *(0.17)*1.4,
                    107 *(0.23)*1.4, 2+random_int(5)))
            this.ore_deposits.push(ore_deposit)    
        }

        this.forges = []
        for (let i = 0; i < 1; i++) {
            const spread = 0
            const margin = 10
            const pos = new v2(this.center.x - 200, this.center.y -200)
            const forge = new Forge(
                BBox.from_centered_on(pos,
                    143 *(0.18),
                    257 *(0.18), 2+random_int(5)))
            this.forges.push(forge)    
        }

        this.agents = []
        for (let i = 0; i <10; i++) {
            const pos = new v2(Math.random()*this.width, Math.random()*this.height)
            const agent = new Agent((BBox.from_centered_on(pos, 142*0.05, 312*0.05)));
            this.agents.push(agent)
        }

        for (const agent of this.agents) {
            const task = new ChopWoodTask(agent, this, agent.choose_task.bind(agent))
            agent.add_task(task)
        }
        for (const agent of this.agents) {
            const tree = random_choice(this.trees)
            const task = new MineOreTask(agent, this, agent.choose_task.bind(agent))
            agent.add_task(task)
        }
        for (const agent of this.agents) {
            const tree = random_choice(this.trees)
            const task = new ForgeWeaponTask(agent, this, agent.choose_task.bind(agent))
            agent.add_task(task)
        }
        this.agents[0].inv.info.visible = true
    }

    on_mouse_move(e) {
        //pos on canvas
        const mouse_pos = new v2(e.clientX - this.can_rect.left, e.clientY - this.can_rect.top);
        let ent = [this.village].concat(this.trees, this.agents, this.ore_deposits, this.forges)        
        for(const e of ent){
            if (e.bbox.is_inside(mouse_pos)) {
                if (!e.inv.info.visible) {
                    e.inv.info.visible = true
                }
            } else {
                if (e.inv.info.visible) {
                    e.inv.info.visible = false
                }
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

        // for debug
        if(false){
            this.ctx.beginPath();
            this.ctx.rect(agent.bbox.x,agent.bbox.y, agent.bbox.w, agent.bbox.h)
            this.ctx.stroke()
        }
    }

    draw_Item(agent, rx, ry, item) {
        const w = this.sprites[item].width
        const h = this.sprites[item].height
        const bot = agent.bbox.bottom_center()
        const scale = 0.2
        this.ctx.drawImage(this.sprites[item], 0, 0, w, h,
            bot.x - w*scale/2 +rx, bot.y - h*scale + ry, w*scale, h*scale);

        // for debug
        if(false){
            this.ctx.beginPath();
            this.ctx.rect(bot.x - w*scale/2 +rx, bot.y - h*scale + ry, w*scale, h*scale)
            this.ctx.stroke()
        }
    }

    draw_bbox(bbox, color, text) {
        this.ctx.fillStyle = color
        const box_height = (text.length != 0) ? 34 * text.length : 34
        this.ctx.fillRect(bbox.x, bbox.y + box_height/2, bbox.w, box_height)
        this.ctx.fillStyle = 'white'
        const xof = 10
        const yof = 26
        let i = 0
        const line_height = box_height / text.length
        for (const t of text) {
            this.ctx.fillText(t, bbox.x + xof, bbox.y + box_height/2 + yof + i * line_height, bbox.w - xof);
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
        // load all inv
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
            this.load_sprite_sheet(OreDeposit.image_name, [[0, 0, 232, 170]]),
            this.load_sprite_sheet(Forge.image_name, [[0, 0, 143, 257]]),
            this.load_sprite_sheet('res/carry_ss.png', [
                [0, 0, 72, 59],
                [72, 0, 72, 59],
                [2*72, 0, 72, 59],
                [3*72, 0, 72, 59],
                [4*72, 0, 72, 59],
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
        print('loaded all assets')
        this.t0 = window.performance.now()
        this.draw()
    }

    draw() {
        // update
        const td = window.performance.now() - this.t0
        this.t0 = window.performance.now()

        if(this.ts % 1000 == 0){
            // get new jobs
            print('choose a new job')
            for (const agent of this.agents) {
                agent.choose_task()
            } 
        }

        for (const agent of this.agents) {
            agent.update(td)
        }
        this.fps += 0.1 * (1000/(td + 0.01) - this.fps) 

        // draw

        this.clear()
        // z ordering
        let ent = [this.village].concat(this.trees, this.agents, this.ore_deposits, this.forges)
        // ent = ent.sort((a, b) => a.bbox.y-a.bbox.h - b.bbox.y-b.bbox.h)
        for (const e of ent) {
            if(e instanceof Agent){
                this.draw_Image(e)
                var res = e.inv.get_max_key()
                const keys = Object.keys(e.inv.res);
                var i = keys.indexOf(res)
                if(i == -1){

                }else{
                    this.draw_Item(e, 0, 0, 9 + i)
                }
            }else{
                this.draw_Image(e)
            }
        }

        // ui always last
        for (const e of ent) {
            if(e.inv.info.visible){
                if(e instanceof Agent){
                    const info_list = e.inv.inv_list()
                    info_list.unshift(`${(e.cur_task.constructor.name)}: ${e.cur_task.cur_phase}`)
                    e.inv.info.bbox.set(e.bbox.x, e.bbox.y)
                    this.draw_bbox(e.inv.info.bbox, 'rgba(0, 0, 0, 0.5)', info_list)
                }else{
                    this.draw_bbox(e.inv.info.bbox, 'rgba(0, 0, 0, 0.5)', e.inv.inv_list())
                }
            }
        }

        this.ctx.fillStyle = 'white'
        this.ctx.fillText(`${(this.fps).toFixed(0)} FPS`, 10, 30)

        if(true){
            var tmp = this.ctx.lineWidth
            this.ctx.lineWidth = 4
            this.ctx.beginPath()
            this.ctx.rect(0, 0, this.width, this.height)
            this.ctx.stroke()
            this.ctx.lineWidth = tmp
        }

        this.ts += 1
        // print(this.village.inv.inv_list(true))
        window.requestAnimationFrame(this.draw.bind(this))
    }
}

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

window.onload = (e) => {
    print('start')
    main()
}