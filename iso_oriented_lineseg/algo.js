function generateEvents(lines) {
    const events = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if(line.type === 'h') {
            // horizontal lineseg
            events.push({
                type: 'start',
                line: line,
                x: line.start.x
            });
            events.push({
                type: 'end',
                line: line,
                x: line.end.x
            });
        }else{
            // vertical lineseg
            events.push({
                type: 'vert',
                line: line,
                x: line.start.x
            });
        }
    }
    events.sort((a, b) => {
        return a.x - b.x;
    });
    return events;
}

function intersectIsoOritentedLineSeg(events) {
    // Start and Ends All start and end points of horizontal segments
    // und all vertical segments have mutually distinct coordinates.
    const points = [];
    const L = new AVLTree(); // List of active lineseg sorted by y coordinates
    while(events.length > 0) {
        const p = events.shift();
        if(p.type === 'start') {
            L.insert(p.line.start.y);
        }else if(p.type === 'end') {
            L.delete(p.line.start.y)
        } else {
            upperYVertical = Math.min(p.line.start.y, p.line.end.y);
            lowerYVertical = Math.max(p.line.start.y, p.line.end.y);
            // L.display()

            intersec = L.rangeQuery(upperYVertical, lowerYVertical) // upperYVertical -> min; lowerYVertical -> max
            for (let i = 0; i < intersec.length; i++) {
                const y = intersec[i];
                points.push(new v2(
                    p.line.start.x,
                    y
                ));
            }
        }
    }
    return points;
}