
let Point = function (x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

let Circle = function (x, y, radius) {
    this.x = x || 0;
    this.y = y || 0;
    this.radius = radius || 0;
};

let indices;
let circles;

function compute_delauny(points) {
    let events = [];
    let number_vertices = points.length;
    if (number_vertices < 3) return null;

    if (number_vertices === 3) return {indices: [0, 1, 2], events};

    let large_number = 99999;

    let p0 = new Point(0, -large_number);
    let p1 = new Point(large_number, large_number);
    let p2 = new Point(-large_number, large_number);

    points.push(p0);
    points.push(p1);
    points.push(p2);
    
    indices = [points.length-3, points.length-2, points.length-1];
    events.push({
        type: 'tri',
        desc: 'Add triangle',
        indices: [
            clone(p0),
            clone(p1),
            clone(p2)
        ]
    });
    
    circles = [];
    circles.push(calculate_circumcircle(p0, p1, p2));
    events.push({
        type: 'cir',
        desc: 'Add circle',
        circle: calculate_circumcircle(p0, p1, p2)
    });

    let current_index, j, k, id0, id1, id2;
    for (current_index = 0; current_index < number_vertices; current_index++) {

        let current_point = points[current_index];

        let tmp_indices = [];

        j = 0;
        while (j < indices.length) {

            let circle_index = Math.floor(j / 3);

            if (circles[circle_index].radius > 0.000001
                && is_point_in_circle(circles[circle_index], current_point)) {

                id0 = indices[j];
                id1 = indices[j + 1];
                id2 = indices[j + 2];

                tmp_indices = tmp_indices.concat([id0, id1, id1, id2, id2, id0]);

                indices.splice(j, 3);
                events.push({
                    type: 'cir',
                    desc: 'Remove circle',
                    circle: clone(circles[circle_index])
                });
                circles.splice(circle_index, 1);
                j -= 3;
            }
            j += 3;
        }

        j = 0;
        while (j < tmp_indices.length) {
            k = (j + 2);
            while (k < tmp_indices.length) {
                if ((tmp_indices[j] === tmp_indices[k] && tmp_indices[j + 1] === tmp_indices[k + 1])
                    || (tmp_indices[j + 1] === tmp_indices[k] && tmp_indices[j] === tmp_indices[k + 1])) {

                    tmp_indices.splice(k, 2);
                    tmp_indices.splice(j, 2);
                    j -= 2;
                    k -= 2;
                    if (j < 0 || j > tmp_indices.length - 1) break;
                    if (k < 0 || k > tmp_indices.length - 1) break;
                }
                k += 2;
            }
            j += 2;
        }

        j = 0;
        while (j < tmp_indices.length) {

            indices.push(current_index);

            let tmpId0 = tmp_indices[j];
            let tmpId1 = tmp_indices[j + 1];

            indices.push(tmpId0);
            indices.push(tmpId1);
            events.push({
                type: 'tri',
                desc: 'Add triangle',
                indices: [
                    clone(points[current_index]),
                    clone(points[tmpId0]),
                    clone(points[tmpId1])
                ]
            });

            p1 = points[tmpId0];
            p2 = points[tmpId1];

            let circle = calculate_circumcircle(current_point, p1, p2);
            events.push({
                type: 'cir',
                desc: 'Add circle',
                circle: clone(circle)
            });
            circles.push(circle);
            j += 2;
        }
    }

    id0 = points.length - 3;
    id1 = points.length - 2;
    id2 = points.length - 1;

    current_index = 0;
    while (current_index < indices.length) {

        let tri_0 = indices[current_index];
        let tri_1 = indices[current_index + 1];
        let tri_2 = indices[current_index + 2];

        if (tri_0 === id0 || tri_0 === id1 || tri_0 === id2
            || tri_1 === id0 || tri_1 === id1 || tri_1 === id2
            || tri_2 === id0 || tri_2 === id1 || tri_2 === id2) {
            events.push({
                type: 'tri',
                desc: 'Remove triangle',
                indices: [
                    clone(points[current_index]),
                    clone(points[current_index+1]),
                    clone(points[current_index+2])]
            });
            events.push({
                type: 'cir',
                desc: 'Remove circle',
                circle: clone(circles[current_index / 3])
            });
            indices.splice(current_index, 3);
            circles.splice(current_index / 3, 1);
            if (current_index > 0) current_index -= 3;
            continue;
        }
        current_index += 3;
    }

    points.pop();
    points.pop();
    points.pop();

    return {
        indices,
        events
    };
}

function clone(obj) {
    return Object.assign({}, obj);
}

function is_point_in_circle(c, p) {
    let dx = c.x - p.x;
    let dy = c.y - p.y;
    return c.radius > dx * dx + dy * dy;
}

function calculate_circumcircle(p0, p1, p2) {

    let A = p1.x - p0.x;
    let B = p1.y - p0.y;
    let C = p2.x - p0.x;
    let D = p2.y - p0.y;

    let E = A * (p0.x + p1.x) + B * (p0.y + p1.y);
    let F = C * (p0.x + p2.x) + D * (p0.y + p2.y);
    let G = 2.0 * (A * (p2.y - p1.y) - B * (p2.x - p1.x));

    let x = (D * E - B * F) / G;
    let y = (A * F - C * E) / G;

    let dx = x - p0.x;
    let dy = y - p0.y;
    let radius = dx * dx + dy * dy;

    return new Circle(x, y, radius);
}