$.getJSON(
    'https://api.opendota.com/api/leagues',
    function( data ) {
            var table = $( document.createElement("TABLE") );
            table.addClass('table');
            var tableHTML = '<thead>' +
                                '<tr>' +
                                    '<th scope="col">#</th>' +
                                    '<th scope="col">Tournament ID</th>' +
                                    '<th scope="col">Tournament Name</th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody>';
            for (var i = 0; i < data.length; i++) {
                var tournament = data[i];
                var tableRow = '<tr>'+
                                    '<th scope="row">' + i + '</th>' +
                                    '<td>' + tournament.leagueid + '</td>' +
                                    '<td>' + tournament.name + '</td>' +
                               '</tr>';
               tableHTML += tableRow;


            }
            tableHTML += '</tbody>';
            table.html(tableHTML);
            $('.teams-list').append(table);
    }
);
