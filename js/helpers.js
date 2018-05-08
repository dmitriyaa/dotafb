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
getSyncJSON('https://api.opendota.com/api/teams', function(teams) {
    teams.forEach(function(team) {
        teamsDB.push(team);
    });
    html_log('Teams DB is initialized.');
    html_log('---------------');
});

var tournamentsDB = [];
getSyncJSON('https://api.opendota.com/api/leagues', function(tournaments) {
    tournaments.forEach(function(tournament) {
        tournamentsDB.push(tournament);
    });
    html_log('Tournaments DB is initialized.');
    html_log('---------------');
});


/* GUI */

// Log to html
function html_log( data ) {
    var log = "<p>" + data + "</p>";
    $('.console').append(log);
}

// set options in index
teamsDB.forEach(function(team) {
    var option = '<option value="' + team.team_id + '">' + team.name + '</option>';
    $('#team_a').append(option);
    $('#team_b').append(option);
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
    var b_dr = 100 - a_dr;

    html_log('<span class="result_team_a">' + team_al.team_name + '</span>' + '/' + '<span class="result_team_b">' + team_be.team_name + '</span>');
    html_log('<span class="result_team_a">' + a_dr + '</span>' + '/'  + '<span class="result_team_b">' + b_dr + '</span>');
};
