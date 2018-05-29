function lerp(a, b, t) {
    return a*(1-t) + b*t
}
let counter = 0;

class Bezier{
    constructor(points) {
        this._points = points;
        this.curve_points = [];
        this.cache_invalid = true;
    }

    plot(ctx, max_recursive_level) {
        this.plot_points(ctx, this._points, 'blue');
        this._plot_bezier(ctx, this._points, max_recursive_level, 1);
    }

    _connect_points(ctx, points) {
        if(points.length < 2) {
            return;
        }
        ctx.strokeStyle = 'yellow'
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
        if(points.length < 2) {
            if(points.length == 1) {
                this._draw_point(ctx, points[0], 5), color;
            }
            return;
        }else{
            for (let i = 0; i < points.length; i++) {
                const point = points[i];
                this._draw_point(ctx, point, 4, color);
            }
        }
    }

    _plot_bezier(ctx, points, k, max_2_derivative) {
        if (k==0 || max_2_derivative < 0.9) {
            // draw polygon
            this._connect_points(ctx, points);
        }else{
            // compute the combined polygon
            const { left, right, max_2_derivative } = this._split_curve(points, 0.5);
            this._plot_bezier(ctx, left, k-1, max_2_derivative);
            this._plot_bezier(ctx, right, k-1, max_2_derivative);
        }
    }
    
    add_point(p){
        this._points.push(p);
        this.cache_invalid = true;
    }

    change_point(index, x, y) {
        this._points[index].x = x;
        this._points[index].y = y;
        this.cache_invalid = true;
    }

    _split_curve(points, t) {
        
        let triangle = [];
        let left = [];
        let right = [];
        triangle.push(points);
        let i = 0;
        while (triangle[triangle.length-1].length > 1) {
            let new_row = [];
            for (let k = 0; k < triangle[i].length-1; k++) {
                let point = triangle[i][k];
                let next_point = triangle[i][k+1];
                let new_x = point.x * (1-t) + t * next_point.x;
                let new_y = point.y * (1-t) + t * next_point.y;
                let new_point = new v2(new_x, new_y)
                
                new_row.push(new_point);
            }
            triangle.push(new_row);
            i++;
        }
        for (let i = 0; i < triangle.length; i++) {
            const tria = triangle[i];
            left.push(tria[0]);
            right.push(tria[tria.length-1]);
        }
        let max_2_derivative = 0;
        for(let i = 0; i < triangle.length-2; i++){

            let second_derivative = triangle[i][2].add(triangle[i][1].scale(-2)).add(triangle[i][0]).length();
            if (second_derivative > max_2_derivative) {
                max_2_derivative = second_derivative;
            } 
        }
        return {left, right, max_2_derivative}
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
        ctx.fillRect(p.x - size/2, p.y - size/2, size, size);
    }

    naive_plot(ctx, samples, plot_bounds, max_t=1.0) {
        if(this._points.length < 2) {
            if(this._points.length == 1) {
                this._draw_point(ctx, this._points[0], 10);
            }
            return;
        }else{
            for (let i = 0; i < this._points.length; i++) {
                const point = this._points[i];
                this._draw_point(ctx, point, 8);
            }
        }
        if(plot_bounds) {
            this.plot_bounds(ctx);
        }
        if(this.cache_invalid) {
            this.curve_points = [];
            for (let a = 0; a <= samples; a++) {
                const t = a*1.0/samples;
                if(t > max_t) {
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
        if(points.length == 1) {
            return points[0];
        }
        const new_points = [];
        for (let i = 0; i < points.length - 1; i++) {
            const point = points[i];
            const next_point = points[i +1];
            const new_x = point.x * (1-t) + t * next_point.x;
            const new_y = point.y * (1-t) + t * next_point.y;
            new_points.push(new v2(new_x, new_y));
        }
        return this._naive_recursion(new_points, t);
    }
}