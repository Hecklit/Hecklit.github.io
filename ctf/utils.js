function drawArrow(base, vec, myColor) {
    push();
    stroke(myColor);
    strokeWeight(3);
    fill(myColor);
    translate(base.x, base.y);
    line(0, 0, vec.x, vec.y);
    rotate(vec.heading());
    let arrowSize = 7;
    translate(vec.mag() - arrowSize, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
  }

function randomElement(items) {
  return items[Math.floor(Math.random()*items.length)];
}

function circleCollide(e1, e2) {
  return e1.pos.sub(e2.pos).magSq() <= ((e1.r + e2.r) * (e1.r + e2.r))
}