let can = document.getElementById('can')
let ctx = can.getContext('2d')
let canRect = can.getBoundingClientRect();
let mouseDown = false

const width = can.width = window.innerWidth * 0.999
const height = can.height = window.innerHeight * 0.9

let button_sel = undefined
let tile_type_sel = 0
let play = false
let my_request = undefined

let im_reward = 0
let total_reward = 0
let step = 0

const buttons = {
    'floor': new CanButton(10, 10, 100, 100, 'gray', () => {
        button_sel = 'floor'
        tile_type_sel = 0
        draw()
    }),
    'wall': new CanButton(110, 10, 100, 100, 'darkgray', () => {
        button_sel = 'wall'
        tile_type_sel = 1
        draw()
    }),
    'water': new CanButton(210, 10, 100, 100, 'blue', () => {
        button_sel = 'water'
        tile_type_sel = 2
        draw()
    }),
    'food': new CanButton(310, 10, 100, 100, 'orange', () => {
        button_sel = 'food'
        tile_type_sel = 3
        draw()
    }),
    'goal': new CanButton(410, 10, 100, 100, 'green', () => {
        button_sel = 'goal'
        tile_type_sel = 4
        draw()
    }),
}

window.onresize = (e) => {
    canRect = can.getBoundingClientRect();
};

can.onmousedown = (e) => {
    if(e.button === 2) {
    }
    mouseDown = true;
    const newPoint = new v2(e.clientX-canRect.left, e.clientY-canRect.top);
    set_field(newPoint)
}

can.onmouseup = (e) => {
    if(e.button === 2) {
    }
    mouseDown = false;
    const newPoint = new v2(e.clientX-canRect.left, e.clientY-canRect.top);
    for (const key in buttons) {
        if (buttons.hasOwnProperty(key)) {
            const button = buttons[key];
            if (button.is_inside(newPoint.x, newPoint.y)){
                button.trigger()
            }
        }
    }
}

can.onmousemove = (e) => {
    if(mouseDown) {
        const newPoint = new v2(e.clientX-canRect.left, e.clientY-canRect.top);
        set_field(newPoint)
    }
}

function set_field(pos) {
    try {
        const {indx, indy} = world.screen_to_cell(pos.x, pos.y)
        if(indx >= world.w){
            return
        }
        world.grid[indy][indx] = tile_type_sel
        draw()
    } catch (error) {
        //console.log(error)
    }
}

function draw() {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, width, height)
    world.draw(ctx, 10, 150, 50, player, q)

    // draw UI
    for (const key in buttons) {
        if (buttons.hasOwnProperty(key)) {
            const button = buttons[key];
            if (key === button_sel) {
                button.outline_color = 'white'
            }else{
                button.outline_color = 'black'
            }
            button.draw(ctx)
        }
    }

    ctx.fillStyle = 'white'
    old_font = ctx.font
    ctx.font = '20px serif';
    ctx.fillText(`Step: ${step}`, 600, 40)
    ctx.fillText(`Total reward: ${total_reward}`, 600, 60)
    ctx.fillText(`Immediate reward ${im_reward}`, 600, 80)
    ctx.font = old_font

}

function canvas_arrow(ctx, fromx, fromy, tox, toy, head){
    ctx.beginPath()
    var headlen = 10;   // length of head in pixels
    var angle = Math.atan2(toy-fromy,tox-fromx);
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    
    if(head){
        ctx.moveTo(tox, toy)
        ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
        ctx.moveTo(tox, toy);
        ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
    }
    ctx.stroke()
}

function get_3d_array(h, w, val=0) {
    const res = []
    for (let i = 0; i < h; i++) {
        res.push([])
        for (let j = 0; j < w; j++) {
            res[i].push([])
            for (let k = 0; k < 4; k++) {
                res[i][j].push(val)
            }
        }
    }
    return res
}

function start() {
    // initalize q(s, a) = 0
    for (let i = 0; i < states.length; i++) {
        const state = states[i]
        for (let j = 0; j < actions.length; j++) {
            const action = actions[j];
            set_q(state, action, 0)
            set_e(state, action, 0)
        }
    }

    // load pretrained q
    if(false){
        q = q_trained // from data.js
    }
    
}

function choose_action(next_state){
    // choose a' from s' using policy derived from q (e.g. epsilon greedy)
    if (Math.random() <= epsilon){
        // choose random action
        console.log('Choosen randomly ')
        return actions[Math.floor(Math.random()*actions.length)];
    }else{
        // get action with max q value
        let max_value = Number.NEGATIVE_INFINITY
        let max_ind = undefined
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];
            const q_val = get_q(next_state, action)
            if(q_val > max_value){
                max_value = q_val
                max_ind = i
            }
        }
        console.log('Max action', actions[max_ind])
        return actions[max_ind]
    }
}

function get_q(state, action) {
    return q[state.y][state.x][actions.indexOf(action)]
}

function set_q(state, action, val) {
    q[state.y][state.x][actions.indexOf(action)] = val
}

function get_e(state, action) {
    return e[state.y][state.x][actions.indexOf(action)]
}

function set_e(state, action, val) {
    e[state.y][state.x][actions.indexOf(action)] = val
}

window.onkeydown = (e) => {
    // Leertaste
    console.log(e.keyCode)
    if (e.keyCode === 32) {
        if(play){
            play = false
            window.cancelAnimationFrame(my_request)
            console.log('stop')
        }else{
            play = true
            my_request = requestAnimationFrame(sarsa_step)
            console.log('start')
        }
    }
    if (e.keyCode === 84) { // T
        // teleport player back
        player = {x:0, y:0}
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function sarsa_step() {
    const {reward, next_state} = world.take_action(player, action)
    let next_action = choose_action(next_state)
    // maybe the braces should not got that far
    let value = reward + gamma * (get_q(next_state, next_action) - get_q(player, action))
    set_e(player, action, get_e(player, action) + 1)
    for (let i = 0; i < states.length; i++) {
        const state_i = states[i]
        for (let j = 0; j < actions.length; j++) {
            const action_j = actions[j];
            set_q(state_i, action_j, get_q(state_i, action_j) + alpha * value * get_e(state_i, action_j))
            set_e(state_i, action_j, gamma * lambda * get_e(state_i, action_j))
        }
    }
    player = next_state
    action = next_action

    // update ui
    step += 1
    im_reward = reward
    total_reward += reward
    draw()
    await sleep(100);
    if(play){
        my_request = requestAnimationFrame(sarsa_step)
    }
}

const world = new GridWorld(5, 5)
const states = world.states()
const actions = world.actions()
let q = get_3d_array(world.h, world.w)
const e = get_3d_array(world.h, world.w)
let player = {
    'x': 0,
    'y': 0,
}
const epsilon = 0.2 // exploration 
const gamma = 0.9
const alpha = 0.5
const lambda = 0.6
let action = 'd'
start()
draw()