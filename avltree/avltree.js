class Node {
    constructor(key) {
        this.left = null;
        this.right = null;
        this.key = key;
        this.left_successor = null;
        this.right_successor = null;
    }

    toString() {
        const right_successor = (this.right_successor)? this.right_successor.key : null;
        const left_successor = (this.left_successor)? this.left_successor.key : null;
        return `(${right_successor})\n  ${this.key}\n(${left_successor})`
    }
}

class AVLTree {

    constructor() {
        this.node = null;
        this.height = -1;
        this.balance = 0;
    }

    insert(key, smaller=[], bigger=[]) {
        const n = new Node(key);

        if(this.node === null) {
            this.node = n;
            this.node.left = new AVLTree();
            this.node.right = new AVLTree();
            const left_successor = this.findMax(smaller);
            if(left_successor !== undefined) {
                left_successor.right_successor = this.node;
                this.node.left_successor = left_successor;
            }
            const right_successor = this.findMin(bigger)
            if(right_successor !== undefined) {
                right_successor.left_successor = this.node;
                this.node.right_successor = right_successor;
            }
        } else if(key < this.node.key) {
            bigger.push(this.node);
            this.node.left.insert(key, smaller, bigger);
        } else if(key > this.node.key) {
            smaller.push(this.node);
            this.node.right.insert(key, smaller, bigger);
        }
        this.rebalance();
    }


    delete(key, smaller=[], bigger=[]) {
        if(this.node) {
            if(this.node.key === key) {
                // Change successors
                if(this.node.left_successor && this.node.right_successor) {
                    // has both successors
                    this.node.left_successor.right_successor = this.node.right_successor;
                    this.node.right_successor.left_successor = this.node.left_successor;
                }else if(this.node.left_successor) {
                    // has only left successor
                    this.node.left_successor.right_successor = null;
                }else if(this.node.right_successor) {
                    // has only right successor
                    this.node.right_successor.left_successor = null;
                }
                if(!this.node.left.node && !this.node.right.node) {
                    // no child
                    this.node = null;
                }else if(!this.node.left.node) {
                    // one child (right)
                    this.node = this.node.right.node;
                }else if(!this.node.right.node) {
                    // one child (left)
                    this.node = this.node.left.node;
                }else{
                    // two children
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
                bigger.push(this.node);
                this.node.left.delete(key, smaller, bigger);
            }else if(key > this.node.key) {
                smaller.push(this.node);
                this.node.right.delete(key, smaller, bigger);
            }

            this.rebalance();
        }
    }

    findMax(nodeList) {
        let current = nodeList[0]
        for (let i = 1; i < nodeList.length; i++) {
            const element = nodeList[i];
            if(element.key > current.key) {
                current = element;
            }
        }
        return current;
    }

    findMin(nodeList) {
        let current = nodeList[0]
        for (let i = 1; i < nodeList.length; i++) {
            const element = nodeList[i];
            if(element.key < current.key) {
                current = element;
            }
        }
        return current;
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

    findKeyGreaterOrEqual(x) {
        if(this.node === null) return null;
        let p = this.node;
        let q = null;
        while(p !== null && p.key !== x){
            q = p;
            if(x < p.key) {
                p = p.left.node;
            }else{
                p = p.right.node;
            }
        }
        
        if(p !== null) return p;
        if(q === this.node){
            if(q.key >= x){
                return q;
            }else{
                return null;
            }
        }
        if(x < q.key){
            return q;
        }else{
            return q.right_successor;
        }
    }

    rangeQuery(min, max){
        const minInRange = this.findKeyGreaterOrEqual(min);
        if( minInRange === null || minInRange.key > max) return [];
        const results = [minInRange.key];
        let current = minInRange;
        while(current.right_successor !== null && current.right_successor.key <= max) {
            results.push(current.right_successor.key);
            current = current.right_successor;
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
// tree.delete(1)
// tree.delete(4)
// tree.delete(3)
// tree.delete(5)
// console.log(tree.inorder_traverse());
// tree.display()

// console.log('Inserting, 3,1');
// tree.insert(1)
// tree.insert(4)
// tree.insert(15)
// tree.insert(64)
// console.log(tree.inorder_traverse());
// tree.display()


// console.log('my results:', tree.rangeQuery(4,8))
// console.log('my results:', tree.rangeQuery(-10,0))
// console.log('my results:', tree.rangeQuery(7,16))
// console.log('my results:', tree.rangeQuery(120,140))