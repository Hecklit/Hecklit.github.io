function setup(){
    
    init();
    
    test_case('can get random player from team', () => {
        let match = new Match()
        let pl = match.get_random_player(team=1)

        assert_type(pl, Player)
        return true;
    })
    
    test_case('circle collide works on players', () => {
        let p1 = new Player(createVector(0, 0))
        let p2 = new Player(createVector(0, 0))
        let p3 = new Player(createVector(11, 0))

        assert_equal(p1.r, 5)
        assert_equal(circleCollide(p1, p2), true)
        assert_equal(circleCollide(p1, p3), false)

        return true;
    })
    
    test_case('can get base from team', () => {
        let match = new Match()
        match.start()
        let base = match.get_base(team=2)

        assert_type(base, Base)
        return true;
    })
    
    test_case('can get points for team', () => {
        let match = new Match()
        match.start()
        let points = match.get_points(team=2)

        assert_equal(points, 0)
        return true;
    })

}