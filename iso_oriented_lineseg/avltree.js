class Node {
    constructor(key) {
        this.left = null;
        this.right = null;
        this.key = key;
    }

    toString() {
        return `${this.key}`
    }
}

class AVLTree {

    constructor() {
        this.node = null;
        this.height = -1;
        this.balance = 0;
    }

    insert(key) {
        const n = new Node(key);

        if(this.node === null) {
            this.node = n;
            this.node.left = new AVLTree();
            this.node.right = new AVLTree();
        } else if(key < this.node.key) {
            this.node.left.insert(key);
        } else if(key > this.node.key) {
            this.node.right.insert(key);
        }

        this.rebalance();
    }

    rebalance() {
        this.update_heights(false); // recursive
        this.update_balances(false);

        while(this.balance < -1 || this.balance > 1) {
            if(this.balance > 1) {
                if(this.node.left.balance < 0) {
                    this.node.left.rotate_left()
                    this.update_heights();
                    this.update_balances();
                }
                this.rotate_right()
                this.update_heights()
                this.update_balances()
            }
            if(this.balance < -1) {
                if(this.node.right.balance > 0) {
                    this.node.right.rotate_right()
                    this.update_heights()
                    this.update_balances()
                }
                this.rotate_left()
                this.update_heights()
                this.update_balances()
            }
        }
    }

    update_heights(recursive) {
        if(this.node !== null) {
            if(recursive) {
                if(this.node.left !== null) {
                    this.node.left.update_heights()
                }
                if(this.node.right !== null) {
                    this.node.right.update_heights()
                }
            }

            this.height = 1 + Math.max(this.node.left.height, this.node.right.height);
        }else {
            this.height = -1;
        }
    }

    update_balances(recursive) {
        if(this.node !== null) {
            if(recursive) {
                if(this.node.left !== null) {
                    this.node.left.update_balances()
                }
                if(this.node.right !== null) {
                    this.node.right.update_balances()
                }
            }

            this.balance = this.node.left.height - this.node.right.height;
        }else {
            this.height = 0;
        }
    }
    
    rotate_right() {
        const new_root = this.node.left.node;
        const new_left_sub = new_root.right.node;
        const old_root = this.node;

        this.node = new_root
        old_root.left.node = new_left_sub
        new_root.right.node = old_root
    }

    rotate_left(){
        const new_root = this.node.right.node
        const new_left_sub = new_root.left.node
        const old_root = this.node

        this.node = new_root
        old_root.right.node = new_left_sub
        new_root.left.node = old_root
    }

    delete(key) {
        if(this.node !== null) {
            if(this.node.key === key) {
                if(this.node.left.node === null && this.node.right.node === null) {
                    this.node = null;
                }else if(this.node.left.node === null) {
                    this.node = this.node.right.node;
                }else if(this.node.right.node === null) {
                    this.node = this.node.left.node;
                }else{
                    let successor = this.node.right.node;
                    while(successor !== null && successor.left.node !== null) {
                        successor = successor.left.node;
                    }

                    if(successor !== null) {
                        this.node.key = successor.key;

                        this.node.right.delete(successor.key)
                    }
                }
            }else if(key < this.node.key) {
                this.node.left.delete(key);
            }else if(key > this.node.key) {
                this.node.right.delete(key);
            }

            this.rebalance();
        }
    }

    inorder_traverse() {
        const result = [];

        if(this.node === null) {
            return result;
        }

        result.push.apply(result, this.node.left.inorder_traverse());
        result.push(this.node.key);
        result.push.apply(result, this.node.right.inorder_traverse());
        return result;
    }

    display(node=null, level=0) {
        if(node === null) {
            node = this.node;
        }

        if(node.right.node !== null) {
            this.display(node.right.node, level + 1);
            console.log('\t' * level, '    /')
        }

        console.log('\t' * level, node.toString())

        if(node.left.node !== null) {
            console.log('\t' * level, '    \\')
            this.display(node.left.node, level + 1)
        }
    }
}

const tree = new AVLTree()
const data = [1, 2, 3, 4, 5, 6, 7, 8, 9]

console.log('Inserting data', data);
for(key in data){ 
    tree.insert(data[key])
}
console.log(tree.inorder_traverse());
tree.display()

console.log('Deleting 1,3');
for(key in [1,3]) {
    tree.delete(key)
}
console.log(tree.inorder_traverse());

console.log('Inserting, 3,1');
for(key in [3,1]) {
    tree.insert(key)
} 
console.log(tree.inorder_traverse());