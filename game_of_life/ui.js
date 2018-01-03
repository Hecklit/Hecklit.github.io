class ScrollWidget{
    constructor(box, color) {
        this.box = box;
        this.children = [];
        this.color = color;
    }

    draw(ctx) {
        this.box.fill(ctx, this.color)
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            
        }
    }
}

class Figure{
    constructor(img_path, w, h){
        this.image = new Image(w, h);
        this.image.src = img_path;
        console.log(this.image);
    }
}