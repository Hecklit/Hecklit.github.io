function export_map() {
    console.log(JSON.stringify(world.grid))
}

class GridWorld{
    constructor(w, h){
        this.floor_color = ['gray', 'darkgray', 'blue', 'orange', 'green']
        this.grid = []
        this.w = w
        this.h = h
        for (let y = 0; y < h; y++) {
            this.grid.push([])
            for (let x = 0; x < w; x++) {
                this.grid[y].push(0)
            }
        }
        // load default map
        if (false) {
            this.grid = default_map // from data.js
        }
        // these will be set only after one draw call
        this.sx = undefined
        this.sy = undefined
        this.s = undefined
    }

    draw(ctx, sx, sy, s, player, q){
        this.sx = sx
        this.sy = sy
        this.s = s
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                let color = this.floor_color[this.grid[y][x]]
                ctx.fillStyle = color
                ctx.strokeStyle = 'black'
                ctx.fillRect(sx + x*s, sy + y*s, s, s)
                ctx.strokeRect(sx + x*s, sy + y*s, s, s)

                let cx = sx + x*s + s/2
                let cy =  sy + y*s + s/2

                // draw player
                if(x === player.x && y === player.y){
                    ctx.fillStyle = 'red'
                    ctx.strokeStyle = 'white'
                    ctx.beginPath()
                    ctx.ellipse(cx, cy, 0.8*s/2, 0.8*s/2, 45 * Math.PI/180, 0, 2 * Math.PI);
                    ctx.fill()
                    ctx.stroke()
                }

                // skip if its not effected
                if(
                    get_e({x, y}, 'u') === 0 &&
                    get_e({x, y}, 'd') === 0 &&
                    get_e({x, y}, 'l') === 0 &&
                    get_e({x, y}, 'r') === 0
                ){
                    continue
                }

                // draw q values
                let qu = get_q({x, y}, 'u')
                let qd = get_q({x, y}, 'd')
                let ql = get_q({x, y}, 'l')
                let qr = get_q({x, y}, 'r')
                const total_q = qu + qd + ql + qr
                // ctx.fillStyle = 'white'
                // ctx.fillText(`${qu.toFixed(1)}`, cx, cy - 0.5*s/2); 
                // ctx.fillText(`${qd.toFixed(1)}`, cx, cy + 0.5*s/2); 
                // ctx.fillText(`${ql.toFixed(1)}`, cx - 0.8*s/2, cy); 
                // ctx.fillText(`${qr.toFixed(1)}`, cx + 0.2*s/2, cy); 

                qu = (total_q === 0)? 0.25 : qu/total_q
                qd = (total_q === 0)? 0.25 : qd/total_q
                ql = (total_q === 0)? 0.25 : ql/total_q
                qr = (total_q === 0)? 0.25 : qr/total_q

                // only show max
                const max_q = Math.max(qu, qd, ql, qr)

                ctx.lineWidth = 2
                ctx.strokeStyle = `rgba(0,0,0,${qu})`
                canvas_arrow(ctx, cx, cy, cx, cy - 0.8*s/2, max_q === qu)
                ctx.strokeStyle = `rgba(0,0,0,${qd})`
                canvas_arrow(ctx, cx, cy, cx, cy + 0.8*s/2, max_q === qd)
                ctx.strokeStyle = `rgba(0,0,0,${ql})`
                canvas_arrow(ctx, cx, cy, cx - 0.8*s/2, cy, max_q === ql)
                ctx.strokeStyle = `rgba(0,0,0,${qr})`
                canvas_arrow(ctx, cx, cy, cx + 0.8*s/2, cy, max_q === qr)

                ctx.lineWidth = 1
            }
        }
    }

    screen_to_cell(sx, sy){
        let indx = Math.floor((sx-this.sx)/this.s)
        let indy = Math.floor((sy-this.sy)/this.s)
        return {indx, indy}
    }

    states(){
        const states = []
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                states.push({x, y})
            }
        }
        return states
    }

    actions(){
        return ['u', 'd', 'l', 'r']
    }

    take_action(pl, action){
        let reward = 0
        let next_state = Object.assign({}, pl);
        let cur_state = this.grid[pl.y][pl.x]

        switch(cur_state){
            case 0: // floor
                reward = -1
                break
            case 1: // wall
                reward = -100000 // should never happen
                break
            case 2: // water
                reward = -3
                break
            case 3: // food
                reward = 2
                break
            case 4: // goal
                reward = 100
                break
        }

        switch(action){
            case 'u': // up
                if(pl.y - 1 >= 0){
                    if(this.grid[pl.y - 1][pl.x] !== 1){
                        next_state.y -= 1
                    }
                }
                break
            case 'd': // down
                if(pl.y + 1 < this.h){
                    if(this.grid[pl.y + 1][pl.x] !== 1){
                        next_state.y += 1
                    }
                }
                break
            case 'l': // left
                if(pl.x - 1 >= 0){
                    if(this.grid[pl.y][pl.x -1] !== 1){
                        next_state.x -= 1
                    }
                }
                break
            case 'r': // right
                if(pl.x + 1 < this.w){
                    if(this.grid[pl.y][pl.x + 1] !== 1){
                        next_state.x += 1
                    }
                }
                break
        
        }

        return {
            reward,
            next_state
        }
    }
}