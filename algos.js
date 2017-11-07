function grahamsScan(points) {
     const sortedPoints = points.slice().sort(lexicographicallSort);
     // Upper
     const lUpper = [];
     lUpper.push(sortedPoints[0]);
     lUpper.push(sortedPoints[1]);
     for(let i=2;i<sortedPoints.length;i++){
         lUpper.push(sortedPoints[i]);
         while(lUpper.length > 2 && makeALeftTurn(lUpper[lUpper.length-3], lUpper[lUpper.length-2], lUpper[lUpper.length-1])) {
             lUpper.splice(lUpper.length-2, 1);
         }
     }
 
     // Lower
     const reverseSort = sortedPoints.slice().reverse();
     const lLower = [];
     lLower.push(reverseSort[0]);
     lLower.push(reverseSort[1]);
     for(let i=2;i<reverseSort.length;i++){
         lLower.push(reverseSort[i]);
         while(lLower.length > 2 && makeALeftTurn(lLower[lLower.length-3], lLower[lLower.length-2], lLower[lLower.length-1])) {
             lLower.splice(lLower.length-2, 1);
         }
     }
     lLower.splice(0,1);
     lLower.splice(lLower.length-1,1);
     return lUpper.concat(lLower);
}

function lexicographicallSort(a, b) {
    const dif = a.x - b.x;
    if(dif !== 0) {
        return dif;
    }else{
        return a.y - b.y;
    }
}

function makeALeftTurn(a, b, c) {
    const vecA = (c.sub(a)).normal();
    const vecB = b.sub(a);
    const scalar = vecA.dot(vecB);
    return (scalar) > 0;
}

function jarvisMarch(points) {
    const sortedPoints = points.slice().sort(lexicographicallSort);
    let startpunkt = sortedPoints[0];
    let endpunkt = null;
    const P = [];
    let i = 0;
    do {
        P[i] = startpunkt;
        endpunkt = sortedPoints[0]
        for (let j = 0; j < sortedPoints.length; j++) {
            let sj = sortedPoints[j];
            if(endpunkt === startpunkt || makeALeftTurn(startpunkt, sj, endpunkt)) {
                endpunkt = sj;
            }
        }
        startpunkt = endpunkt;
        i++;
    } while (endpunkt !== P[0]);
    return P;
}