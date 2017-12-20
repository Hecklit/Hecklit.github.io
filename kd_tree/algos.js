function ConstructBalanced2DTree(l, r, k, vertical, X, Y) {
    if(l <= r) {
        const m = Math.floor((l+r)/2);
        if(vertical) {
            k.set_value(Y[m]);
            const newX1 = [];
            const newX2 = [];
            for (let i = l; i < r+1; i++) {
                const xi = X[i];
                if(xi.y < Y[m].y) {
                    newX1.push(xi);
                }
                if(xi.y > Y[m].y) {
                    newX2.push(xi);
                }
            }
            let newX = newX1.concat([Y[m]], newX2);
            X.splice(l, newX.length, ...newX);
        } else {
            k.set_value(X[m]);
            const newY1 = [];
            const newY2 = [];
            for (let i = l; i < r+1; i++) {
                const yi = Y[i];
                if(yi.x < X[m].x) {
                    newY1.push(yi);
                }
                if(yi.x > X[m].x) {
                    newY2.push(yi);
                }
            }
            let newY = newY1.concat([X[m]], newY2);
            Y.splice(l, newY.length, ...newY);
            //draw_line(X[m].x, 0, X[m].x, height, ctx);
        }
        ConstructBalanced2DTree(l, m-1, k.left, !vertical, X, Y);
        ConstructBalanced2DTree(m+1, r, k.right, !vertical, X, Y);
    }
}

function rangeSearch(k, d, D, output = []) {
    let l, r, coord, dNew;
    if (k && k.value !== null) {
        if(d == 'vertical') {
            l = D.y1;
            r = D.y2;
            coord = k.value.y
            dNew = 'horizontal';
        }else{
            l = D.x1;
            r = D.x2;
            coord = k.value.x
            dNew = 'vertical';
        }
        const v = k.value;
        if(D.x1 <= v.x && v.x <= D.x2 && D.y1 <= v.y && v.y <= D.y2 ) {
            output.push(k);
        }
        if(l < coord) {
            output = output.concat(rangeSearch(k.left, dNew, D));
        }
        if(r > coord) {
            output = output.concat(rangeSearch(k.right, dNew, D));
        }
    }
    return output;
}

function PartitionField(P, l, r, m) {
    console.log('Partition Field')
    console.log(P, l, r, m);
}

class Node {
    constructor(level=0, parent){
        this.value = null;
        this.left = null;
        this.right = null;
        this.level = level;
        this.parent = parent;
        this.vertical = level % 2 === 0;
    }

    set_value(val) {
        this.value = val;
        this.left = new Node(this.level+1, this);
        this.right = new Node(this.level+1, this);
    }

    as_layer_array(res = []) {
        if(this.value === null) {
            return [];
        }
        if(this.level > res.length-1) {
            res.push([]);
        }
        res[this.level].push(this);
        this.left.as_layer_array(res)
        this.right.as_layer_array(res)
        return res;
    }

    find_bounding_grandpa() {
        let dir = 0;
        if(!this.parent || !this.parent.parent) {
            return {
                grandpa: null,
                dir: dir
            };
        }
        let grandgrandpa = null;
        let cur_pa = this.parent.parent;
        let x_dir = this.value.x - this.parent.value.x;
        let y_dir = this.value.y - this.parent.value.y;
        while(cur_pa) {
            if(this.parent.vertical !== cur_pa.vertical) {
                cur_pa = cur_pa.parent;
                continue;
            }
            let cur_pa_x_dir = this.value.x - cur_pa.value.x;
            let cur_pa_y_dir = this.value.y - cur_pa.value.y;
            if(!cur_pa.vertical && (x_dir) * (cur_pa_x_dir) < 0) {
                grandgrandpa = cur_pa;
                dir = x_dir;
                break;
            }
            if(cur_pa.vertical && (y_dir) * (cur_pa_y_dir) < 0) {
                grandgrandpa = cur_pa;
                dir = y_dir;
                break;
            }
            cur_pa = cur_pa.parent;
        }
        return {
            grandpa: grandgrandpa,
            dir: dir
        };
    }
}