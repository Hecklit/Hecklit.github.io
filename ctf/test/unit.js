function setup(){
    
    init();
    
    test_case('can get random player from team', () => {
        let match = new Match()
        let pl = match.get_random_player(team=1)

        assert_type(pl, Player)
        return true;
    })
    
    test_case('can get base from team', () => {
        let match = new Match()
        match.start()
        let base = match.get_base(team=1)

        assert_type(base, Base)
        return true;
    })
}