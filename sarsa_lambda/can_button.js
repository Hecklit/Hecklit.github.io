class CanButton{
    constructor(x, y, w, h, color, onclick){
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.color = color
        this.outline_color = 'black'
        this.onclick = onclick
    }

    draw(ctx){
        ctx.fillStyle = this.color
        ctx.strokeStyle = this.outline_color
        ctx.fillRect(this.x, this.y, this.w, this.h)
        ctx.strokeRect(this.x, this.y, this.w, this.h)
    }

    is_inside(x, y){
        return (
            x >= this.x &&
            y >= this.y &&
            x <= this.x + this.w &&
            y <= this.y + this.h
        )
    }

    trigger(){
        this.onclick()
    }
}