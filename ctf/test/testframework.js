const print = console.log

function test_case(name, func){
    add_entry(name, func())
}

function init(){
    const body = document.getElementsByTagName('body')[0]
    print(body)
    const div = document.createElement('div')
    div.id = 'res'
    body.appendChild(div)
}

function add_entry(name, state){
    var node = document.createElement("div");                 // Create a <li> node
    var textnode = document.createTextNode(`${name}: ${state}`);         // Create a text node
    node.appendChild(textnode);                              // Append the text to <li>
    document.getElementById("res").appendChild(node); 
}

function assert_type(obj, str) {
    if(obj instanceof str){
        return true
    }else{
        throw new Error(`${obj} is not type ${str}`)
    }
}

function assert_equal(one, two) {
    if(one === two){
        return true
    }else{
        throw new Error(`${one} is not ${two}`)
    }
}