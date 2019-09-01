function setup(){
    
    init();
    
    test_case('can capture the flag and score points', () => {
        // start a new match with default config
        let match = new Match()
    
        // move one player to flag of enemy base
        let pl = match.get_random_player(team=1)
        task = pl.move_to(match.get_base(team=2))
    
        // once the player is there move the player back
        next_task = task.then(() => {
            return pl.move_to(match.get_base(team=1))
        })
    
        // check if the team has 1 point and the other 0
        next_task.then(() => {
            assert.equal(match.get_points(team=1), 1)
            assert.equal(match.get_points(team=2), 0)
        })
    
        return true;
    })
}