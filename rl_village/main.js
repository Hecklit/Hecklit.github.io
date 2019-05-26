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
            const pos = new v2(Math.random()*this.width, Math.random()*this.height)
            const tree = new Tree(BBox.from_centered_on(pos, 80, 128))
            this.trees.push(tree)    
        }
    }

    on_mouse_move(e) {
        //pos on canvas
        const mouse_pos = new v2(e.clientX - this.can_rect.left, e.clientY - this.can_rect.top);
        if (this.village.bbox.is_inside(mouse_pos)) {
            if (!this.village.info.visible) {
                this.village.info.visible = true
                this.draw_bbox(this.village.info.bbox, 'rgba(0, 0, 0, 0.5)', this.village.resources_list())
            }
        } else {
            if (this.village.info.visible) {
                this.village.info.visible = false
                this.draw()
            }
        }
    }

    clear() {
        this.ctx.fillStyle = "#4a4f5c";
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    draw_Image(agent) {
        const w = this.sprites[0].width
        const h = this.sprites[0].height
        this.ctx.drawImage(this.sprites[agent.spid], 0, 0, w, h,
            agent.bbox.x, agent.bbox.y, agent.bbox.w, agent.bbox.h);
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
                    // print(bm)
                    // print(image)
                    // print(sprite)
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
        Promise.all([
            this.load_sprite_sheet(Village.image_name, [[0, 0, 274, 320]]),
            this.load_sprite_sheet(Tree.image_name, [
                [0, 0, 80, 128],
            ]),

        ]).then((sprites) => {
            this.sprites = []
            for (const sp of sprites) {
                for (const s of sp) {
                    this.sprites.push(s)
                }
            }
            print(this.sprites)
            this.on_load()
        })

    }

    on_load() {
        this.draw()
    }

    draw() {
        this.clear()
        this.draw_Image(this.village)
        for (const tree of this.trees) {
            this.draw_Image(tree)
        }
    }
}

class Tree {
    
    constructor(bbox){
        this.spid = 1
        this.bbox = bbox
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