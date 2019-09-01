let match;

function setup() {
  const w = windowWidth - 10
  const h = windowHeight - 90
  createCanvas(w, h)
  background(100)

  const teams = [
    new Team(1, 'red', 10),
    new Team(2, 'blue', 10),
    new Team(3, 'yellow', 10),
    new Team(4, 'green', 10),
  ]

  const map = new Map(w, h, teams.length)

  match = new Match(teams, map)
  match.start()
}

function draw() {

  match.update(deltaTime)
  match.draw()
}