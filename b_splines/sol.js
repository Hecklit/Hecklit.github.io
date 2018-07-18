function insert_knot(t, n, points, knots, weights, result) {
    var i,j,r,l;              // function-scoped iteration variables
    var N = points.length;    // points count
    var d = points[0].length; // point dimensionality
  
    if(n < 1) throw new Error('n must be at least 1 (linear)');
    if(n > (N-1)) throw new Error('n must be less than or equal to point count - 1');
  
    if(!weights) {
      // build weight vector of length [n]
      weights = [];
      for(i=0; i<n; i++) {
        weights[i] = 1;
      }
    }
  
    if(!knots) {
      // build knot vector of length [n + n + 1]
      var knots = [];
      for(i=0; i<n+N+1; i++) {
        knots[i] = i;
      }
    } else {
      if(knots.length !== n+N+1) throw new Error(`bad knot vector length ${knots.length} instead of ${n+N+1}`);
    }
  
    var domain = [
      n,
      knots.length-1 - n
    ];
  
    // remap t to the domain where the spline is defined
    var low  = knots[domain[0]];
    var high = knots[domain[1]];
  
    if(t < low || t > high) throw new Error('out of bounds');
  
    // find s (the spline segment) for the [t] value provided
    for(r=domain[0]; r<domain[1]; r++) {
      if(t >= knots[r] && t <= knots[r+1]) {
        break;
      }
    }
  
    // l (level) goes from 1 to the curve n + 1
    var alpha;
    const triangle = [points];
    for(j=1; j<=n; j++) {
      triangle[j] = []
        // build level l of the pyramid
        for(i=r-n+j; i<=r; i++) {
            alpha = (t - knots[i]) / (knots[i+n+1-j] - knots[i]);
            triangle[j][i] = []
            // interpolate each component
            for(dim=0; dim<d; dim++) {
              triangle[j][i][dim] = (1 - alpha) * triangle[j-1][i-1][dim] + alpha * triangle[j-1][i][dim];
            }
        }
    }
    const res = [];
    for (let i = 0; i <= r-n; i++) {
      res.push(triangle[0][i]);
    }
    for (let i = 0; i < triangle[1].length; i++) {
      if(triangle[1][i]){
        res.push(triangle[1][i]);
      }
    }
    for (let i = r; i < triangle[0].length; i++) {
      res.push(triangle[0][i]);
    }
    return res;
}

const cache = {};
function interpolate(t, degree, points, knots, weights, result) {
    var i,j,s,l;              // function-scoped iteration variables
    var n = points.length;    // points count
    var d = points[0].length; // point dimensionality
  
    if(degree < 1) throw new Error('degree must be at least 1 (linear)');
    if(degree > (n-1)) throw new Error('degree must be less than or equal to point count - 1');
  
    if(!weights) {
      // build weight vector of length [n]
      weights = [];
      for(i=0; i<n; i++) {
        weights[i] = 1;
      }
    }
  
    if(!knots) {
      // build knot vector of length [n + degree + 1]
      var knots = [];
      for(i=0; i<n+degree+1; i++) {
        knots[i] = i;
      }
    } else {
      if(knots.length !== n+degree+1) throw new Error(`bad knot vector length ${knots.length} instead of ${n+degree+1}`);
    }
  
    var domain = [
      degree,
      knots.length-1 - degree
    ];
  
    // remap t to the domain where the spline is defined
    var low  = knots[domain[0]];
    var high = knots[domain[1]];
    t = t * (high - low) + low;
  
    if(t < low || t > high) throw new Error('out of bounds');
  
    // find s (the spline segment) for the [t] value provided
    for(s=domain[0]; s<domain[1]; s++) {
      if(t >= knots[s] && t <= knots[s+1]) {
        break;
      }
    }
  
    // convert points to homogeneous coordinates
    var v = [];
    for(i=0; i<n; i++) {
        v[i] = [];
        for(j=0; j<d; j++) {
            v[i][j] = points[i][j] * weights[i];
        }
        v[i][d] = weights[i];
    }
  
    // l (level) goes from 1 to the curve degree + 1
    var alpha;

    for(l=1; l<=degree+1; l++) {
        // build level l of the pyramid
        for(i=s; i>s-degree-1+l; i--) {
            alpha = (t - knots[i]) / (knots[i+degree+1-l] - knots[i]);
            
            // interpolate each component
            for(j=0; j<d+1; j++) {
                v[i][j] = (1 - alpha) * v[i-1][j] + alpha * v[i][j];
            }
        }
    }
  
    // convert back to cartesian and return
    var result = result || [];
    for(i=0; i<d; i++) {
        result[i] = v[s][i] / v[s][d];
    }
    
    cache[points.length+'_'+t] = result;
    return result;
  }
  