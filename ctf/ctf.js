let match;

function setup() {
  const w = windowWidth - 10
  const h = windowHeight - 90
  createCanvas(w, h)
  background(100)

  const teams = [
    new Team('red', 10),
    new Team('blue', 10),
    new Team('yellow', 10),
    new Team('green', 10),
  ]

  const map = new Map(w, h, teams.length)

  match = new Match(teams, map)
  match.start()
}

function draw() {

  match.update(deltaTime)
  match.draw()
}