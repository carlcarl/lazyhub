/*jslint browser:true */
/*jslint es5: true */
/*global $, jQuery, alert, console*/
$(document).ready(function () {
    "use strict";
    /*
    var i, tableRow, tableHead;
    tableHead = $('<tr><th>#</th><th>Repo</th><th>Last updated time</tr>');
    $('#repo-table').html(tableHead);
    for (i = 0; i < 10; i += 1) {
        tableRow = $('<tr><td>' + (i + 1) + '</td><td><a>123</a></td><td>456</td></tr>');
        $('#repo-table').append(tableRow);
        tableRow.addClass('animated fadeInDown');
    }
    */
    $('#github-form').on('submit', function (event) {
        $.ajax(
            {
                url: '/',
                type: 'POST',
                data: $(this).serialize()
            }
        ).done(function (data) {
            // console.log(data);
            var tableHead, tableRow,
                prop, i, len, errorFlag, inputGroup, errorClass,
                rowNum, rowRepo, rowDate, repoLink;
            errorFlag = false;
            errorClass = 'has-error';
            for (prop in data.error) {
                if (data.error.hasOwnProperty(prop)) {
                    inputGroup = '#' + prop + '-group';
                    if (data.error[prop]) {
                        $(inputGroup).addClass(errorClass);
                        errorFlag = true;
                    } else if ($(inputGroup).hasClass(errorClass)) {
                        $(inputGroup).removeClass(errorClass);
                    }
                }
            }
            if (errorFlag) {
                console.log('Field error');
                return;
            }

            tableHead = $('<tr><th width="25%">#</th><th>Repo</th><th width="25%">Last updated time</tr>');
            $('#repo-table').html(tableHead);
            for (i = 0, len = data.data.length; i < len; i += 1) {
                rowNum = $('<td>' + (i + 1) + '</td>');
                repoLink = $('<a></a>');
                repoLink.prop('href', data.data[i].html_url);
                repoLink.prop('target', data.data[i].full_name);
                repoLink.text(data.data[i].full_name);
                rowRepo = $('<td></td>').append(repoLink);
                rowDate = $('<td>' + data.data[i].pushed_at + '</td>');
                tableRow = $('<tr></tr>');
                tableRow.append(rowNum).append(rowRepo).append(rowDate);
                $('#repo-table').append(tableRow);
                tableRow.addClass('animated fadeInDown');
            }
            console.log('Query success');
        }).fail(function () {
            alert('Query fail');
        });
        event.preventDefault();
        return false;
    });
    $(document).ajaxStart(function () {
        $('#loading').removeClass('invisible');
        $('#submit').prop('disabled', 'disabled');
    });
    $(document).ajaxComplete(function () {
        $('#loading').addClass('invisible');
        $('#submit').removeAttr('disabled');
    });
   
});
