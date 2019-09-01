function setup(){
    
    init();
    
    test_case('can capture the flag and score points', () => {
        // start a new match with default config
        let match = new Match()
        match.start()
    
        // move one player to flag of enemy base
        let pl = match.get_random_player(team=1)
        pl.set_pos(match.get_base(team=2).pos)
        
        // once the player is there move the player back
        pl.set_pos(match.get_base(team=1).pos)
    
        // check if the team has 1 point and the other 0
        assert_equal(match.get_points(team=1), 1)
        assert_equal(match.get_points(team=2), 0)
        return true;
    })
}