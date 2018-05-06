class GridWorld {
    constructor(w, h) {
        this.w = w
        this.h = h
        this.current_state = {x:0, y:2}
        this.all_states = null
    }

    get_all_states() {
        if(this.all_states === null) {
            this.all_states = []
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    this.all_states.push({x, y})
                }
            }
        }
        return this.all_states;
    }

    get_current_state() {
        return this.current_state;
    }

    try_to_move(x, y) {
        let idx = 
    }

    move(action) {
        switch(action) {
            case 'U':
            break;
            case 'D':
            break;
            case 'L':
            break;
            case 'R':
            break;
        }
    }
}