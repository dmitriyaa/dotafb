$.getJSON(
    'https://api.opendota.com/api/teams',
    function( data ) {
            var table = $( document.createElement("TABLE") );
            table.addClass('table');
            var tableHTML = '<thead>' +
                                '<tr>' +
                                    '<th scope="col">#</th>' +
                                    '<th scope="col">Team ID</th>' +
                                    '<th scope="col">Team Name</th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody>';
            for (var i = 0; i < data.length; i++) {
                var team = data[i];
                var tableRow = '<tr>'+
                                    '<th scope="row">' + i + '</th>' +
                                    '<td>' + team.team_id + '</td>' +
                                    '<td>' + team.name + '</td>' +
                               '</tr>';
               tableHTML += tableRow;


            }
            tableHTML += '</tbody>';
            table.html(tableHTML);
            $('.teams-list').append(table);
    }
);
