function lerp(a, b, t) {
    return a * (1 - t) + b * t
}
let counter = 0;
let epsilon_schnitt = 0.9;
let epsilon_draw = 0.9;
let intersections = [];
let self_intersections = [];

class B_Spline {
    constructor(points, color='yellow') {
        this._points = points;
        this.curve_points = [];
        this.cache_invalid = true;
        this.color = color
        this.knots = [0.0, 0.1, 0.4, 0.5, 0.6, 0.7, 0.9, 1.0];
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

    plot(ctx, max_recursive_level) {
        this.plot_points(ctx, this._points, 'blue');
        this._plot_bezier(ctx, this._points, max_recursive_level, 1);
    }

    _connect_points(ctx, points) {
        if (points.length < 2) {
            return;
        }
        ctx.strokeStyle = this.color
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const p = points[i];
            ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
        this.plot_points(ctx, points, 'rgba(2255, 0, 0, 0.2)')
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

    insert_knot(t, k) {
        let tria = this.de_boor(this.points, t);
        console.log(tria);
        let {left, right} = this.shave_triangle(tria);
        return tria;
    }

    de_boor(points, t) {
        let triangle = [];
        let n = 2; // Grad der Funktion
        let r = 0;
        // finding r
        console.log
        for (let i = 0; i < this.knots.length; i++) {
            const knot = this.knots[i];
            if( knot >= t ) {
                r = i-1;
                break;
            }
        }

        if(r < n) {
            console.log('Fade In Bereich.')
            return [];
        }

        let new_col = [];
        for (let i = r-n; i < r; i++) {
            const f1 = this._points[i];
            new_col.push(f1);
        }
        
        triangle.push(new_col);

        for (let j = 0; j < n-1; j++) {
            new_col = [];
            for (let i = r-n + j; i < r-1 + j; i++) {
                const f1 = this._points[i];
                const f2 = this._points[i+1];
                const alpha = (t-this.knots[i]) / (this.knots[n+i+1-j-this.knots[j]])
                const new_point = f1.scale(1-alpha).add(f2.scale(alpha));
                new_col.push(new_point);
            }
            triangle.push(new_col);
        }
        return triangle;
    }

    shave_triangle(triangle, k) {
        let left = [];
        let right = [];
        for (let i = 0; i < k; i++) {
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

    _draw_point(ctx, p, size, color) {
        ctx.fillStyle = color
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
    }
}