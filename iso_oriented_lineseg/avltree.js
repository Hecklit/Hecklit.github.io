class Node {
    constructor(key) {
        this.left = null;
        this.right = null;
        this.key = key;
        this.sibling_left = null;
        this.sibling_right = null;
    }

    toString() {
        const left = (this.sibling_left)? this.sibling_left.key : null;
        const right = (this.sibling_right)? this.sibling_right.key : null;
        return `(${right})\n  ${this.key}\n(${left})`
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
        this.resibling();
    }

    resibling() {
        const inOrderNodes = this.inorder_traverse(true);
        for (let i = 0; i < inOrderNodes.length; i++) {
            const node = inOrderNodes[i];
            if(i === 0 && i === inOrderNodes.length-1) {
                node.sibling_left = null;
                node.sibling_right = null;
            }else if(i === 0) {
                node.sibling_left = null;
                node.sibling_right = inOrderNodes[i+1]
            }else if(i === inOrderNodes.length-1) {
                node.sibling_left = inOrderNodes[i-1];
                node.sibling_right = null;
            }else {
                node.sibling_left = inOrderNodes[i-1]
                node.sibling_right = inOrderNodes[i+1]
            }
        }
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

    update_heights(recursive=true) {
        if(this.node) {
            if(recursive) {
                if(this.node.left) {
                    this.node.left.update_heights()
                }
                if(this.node.right) {
                    this.node.right.update_heights()
                }
            }

            this.height = 1 + Math.max(this.node.left.height, this.node.right.height);
        }else {
            this.height = -1;
        }
    }

    update_balances(recursive=true) {
        if(this.node) {
            if(recursive) {
                if(this.node.left) {
                    this.node.left.update_balances()
                }
                if(this.node.right) {
                    this.node.right.update_balances()
                }
            }

            this.balance = this.node.left.height - this.node.right.height;
        }else {
            this.balance = 0;
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
        if(this.node) {
            if(this.node.key === key) {
                if(!this.node.left.node && !this.node.right.node) {
                    this.node = null;
                }else if(!this.node.left.node) {
                    this.node = this.node.right.node;
                }else if(!this.node.right.node) {
                    this.node = this.node.left.node;
                }else{
                    let successor = this.node.right.node;
                    while(successor && successor.left.node) {
                        successor = successor.left.node;
                    }

                    if(successor) {
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
            this.resibling();
        }
    }

    inorder_traverse(returnNodes = false) {
        const result = [];

        if(!this.node) {
            return result;
        }

        result.push.apply(result, this.node.left.inorder_traverse(returnNodes));
        if(returnNodes) {
            result.push(this.node);
        }else{
            result.push(this.node.key);
        }
        result.push.apply(result, this.node.right.inorder_traverse(returnNodes));
        return result;
    }

    rangeQuery(min, max){
        let current = this.node;
        let prev = null;
        while(current){
              //go to left tree
              if(current.key  > min){
                prev = current;
                current = current.left.node;
              }//else go to right tree
              else if(current.key < min){
                prev = current;          
                current = current.right.node;
              }else {
                // its exactly at this point
                prev = current;
                current = null;
              }

        }
        const results = [];
        if(prev !== null) {
            while(prev.key >= min && prev.key <= max) {
                results.push(prev.key);
                if(prev.sibling_right) {
                    prev = prev.sibling_right;
                }else{
                    break;
                }
            }
        }
        return results;
     }

    display(node=null, level=0) {
        if(!node) {
            node = this.node;
            if(!node) {
                return;
            }
        }
        let spacer = ''
        for (let i = 0; i < level; i++) {
            spacer +=  '    ';
        }
        if(node.right.node) {
            this.display(node.right.node, level + 1);
            console.log(spacer, '    /')
        }

        console.log(spacer, node.toString())

        if(node.left.node) {
            console.log(spacer, '    \\')
            this.display(node.left.node, level + 1)
        }
    }
}

// const tree = new AVLTree()
// const data = [4, 5, 6, 8]

// console.log('Inserting data', data);
// for(key in data){ 
//     tree.insert(data[key])
// }
// console.log(tree.inorder_traverse());
// tree.display()

// console.log('Deleting 1,3');
// // tree.delete(1)
// // tree.delete(4)
// // tree.delete(3)
// // tree.delete(5)
// console.log(tree.inorder_traverse());
// tree.display()

// console.log('Inserting, 3,1');
// // tree.insert(1)
// // tree.insert(4)
// console.log(tree.inorder_traverse());
// tree.display()

// console.log('my results:', tree.rangeQuery(10,12))