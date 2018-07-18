function insert_knot(t, n, points, knots, weights, result) {
    var i,j,r,l;              // function-scoped iteration variables
    var N = points.length;    // points count
    var d = points[0].length; // point dimensionality
    console.log('points input into insert knot', points)
  
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
    // t = t * (high - low) + low;
  
    if(t < low || t > high) throw new Error('out of bounds');
  
    // find s (the spline segment) for the [t] value provided
    for(r=domain[0]; r<domain[1]; r++) {
      if(t >= knots[r] && t <= knots[r+1]) {
        break;
      }
    }
    console.log('r', r);
    console.log('t', t);
    console.log(knots[r])
    console.log(knots)
  
    // var v = [];
    // for(i=0; i<N; i++) {
    //     v[i] = [];
    //     for(j=0; j<d; j++) {
    //         v[i][j] = points[i][j] * weights[i];
    //     }
    //     v[i][d] = weights[i];
    // }
  
    // l (level) goes from 1 to the curve n + 1
    var alpha;
    const triangle = [points];
    for(j=1; j<=n; j++) {
      triangle[j] = []
        // build level l of the pyramid
        for(i=r-n+j; i<=r; i++) {
            alpha = (t - knots[i]) / (knots[i+n+1-j] - knots[i]);
            console.log('alpha => ', alpha)
            // console.log('t => ', t)
            // console.log('knots[i] => ', knots[i])
            triangle[j][i] = []
            // interpolate each component
            for(dim=0; dim<d; dim++) {
              triangle[j][i][dim] = (1 - alpha) * triangle[j-1][i-1][dim] + alpha * triangle[j-1][i][dim];
            }
        }
    }
    console.log('triangle', triangle)
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
    // convert back to cartesian and return
    // for (let j = 0; j < res.length; j++) {
    //   for(i=0; i<d; i++) {
    //     // console.log(res[j])
    //     //   console.log(res[j][i], res[j][d])
    //       res[j][i] = res[j][i] / res[j][d];
    //   }
    //   res[j] = res[j].slice(0,2)
    // }
    // console.log('triangle', triangle)
    return res;
    
    // cache[points.length+'_'+t] = result;
    // return result;
}

const cache = {};
function interpolate(t, degree, points, knots, weights, result) {
    // if(cache.hasOwnProperty(points.length+'_'+t)) {
    //     return cache[points.length+'_'+t];
    // }
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
    // console.log('low', low)
    // console.log('high', high)
    // console.log('t before', t)
    t = t * (high - low) + low;
    // console.log('t after remapp', t)
  
    if(t < low || t > high) throw new Error('out of bounds');
  
    // find s (the spline segment) for the [t] value provided
    for(s=domain[0]; s<domain[1]; s++) {
      if(t >= knots[s] && t <= knots[s+1]) {
        break;
      }
    }
  
    // convert points to homogeneous coordinates
    // console.log('points', points)
    // console.log('weights', weights)
    var v = [];
    for(i=0; i<n; i++) {
        v[i] = [];
        for(j=0; j<d; j++) {
            v[i][j] = points[i][j] * weights[i];
        }
        v[i][d] = weights[i];
    }
    // console.log('v', v)
    // console.log(points[0][0] == v[0][0])
    // console.log(points[0][1] == v[0][1])
    // console.log(points[1][0] == v[1][0])
    // console.log(points[1][1] == v[1][1])
    // console.log(points[2][0] == v[2][0])
    // console.log(points[2][1] == v[2][1])
    // console.log(points[3][0] == v[3][0])
    // console.log(points[3][1] == v[3][1])
  
    // l (level) goes from 1 to the curve degree + 1
    var alpha;
    // console.log('knots', knots)
    // console.log('----------------------------------------------------------')
    // console.log('degree = ', degree)
    // console.log('s = ', s)

    for(l=1; l<=degree+1; l++) {
        // console.log(`Start Outer loop with l= ${l}`)
        // build level l of the pyramid
        for(i=s; i>s-degree-1+l; i--) {
            // console.log(`Start Inner loop with i= ${i}`)
            // console.log('i = ',i)
            // console.log('i+degree+1-l = ', i+degree+1-l)
            // console.log(`(${t} - ${knots[i]}) / (${knots[i+degree+1-l]} - ${knots[i]})`)
            alpha = (t - knots[i]) / (knots[i+degree+1-l] - knots[i]);
            // console.log(`alpha = ${alpha}`)
            // console.log('alpha = ',alpha)
            
            // interpolate each component
            for(j=0; j<d+1; j++) {
                v[i][j] = (1 - alpha) * v[i-1][j] + alpha * v[i][j];
            }
            // console.log(`End Inner loop with i= ${i}`)
        }
        // console.log(`End Outer loop with l= ${l}`)
    }
    // console.log('---------------------------------------------------------')
  
    // convert back to cartesian and return
    var result = result || [];
    // console.log('before result', result)
    // console.log('d', d)
    // console.log('v', v)
    for(i=0; i<d; i++) {
        result[i] = v[s][i] / v[s][d];
    }
    // console.log('after result', result)
    
    cache[points.length+'_'+t] = result;
    return result;
  }
  