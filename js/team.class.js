/*
 * Team Class
 * ----------
 */

var Team = function( data ) {
    this.id = data.id;
    this.team_name = '';
    this.opposing_team_id = data.opposing_team_id;
    this.opposing_team_name = '';
    this.matches_amount_latest = data.matches_amount_latest;
    this.matches_amount_against_latest = data.matches_amount_against_latest;
    this.tournament_id = data.tournament_id;
    this.matches_all = [];              // Matches list from API
    this.matches_latest = [];           // Latest matches list
    this.matches_against = [];          // Matches against oponent list
    this.matches_against_latest = [];   // Latest matches against oponent list
    this.matches_tournament = [];       // All matches from tournamenr list

    this.matches_detailed = {};
    // purely gui thing
    this.matches_status = 0;
};

Team.prototype.init = function() {
    var _this = this;
    var goNext = new Promise(function(resolve, reject){
        _this.team_name = _this.getNameById(_this.id);
        _this.opposing_team_name = _this.getNameById(_this.opposing_team_id);
        _this.init_matches_all();
        _this.init_matches_latest();
        _this.init_matches_against();
        _this.init_matches_against_latest();
        _this.init_matches_tournament();

        // purely gui thing
        $('.status__container').append('<p><span class="status-' + _this.id + '"></span>/<span class="status_total-' + _this.id + '"></span> of ' + _this.team_name + ' matches successfully terminated.</p>');
        var total_status = _this.matches_latest.length + _this.matches_against_latest.length + _this.matches_tournament.length;
        $('.status_total-' + _this.id).html(total_status);

        // add debugging mode
        _this.init_latest_matches_detailed()
            .then(function() {
                _this.init_against_latest_matches_detailed()
                    .then(function() {
                        _this.init_tournaments_matches_detailed()
                            .then(function() {
                                html_log(_this.team_name + ' data has been successfully initialized.');
                                resolve();
                            });
                    });
            });
    });
    return goNext;
};

/* Get team name by it's ID */
Team.prototype.getNameById = function(id) {
    var name = '';
    teamsDB.forEach(function(team) {
        if (team.team_id === id) {
            name = team.name;
            return false;
        }
    });
    return name;
};

/* Pulling all matches that team played (from Open Dota API) */
Team.prototype.init_matches_all = function() {
    var _this = this;
    getSyncJSON('https://api.opendota.com/api/teams/' + this.id + '/matches', function(matches) {
        matches.forEach(function(match) {
            _this.matches_all.push(match);
        });
    });
};

/* Filtering matches_all array on matches amount */
Team.prototype.init_matches_latest = function() {
    if (this.matches_amount_latest > this.matches_all.length) {
        this.matches_amount_latest = this.matches_all.length;
    }
    this.matches_latest = this.matches_all.slice(0, this.matches_amount_latest);
};

/* Filtering matches_all array on
   matches against oponent team, and amount of matches.
   Sometimes total amount of matches could be smaller that wanted
   (fix later)*/
Team.prototype.init_matches_against = function() {
    var _this = this;
    for (var i = 0; i < this.matches_all.length; i++) {
        var match = this.matches_all[i];
        if (match.opposing_team_id === this.opposing_team_id) {
            _this.matches_against.push(match);
        }
    }
};

Team.prototype.init_matches_against_latest = function() {
    if (this.matches_amount_against_latest > this.matches_against.length) {
        this.matches_amount_against_latest = this.matches_against.length;
    }
    this.matches_against_latest = this.matches_against.slice(0, this.matches_amount_against_latest);
};

/* Filtering matches_all array for specific tournament */
Team.prototype.init_matches_tournament = function() {
    for (var i = 0; i < this.matches_all.length; i++) {
        var match = this.matches_all[i];
        if ( match.leagueid === this.tournament_id) {
            this.matches_tournament.push(match);
        }
    }
};

/* Pull match through ajax and put it in promise
   API allows to make 60 calls per minute,
   so getMatch should be executed only once per second */
Team.prototype.pull_match = function(match_id) {
    var _match;
    getSyncJSON('https://api.opendota.com/api/matches/' + match_id, function(match) {
        _match = match;
    });
    return _match;
};

/* Getting more details about each match in list */
Team.prototype.init_matches_detailed = function(matches_list, matches_detailed_list) {
    var _this = this;

    var willGoFurther = new Promise (
        function(resolve, reject) {
            if (matches_list.length <= 0) {
                resolve();
            }
            var getMatch = function(n) {
                setTimeout(function() {
                    var match = _this.pull_match(matches_list[n].match_id);
                    if (typeof matches_detailed_list[match.match_id] == 'undefined') {
                        matches_detailed_list[match.match_id] = match;
                    }
                    _this.matches_status++;
                    $('.status-' + _this.id).html(_this.matches_status);

                    if (n+1 === matches_list.length) {
                        resolve(n);
                    }
                }, 1200 * n);
            };

            for (var i = 0; i < matches_list.length; i++) {
                getMatch(i);
            }
        }
    );

    return willGoFurther;
};

