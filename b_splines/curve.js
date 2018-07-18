function lerp(a, b, t) {
    return a * (1 - t) + b * t
}
let counter = 0;
let epsilon_schnitt = 0.9;
let epsilon_draw = 0.9;
let intersections = [];
let self_intersections = [];

class Bezier {
    constructor(points, color='yellow') {
        this._points = points;
        this.curve_points = [];
        this.cache_invalid = true;
        this.color = color
    }

    cn_minus_one_transition(point) {
        console.log('cn_minus_one_transition')
        const { left, right, max_2_derivative } = this._split_curve(this._points, 2);
        right[right.length-1] = point;
        return new Bezier(right, 'white');
    }

    find_intersections_with_other(other) {
        intersections = [];
        this._recursive_intersect(this._points, other._points);
        return intersections;
    }

    find_self_intersections() {
        self_intersections = [];
        let inters = [];
        this._recursive_self_intersection(this._points);
        for (let i = 0; i < self_intersections.length; i++) {
            const first = self_intersections[i];
            const bez1 = new Bezier(first);
            for (let j = i + 1; j < self_intersections.length; j++) {
                const second = self_intersections[j];
                const bez2 = new Bezier(second);
                let intersec = bez1.find_intersections_with_other(bez2);
                for (let i = 0; i < intersec.length; i++) {
                    const inter = intersec[i];
                    inters.push(inter);
                }
            }
        }
        return inters;
    }

    calc_derivatives(first_column) {
        let output = [];
        let n = first_column.length;
        for (let i = 0; i < first_column.length - 1; i++) {
            const first = first_column[i];
            const second = first_column[i + 1];
            output.push(second.sub(first).scale(n));
        }
        return output;
    }

    _recursive_self_intersection(points) {
        let triangle = this.calc_triangle(points, 0.5);
        let first_derivatives = this.calc_derivatives(points);
        let sum_angle = 0;
        let max_sum_angle = 0;
        for (let i = 0; i < first_derivatives.length - 1; i++) {
            const first = first_derivatives[i].normalize();
            const second = first_derivatives[i + 1].normalize();
            let angle = Math.acos(first.dot(second));
            sum_angle += angle;
            if (sum_angle > max_sum_angle) {
                max_sum_angle = sum_angle;
            }
        }
        if (max_sum_angle > Math.PI) {
            // self intersection detected
            const { left, right } = this.shave_triangle(triangle);
            this._recursive_self_intersection(left);
            this._recursive_self_intersection(right);
        } else {
            // self_intersections.push({
            //     'first': points[0],
            //     'second': points[points.length-1]
            // });
            self_intersections.push(points);

        }
    }

    _recursive_intersect(points_a, points_b) {
        let p_a_x = points_a.map(x => x.x);
        let p_a_y = points_a.map(y => y.y);
        let p_b_x = points_b.map(x => x.x);
        let p_b_y = points_b.map(y => y.y);
        let max_a_x = Math.max(...p_a_x);
        let max_a_y = Math.max(...p_a_y);
        let max_b_x = Math.max(...p_b_x);
        let max_b_y = Math.max(...p_b_y);
        let min_a_x = Math.min(...p_a_x);
        let min_a_y = Math.min(...p_a_y);
        let min_b_x = Math.min(...p_b_x);
        let min_b_y = Math.min(...p_b_y);
        let m = points_a.length;
        let n = points_b.length;

        if (min_a_x < max_b_x && max_a_x > min_b_x &&
            max_a_y > min_b_y && min_a_y < max_b_y) {
            // overlap
            let { left, right, max_2_derivative } = this._split_curve(points_a, 0.5);
            if ((m * (m - 1) * max_2_derivative) > epsilon_schnitt) {
                this._recursive_intersect(left, points_b);
                this._recursive_intersect(right, points_b);
            } else {
                let { left, right, max_2_derivative } = this._split_curve(points_b, 0.5);
                if ((n * (n - 1) * max_2_derivative) > epsilon_schnitt) {
                    this._recursive_intersect(points_a, left);
                    this._recursive_intersect(points_a, right);
                } else {
                    let intersection = this.line_segment_intersection(points_a[0], points_a[points_a.length - 1],
                        points_b[0], points_b[points_b.length - 1]);
                    if (intersection !== null) {
                        intersections.push(intersection);
                    }
                }
            }
        }
    }

    line_segment_intersection(p1, p2, p3, p4) {
        let ta_zaehler = ((p3.y - p4.y) * (p1.x - p3.x) + (p4.x - p3.x) * (p1.y - p3.y));
        let ta_nenner = ((p4.x - p3.x) * (p1.y - p2.y) - (p1.x - p2.x) * (p4.y - p3.y));

        if (ta_nenner === 0) {
            return null;
        }
        let ta = ta_zaehler / ta_nenner;

        let tb_zaehler = ((p1.y - p2.y) * (p1.x - p3.x) + (p2.x - p1.x) * (p1.y - p3.y));
        let tb_nenner = ((p4.x - p3.x) * (p1.y - p2.y) - (p1.x - p2.x) * (p4.y - p3.y));
        if (tb_nenner === 0) {
            return null;
        }
        let tb = tb_zaehler / tb_nenner;
        if (ta >= 0 && ta <= 1 && tb >= 0 && tb <= 1) {
            let intersection = p1.add(p2.sub(p1).scale(ta));
            return intersection;
        } else {
            return null;
        }
    }

