function setup(){
    
    init();
    
    test_case('can get random player from team', () => {
        let match = new Match()
        let pl = match.get_random_player(team=1)

        assert_type(pl, Player)
        return true;
    })
}