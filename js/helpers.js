/*
 * Helpers and Additional
 * ----------
 */

// Custom jQuery getJson funciton, for async false
function getSyncJSON(url, callback) {
    $.ajax({
        dataType: "json",
        url: url,
        success: callback,
        async: false,
    });
}


// Globalb variable for list of all teams
var teamsDB = [];
var teams_choises = [];
getSyncJSON('https://api.opendota.com/api/teams', function(teams) {
    teams.forEach(function(team) {
        if ( team.name !== 'team liquid' ) {
            teamsDB.push(team);
            teams_choises.push(team.name);
        }
    });
    html_log('Teams DB is initialized.');
    html_log('---------------');
});

var findTeamId = function( team_name ) {
    var id = 0;
    teamsDB.forEach(function(team) {
        if (team.name === team_name) {
            id = team.team_id;
            return false;
        }
    });
    return id;
};

var tournamentsDB = [];
var tournament_choises = [];
getSyncJSON('https://api.opendota.com/api/leagues', function(tournaments) {
    tournaments.forEach(function(tournament) {
        tournamentsDB.push(tournament);
        tournament_choises.push(tournament.name);
    });
    html_log('Tournaments DB is initialized.');
    html_log('---------------');
});

var findTournamentId = function( tournament_name ) {
    var id = 0;
    tournamentsDB.forEach(function(tournament) {
        if (tournament.name === tournament_name ) {
            id = tournament.leagueid;
            return false;
        }
    });
    return id;
};


/* GUI */

// Log to html
function html_log( data ) {
    var log = "<p>" + data + "</p>";
    $('.console').append(log);
}

// Teams autocompletes
$('#team_a').autoComplete({
    minChars: 1,
    source: function(term, suggest){
        term = term.toLowerCase();
        var choices = teams_choises;
        var matches = [];
        for (i=0; i<choices.length; i++)
            if (~choices[i].toLowerCase().indexOf(term)) matches.push(choices[i]);
        suggest(matches);
    }
});
$('#team_b').autoComplete({
    minChars: 1,
    source: function(term, suggest){
        term = term.toLowerCase();
        var choices = teams_choises;
        var matches = [];
        for (i=0; i<choices.length; i++)
            if (~choices[i].toLowerCase().indexOf(term)) matches.push(choices[i]);
        suggest(matches);
    }
});

// Tournaments autocomplete
$('#tournament_id').autoComplete({
    minChars: 1,
    source: function(term, suggest){
        term = term.toLowerCase();
        var choices = tournament_choises;
        var matches = [];
        for (i=0; i<choices.length; i++)
            if (~choices[i].toLowerCase().indexOf(term)) matches.push(choices[i]);
        suggest(matches);
    }
});



/* DR(T) core */
/* FORMULA */
//
// 44.8    |   50
// 1       |   1.116
//
// 44.8     50      94.8
// 48.3     52.7    100
//
// (48.3 * .57) 27.531 + 21.5 = 49.031
// (52.7 * .57) 30.039 + 21.5 = 51.890
// var team_al = {
//     tournament_did_fb: 6,
//     tournament_total_games: 13,
//     against_fbs: 9,
//     against_total_games: 13,
// };
//
// var team_be = {
//     tournament_did_fb: 17,
//     tournament_total_games: 28,
//     against_fbs: 4,
//     against_total_games: 13,
// };
var dr = function(team_al, team_be) {
    var a_success_tournament_rate = (team_al.tournament_fbs * 100) / team_al.matches_tournament.length;
    var b_success_tournament_rate = (team_be.tournament_fbs * 100) / team_be.matches_tournament.length;

    var ab_success_tournament_total = a_success_tournament_rate + b_success_tournament_rate;
    var a_success_tournament_rate_dr = (a_success_tournament_rate * 100) / ab_success_tournament_total;
    var b_success_tournament_rate_dr = 100 - a_success_tournament_rate_dr;

    var a_success_against_rate = team_al.against_fbs * 100 / team_al.matches_amount_against_latest;
    var b_success_against_ratge = 100 - a_success_against_rate;

    var a_dr = (a_success_tournament_rate_dr * 0.57) + (a_success_against_rate * 0.47);
    a_dr = Math.round(a_dr * 100) / 100;
    var b_dr = 100 - a_dr;

    html_log('<span class="result_team_a">' + team_al.team.name + '</span>' + '/' + '<span class="result_team_b">' + team_be.team.name + '</span>');
    html_log('<span class="result_team_a">' + a_dr + '</span>' + '/'  + '<span class="result_team_b">' + b_dr + '</span>');
};
