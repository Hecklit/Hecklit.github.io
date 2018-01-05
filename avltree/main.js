const can = document.getElementById('can');
let canRect = can.getBoundingClientRect();
const ctx = can.getContext('2d');
const width = can.width = window.innerWidth;
const height = can.height = window.innerHeight;
const center = new v2(width/2, height/2);

const set = document.getElementById('set');

let tree = null;
set.onkeydown = (e) => {
    if(e.keyCode === 13) {
        console.log('Start building Tree');
        vals = set.value.split(',');
        for (let i = 0; i < vals.length; i++) {
            vals[i] = Number(vals[i]);
        }
        console.log(vals)
        // set.value = '';
        tree = new AVLTree();
        for (let i = 0; i < vals.length; i++) {
            tree.insert(vals[i]);
        }

        displayTree(tree);
    }
}

function displayTree(tree) {
    clearScreen();
    if(tree.node !== null) {
        drawNode(tree.node, center.x, 50, 1);
    }
    console.log(tree.inorder_traverse())
}
const xDist = 100;
const dimminisher = .5;
function drawNode(node, x, y, xScale) {
    ctx.font = "30px Arial";
    ctx.fillStyle = '#000';
    ctx.fillText(node.key,x -8,y + 10);
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, 2*Math.PI);
    ctx.stroke();

    if(node.left.node !== null) {
        drawNode(node.left.node, x - xDist* xScale, y + 60, xScale*dimminisher);
    }

    if(node.right.node !== null) {
        drawNode(node.right.node, x + xDist* xScale, y + 60, xScale*dimminisher);
    }
}

function draw() {
    clearScreen();

}

const clearScreen = () => {
    ctx.fillStyle = "#4a4f5c";
    ctx.fillRect(0,0, width, height);
}

can.onmousedown = (e) => {
   
}

can.onmousemove = (e) => {
 
}

can.onmouseup = (e) => {
   
}

function drawLine(sx, sy, ex, ey){
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
}

set.onkeydown({
    keyCode: 13
});