/* Getting more details about latest matches */
Team.prototype.init_latest_matches_detailed = function() {
    return this.init_matches_detailed(this.matches_latest, this.matches_detailed);
};

/* Getting more details about latest matches against oponent */
Team.prototype.init_against_latest_matches_detailed = function() {
    return this.init_matches_detailed(this.matches_against_latest, this.matches_detailed);
};

/* Getting more details about tournaments matches */
Team.prototype.init_tournaments_matches_detailed = function() {
    return this.init_matches_detailed(this.matches_tournament, this.matches_detailed);
};

Team.prototype.get_match = function(matches_list, id) {
    return matches_list[id];
};



/* Calculate amount of first bloods team did for specific matches list */
Team.prototype.calculateFBs = function(matches) {
    var _this = this;
    var fbs = 0;
    matches.forEach(function(match) {
        var _match = _this.matches_detailed[match.match_id];
        for (var i = 0; i < _match.players.length; i++) {
            var player = _match.players[i];
            if (player.firstblood_claimed === 1) {
                if (player.isRadiant === match.radiant) {
                    fbs++;
                    // html_log('team_a.name won this ' + match.match_id);
                    return false;
                }
            }
        }
    });
    return fbs;
};

// Rewrite later
Team.prototype.calculateFBsAgainst = function() {
    var _this = this;
    var fbs = 0;
    var matches = this.matches_against_latest;
    matches.forEach(function(match) {
        var _match = _this.matches_detailed[match.match_id];
        for (var i = 0; i < _match.players.length; i++) {
            var player = _match.players[i];
            // Sometimes data is not fool
            if (player.firstblood_claimed === null) {
                _this.matches_amount_against_latest--;
                return false;
            }
            if (player.firstblood_claimed === 1) {
                if (player.isRadiant === match.radiant) {
                    fbs++;
                    // html_log('team_a.name won this ' + match.match_id);
                    return false;
                }
            }
        }
    });

    if (_this.matches_amount_against_latest == 0) {
        _this.matches_amount_against_latest = 2;
        return 1;
    } else {
        return fbs;
    }
};


/*
 * Execution
 * -----------------------------------------------------------------------------
 */
 $('#calculate').on('click', function(event) {
     event.preventDefault();
     $('.form').fadeOut(200);
     launch();
 });
 function launch() {
     // ipt = input
     var team_a_ipt =  findTeamId( $('#team_a').val() );
     var team_b_ipt = findTeamId( $('#team_b').val() );
     var matches_amount_latest_ipt = parseInt($('#matches_amount_latest').val());
     var matches_amount_against_latest_ipt = parseInt($('#matches_amount_against_latest').val());
     var tournament_id_ipt = findTeamId( $('#tournament_id').val() );

     var team_a = new Team({
                             id: team_a_ipt,
                             opposing_team_id: team_b_ipt,
                             matches_amount_latest: matches_amount_latest_ipt,              // Sets amount of total latest matches
                             matches_amount_against_latest: matches_amount_against_latest_ipt,  // Sets amount of matches against
                             tournament_id: tournament_id_ipt,
                          });
      var team_b = new Team({
                              id: team_b_ipt,
                              opposing_team_id: team_a_ipt,
                              matches_amount_latest: matches_amount_latest_ipt,             // Sets amount of total latest matches
                              matches_amount_against_latest: matches_amount_against_latest_ipt, // Sets amount of matches against
                              tournament_id: tournament_id_ipt,
                           });
     team_a.init().then(function() {
         team_a.tournament_fbs = team_a.calculateFBs(team_a.matches_tournament);
         team_a.against_fbs = team_a.calculateFBsAgainst();
         html_log(team_a.team_name + ' made ' + team_a.tournament_fbs + ' FBs in general in last ' + team_a.matches_tournament.length + ' matches.');
         html_log(team_a.team_name + ' made ' + team_a.against_fbs + ' FBs against ' + team_a.opposing_team_name + ' in last ' + team_a.matches_amount_against_latest + ' matches.');
         html_log('---------------');
         html_log('\n');

         team_b.init().then(function() {
             team_b.tournament_fbs = team_b.calculateFBs(team_b.matches_tournament);
             team_b.against_fbs = team_b.calculateFBsAgainst();
             html_log(team_b.team_name + ' made ' + team_b.tournament_fbs + ' FBs in general in last ' + team_b.matches_tournament.length + ' matches.');
             html_log(team_b.team_name + ' made ' + team_b.against_fbs + ' FBs against ' + team_b.opposing_team_name + ' in last ' + team_b.matches_amount_against_latest + ' matches.');
             html_log('---------------');
             html_log('\n');
             dr(team_a, team_b);
         });
     });
 }
