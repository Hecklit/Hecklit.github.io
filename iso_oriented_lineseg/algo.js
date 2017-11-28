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
    const L = []; // List of active lineseg sorted by y coordinates
    while(events.length > 0) {
        const p = events.shift();
        if(p.type === 'start') {
            L.push(p.line);
        }else if(p.type === 'end') {
            const index = L.indexOf(p.line);
            if(index > -1) {
                L.splice(index, 1)
            }else{
                throw new Error('Trying to remove nonexisting linesegment from list of active linesegments')
            }
        } else {
            for (let i = 0; i < L.length; i++) {
                const activeLineSeg = L[i];
                yOfHorizontal = activeLineSeg.start.y;
                upperYVertical = Math.min(p.line.start.y, p.line.end.y);
                lowerYVertical = Math.max(p.line.start.y, p.line.end.y);
                if(yOfHorizontal > upperYVertical && yOfHorizontal < lowerYVertical) {
                    // we have an intersection report
                    points.push(new v2(
                        p.line.start.x,
                        activeLineSeg.start.y
                    ));
                }
            }
        }
    }
    return points;
}