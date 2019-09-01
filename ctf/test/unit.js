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
        let p2 = new Player(createVector(10, 0))
        let p3 = new Player(createVector(11, 0))

        assert_equal(p1.r, 5)
        assert_equal(circleCollide(p1, p2), true)
        assert_equal(circleCollide(p1, p3), false)

        return true;
    })
    
    test_case('circle collide works on player and base', () => {
        let p1 = new Player(createVector(0, 0))
        let p2 = new Base(createVector(10, 0))

        assert_equal(p1.r, 5)
        assert_equal(p2.r, 20)
        assert_equal(circleCollide(p1, p2), true)

        return true;
    })
    
    test_case('player is colliding with other base', () => {
        success_pl = 0
        success_base = 0
        let match = new Match()
        match.start()
    
        // move one player to flag of enemy base

        let base = match.get_base(team=2)
        base.on_collide = (e) => {
            if(e instanceof Player && e.team.id === 1){
                success_base += 1
            }
        };
        let pl = match.get_random_player(team=1)
        pl.on_collide = (e) => {
            if(e instanceof Base && e.team.id === 2){
                success_pl += 1
            }
        };
        pl.set_pos(match.get_base(team=2).pos)

        // check for collisions
        match.check_for_collision()

        assert_equal(success_pl, 1)
        assert_equal(success_base, 1)
        assert_type(pl.flag, Flag)

        return (success_pl && success_base);
    })
    
    test_case('base can give flag to player', () => {
        let p1 = new Player(createVector(0, 0))
        let p2 = new Player(createVector(0, 0))
        let base = new Base(createVector(10, 0))

        base.give_flag(p1)
        base.give_flag(p2)

        assert_type(p1.flag, Flag)
        assert_equal(p2.flag, null)

        return true;
    })
    
    test_case('team can score point', () => {
        let match = new Match()
        match.start()
        let t = match.teams[0]
        assert_equal(t.points, 0)
        assert_equal(match.get_points(team=1), 0)
        t.on_score_point()
        assert_equal(match.get_points(team=1), 1)
        assert_equal(t.points, 1)

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