    plot(ctx, max_recursive_level) {
        this.plot_points(ctx, this._points, 'white');
        this._plot_bezier(ctx, this._points, max_recursive_level, 1);
        // console.log('bezier_points', this._points)
    }

    _connect_points(ctx, points) {
        if (points.length < 2) {
            return;
        }
        ctx.strokeStyle = this.color
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const p = points[i];
            ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
        // this.plot_points(ctx, points, 'rgba(2255, 0, 0, 0.2)')
    }

    plot_points(ctx, points, color) {
        if (points.length < 2) {
            if (points.length == 1) {
                this._draw_point(ctx, points[0], 5), color;
            }
            return;
        } else {
            for (let i = 0; i < points.length; i++) {
                const point = points[i];
                this._draw_point(ctx, point, 4, color);
            }
        }
    }

    _plot_bezier(ctx, points, k, max_2_derivative) {
        if (k == 0 || max_2_derivative < epsilon_draw) {
            // draw polygon
            this._connect_points(ctx, points);
        } else {
            // compute the combined polygon
            const { left, right, max_2_derivative } = this._split_curve(points, 0.5);
            this._plot_bezier(ctx, left, k - 1, max_2_derivative);
            this._plot_bezier(ctx, right, k - 1, max_2_derivative);
        }
    }

    add_point(p) {
        this._points.push(p);
        this.cache_invalid = true;
    }

    change_point(index, x, y) {
        this._points[index].x = x;
        this._points[index].y = y;
        this.cache_invalid = true;
    }

    calc_triangle(points, t) {
        let triangle = [];
        triangle.push(points);
        let i = 0;
        while (triangle[triangle.length - 1].length > 1) {
            let new_row = [];
            for (let k = 0; k < triangle[i].length - 1; k++) {
                let point = triangle[i][k];
                let next_point = triangle[i][k + 1];
                let new_x = point.x * (1 - t) + t * next_point.x;
                let new_y = point.y * (1 - t) + t * next_point.y;
                let new_point = new v2(new_x, new_y)

                new_row.push(new_point);
            }
            triangle.push(new_row);
            i++;
        }
        return triangle;
    }

    shave_triangle(triangle) {
        let left = [];
        let right = [];
        for (let i = 0; i < triangle.length; i++) {
            const tria = triangle[i];
            left.push(tria[0]);
            right.push(tria[tria.length - 1]);
        }
        return { left, right }
    }

    _split_curve(points, t) {
        let triangle = this.calc_triangle(points, t);
        const { left, right } = this.shave_triangle(triangle);
        let max_2_derivative = 0;
        for (let i = 0; i < triangle.length - 2; i++) {

            let second_derivative = triangle[i][2].add(triangle[i][1].scale(-2)).add(triangle[i][0]).length();
            if (second_derivative > max_2_derivative) {
                max_2_derivative = second_derivative;
            }
        }
        return { left, right, max_2_derivative }
    }

    plot_bounds(ctx) {
        ctx.fillStyle = "rgba(200, 45, 21, 0.4)";
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(this._points[0].x, this._points[0].y);
        for (let i = 1; i < this._points.length; i++) {
            const point = this._points[i];
            ctx.lineTo(point.x, point.y);
        }
        ctx.lineTo(this._points[0].x, this._points[0].y);
        ctx.fill();
        ctx.stroke();
    }

    _draw_point(ctx, p, size, color) {
        ctx.fillStyle = color
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
    }

    naive_plot(ctx, samples, plot_bounds, max_t = 1.0) {
        if (this._points.length < 2) {
            if (this._points.length == 1) {
                this._draw_point(ctx, this._points[0], 10);
            }
            return;
        } else {
            for (let i = 0; i < this._points.length; i++) {
                const point = this._points[i];
                this._draw_point(ctx, point, 8);
            }
        }
        if (plot_bounds) {
            this.plot_bounds(ctx);
        }
        if (this.cache_invalid) {
            this.curve_points = [];
            for (let a = 0; a <= samples; a++) {
                const t = a * 1.0 / samples;
                if (t > max_t) {
                    break;
                }
                let new_point = this._naive_recursion(this._points, t);
                this.curve_points.push(new_point);
            }
            this.cache_invalid = false;
        }

        this._connect_points(ctx, this.curve_points.slice(0, Math.floor(this.curve_points.length * max_t)));
    }

    _naive_recursion(points, t) {
        if (points.length == 1) {
            return points[0];
        }
        const new_points = [];
        for (let i = 0; i < points.length - 1; i++) {
            const point = points[i];
            const next_point = points[i + 1];
            const new_x = point.x * (1 - t) + t * next_point.x;
            const new_y = point.y * (1 - t) + t * next_point.y;
            new_points.push(new v2(new_x, new_y));
        }
        return this._naive_recursion(new_points, t);
    }
}