const first = document.getElementById('first');
const second = document.getElementById('second');
Array.prototype.sample = function(){
    return this[Math.floor(Math.random()*this.length)];
}

const verbs = [
    "lick",
    "kiss",
    "rub",
    "caress",
    "slap",
    "slap",
];

const bodyParts = [
    "neck",
    "butt",
    "lips",
    "ears",
    "nipples",
    "breasts",
    "sides",
    "genitals",
    "upper thigh",
    "lower thigh",
    "feet",
    "back",
    "belly",
    "bellybutton",
    "eyes",
    "nose",
    "hair",
    "cheek",
]

function onClick() {
    first.innerHTML = verbs.sample();
    second.innerHTML = bodyParts.sample();
}