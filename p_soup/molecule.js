const max_health = 500;
let molecule_count = 1;

class Molecule {
    constructor(pos, angle, r) {
        this.name = rand_element(names)
        this.pos = pos;
        this.angle = angle;
        this.r = r;
        const angleInRad = (angle * 2 * Math.PI) / 360;
        this.dir = new v2(Math.cos(angleInRad), Math.sin(angleInRad));
        this.health = max_health;
        this.alive = true;
        this.generate_weights();
        this.cd = 5;
        this.score = 0;
        this.atom = rand_element(atoms);
        this.color = atomToColor(this.atom);
        this.external_force = new v2(0, 0);

        // new stuff
        //
        // if (this.atom === "ice") {
        //     this.attachmentPoints = [
        //         new AttachementPoint(0, AttachementPoint.createAffinities({
        //             "ice": -0.01,
        //             "fire": -0.01,
        //             "water": 0.01,
        //         })),
        //     ];
        // } else if (this.atom === "fire") {
        //     this.attachmentPoints = [
        //         new AttachementPoint(0, AttachementPoint.createAffinities({
        //             "ice": 0.01,
        //             "fire": -0.01,
        //             "water": 0.01,
        //         })),
        //     ];
        // } else if (this.atom === "water") {
        //     this.attachmentPoints = [
        //         new AttachementPoint(0, AttachementPoint.createAffinities({
        //             "ice": -0.02,
        //             "fire": 0.02,
        //             "water": -0.01,
        //         })),
        //     ];
        // } else if (this.atom === "air") {
        //     this.attachmentPoints = [
        //         new AttachementPoint(0, AttachementPoint.createRandomAffinities(0.001)),
        //     ];
        // } else if (this.atom === "earth") {
        //     this.attachmentPoints = [
        //         new AttachementPoint(45, AttachementPoint.createAffinities({
        //             "ice": 0.05,
        //             "fire": -0.01,
        //         })),
        //         new AttachementPoint(120, AttachementPoint.createAffinities({
        //             "fire": -0.01,
        //             "water": 0.05,
        //         })),
        //     ];
        //
        //
        // } else {
        //     const numAttachements = rand_int(0);
        //     this.attachmentPoints = [
        //         new AttachementPoint(0, AttachementPoint.createAffinities()),
        //     ];
        //     for (let i = 0; i < numAttachements; i++) {
        //         this.attachmentPoints.push(
        //             new AttachementPoint((360 / numAttachements) * (i + 1), AttachementPoint.createAffinities()));
        //     }
        // }
        this.attachmentPoints = getAttachmentPointsByAtom(this.atom);

    }


    getAttachementPosition(ap) {
        return this.pos.add(turn_vec(ap.radial_position + this.angle).scale(this.r * 3.5));
    }

    generate_weights() {
        this.w = [];
        for (let i = 0; i < 5; i++) {
            this.w.push([]);
            for (let j = 0; j < 10; j++) {
                this.w[i].push(Math.random());
            }
        }
    }

    turn(d_angle) {
        this.angle = (this.angle + d_angle) % 360;
        const angleInRad = (this.angle * 2 * Math.PI) / 360;
        this.dir = new v2(Math.cos(angleInRad), Math.sin(angleInRad));
    }

    deal_dmg(dmg) {
        this.health -= dmg;
        this.health = Math.min(this.health, max_health)
        if (this.health <= 0) {
            this.alive = false;
        }
    }
}

class AttachementPoint {
    constructor(radial_position, affinity) {
        this.radial_position = radial_position;
        this.affinity = affinity
    }

    getAttachementColor() {
        let new_color = new v3(0, 0, 0);

        for (const [atom, modifier] of Object.entries(this.affinity)) {
            new_color = new_color.add(new v3(...atomToColor(atom)).scale(modifier))
        }

        new_color = new_color.div(Object.entries(this.affinity).length);
        return new_color
    }

    static createRandomAffinities(range = 2) {
        return atoms.reduce((acc, cur) => {
            acc[cur] = Math.random() * range + (-range/2);
            return acc;
        }, {});
    }

    static createAffinities(config = {}) {
        return atoms.reduce((acc, cur) => {
            if (config.hasOwnProperty(cur)) {
                acc[cur] = config[cur];
            } else {
                acc[cur] = 0;
            }
            return acc;
        }, {});
    }
}

const atoms = [
    "earth",
    "fire",
    "water",
    "air",
    "dust",
    "ice",
];

const atomToColor = (atom) => [
    [150, 75, 0], // earth
    [255, 0, 0], // fire
    [0, 0, 255], // water
    [150, 150, 255], // air
    [200, 200, 200], // dust
    [224, 247, 250], // ice
][atoms.indexOf(atom)];

const attachmentPointByAtom = atoms.reduce((acc, cur) => {
    const numAttachements = rand_int(5);
    const aps = [
        new AttachementPoint(0, AttachementPoint.createRandomAffinities(0.1)),
    ];
    for (let i = 0; i < numAttachements; i++) {
        aps.push(
            new AttachementPoint((360 / numAttachements) * (i + 1), AttachementPoint.createRandomAffinities(0.1)));
    }
    acc[cur] = aps;
    return acc;
}, {});

const getAttachmentPointsByAtom = (atom) => attachmentPointByAtom[atom];

const names = [
    'Bonnie',
    'Carmen',
    'Alexander',
    'Kiesha',
    'Tajuana',
    'Valorie',
    'Blanca',
    'Magaret',
    'Jorge',
    'Rosalee',
    'Twanda',
    'Kenna',
    'Marylynn',
    'Erlene',
    'Jean',
    'Alisia',
    'Tena',
    'Ethan',
    'Reginald',
    'Kina',
    'Juan',
    'Edmond',
    'Kip',
    'Monserrate',
    'Rosella',
    'Kareen',
    'Alethea',
    'Hester',
    'Torri',
    'Lindsay',
    'Cris',
    'Celestine',
    'Madie',
    'Juliet',
    'Marlys',
    'Joey',
    'Emory',
    'Christia',
    'Wynona',
    'Maragaret',
    'Tresa',
    'Teisha',
    'Theodore',
    'Ozie',
    'Ginger',
    'Dallas',
    'Synthia',
    'Marry',
    'Mallie',
    'Marta',
]