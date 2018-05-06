function lerp(a, b, t) {
    return a*(1-t) + b*t
}

class Bezier{
    constructor(points) {
        this._points = points;
        this.curve_points = [];
        this.cache_invalid = true;
    }

    plot(ctx, max_recursive_level) {
        this._plot_bezier(ctx, this._points, max_recursive_level)
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
    }

    _plot_bezier(ctx, points, k) {
        if (k==0) {
            // draw polygon
            this._connect_points(ctx, points);
        }else{
            // compute the combined polygon
            const { left, right } = this._split_curve(points, 0.5);
            this._plot_bezier(ctx, left, k-1);
            this._plot_bezier(ctx, right, k-1);
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
        const left = []
        const right = []
        const split_index = Math.floor(points.length * t)
        for (let i = 0; i < points.length -1; i++) {
            const point = points[i];
            const next_point = points[i+1];
            const new_x = point.x * (1-t) + t * next_point.x;
            const new_y = point.y * (1-t) + t * next_point.y;
            if(i <= split_index) {
                left.push(new v2(new_x, new_y));
            }
            if(i >= split_index){
                right.push(new v2(new_x, new_y));
            }
        }
        return {left, right}
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

    _draw_point(ctx, p, size) {
        ctx.fillStyle = 'red'
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