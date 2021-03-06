'use strict';

function getDlBttns() {
    var bttns = document.getElementsByClassName("btn btn-primary btn-xs");
    for (var i = 0; i < bttns.length; i++) {
        bttns[i].addEventListener("click", dlbttns);
    }
}

function getStreamBttns() {
    var bttns = document.getElementsByClassName("btn btn-purple btn-xs");
    for (var i = 0; i < bttns.length; i++) {
        bttns[i].addEventListener("click", streambttns);
    }
}

function streambttns() {
    $(this).prop('disabled', 'true');
    var _self = this;
    var player_url = $.get("/stream/" + $(this).val()).success(function (val) {
        if ($("#stream_bar").length === 0) {
            $("body").append('<div id="stream_bar" class="stream_inf">' +
                '<div class="panel panel-info">' +
                '<div class="panel-heading">' +
                '<button type="button" class="close" id="kill_stream">×</button>' +
                '<button type="button" class="minimize" id="minimize_stream">–</button>' +
                '<h3 class="panel-title"><span class="fa fa-file-audio-o"></span> Stream</h3>' +
                '</div>' +
                '<div class="panel-body-nopadding">' +
                '<iframe id="youtube_stream" src="' + val + '" frameborder="0" allowfullscreen></iframe>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>');
            if(window.innerWidth > 768) {
                $(".stream_inf").css('bottom', '-200px');
                $("#stream_bar").animate({bottom: '0'});
            }
            window.last_bttn = _self;
            $("#kill_stream").click(function () {
                $("#stream_bar").remove();
                $(window.last_bttn).removeAttr('disabled');
            });
            $("#minimize_stream").click(function () {
                if($(this).text() === "–") {
                    if(window.innerWidth <= 768) {
                        $("#stream_bar").css('bottom', '-180px');
                    } else {
                        $("#stream_bar").css('bottom', '-300px');
                    }
                $(this).text("⁺");
                    window.stream_minimized = true;
                } else {
                $("#stream_bar").css('bottom', '0px');
                $(this).text("–");
                    window.stream_minimized = false;
                }
            });
        } else {
            $(window.last_bttn).removeAttr('disabled');
            window.last_bttn = _self;
            $("#youtube_stream").attr('src', val);
        }
    }).error(function (err) {
    });
}

function dlbttns() {
    var val = $(this).val();
    $.ajax({
        url: '/dl',
        type: "POST",
        success: $(this).prop('disabled', 'true').text('Added'),
        data: {alname: val, id_sse: document.cookie.split(";")[0].split("=")[1]}
    });
}

function getInfoBttns() {
    var bttns = document.getElementsByClassName("btn btn-info btn-xs");
    for (var i = 0; i < bttns.length; i++) {
        bttns[i].addEventListener("click", moreInfoBttn);
    }
}

function moreInfoBttn() {
    var artist = $(this).val().split("-")[0];
    var album = $(this).val().split("-")[1];
    artist = artist.substring(0, artist.length - 1);
    album = album.substring(1, album.length);
    moreinfo(this, artist, album);
}

function moreinfo(bttn, artist, album) {
    var id = $(bttn).attr('id').split("-")[0];
    var row = document.getElementById(id);
    if ($(bttn).text().split(" ")[0] === "More") {
        $(bttn).text('Less info');
        row.removeAttribute('style');
        if ($(bttn).attr('id').split("-")[2] === "used") {
            return;
        }
        bttn.setAttribute('class', 'btn btn-info btn-xs active');
        var mrinf = $.getJSON("/more_info/" + artist + "/" + album, function (data) {
                var cover = document.getElementById(id + "-cover");
                var release = document.getElementById(id + "-release");
                var tag = document.getElementById(id + "-tags");
                var similar = document.getElementById(id + "-similar");
                var tracks = document.getElementById(id + "-tracks");
                $(release).find('i').remove();
                $(tag).find('i').remove();
                $(similar).find('i').remove();
                if (data.cover !== "") {
                    cover.setAttribute('src', data.cover);
                }
                $(release).append(data.release);
                for (i = 0; i < data.tags.length; i++) {
                    if (i === data.tags.length - 1) {
                        $(tag).append(data.tags[i]);
                    } else {
                        $(tag).append(data.tags[i] + ", ");
                    }
                }
                for (i = 0; i < data.similar_artists.length; i++) {
                    if (i === 3) {
                        $(similar).append('<br/>');
                    }
                    if (i === data.similar_artists.length - 1) {
                        $(similar).append('<a href="/results/' + data.similar_artists[i] + '">' + data.similar_artists[i] + '</a>');
                    } else {
                        $(similar).append('<a href="/results/' + data.similar_artists[i] + '">' + data.similar_artists[i] + "</a>, ");
                    }
                }
                for (var i = 0; i < data.track_list.length; i++) {
                    $(tracks).append("<tr><td>" + data.track_list[i] + "</td></tr>");
                }
                $(bttn).prop('id', id + "-button-used");
            })
            .fail(function (err) {
                console.log(err);
            });
    } else {
        $(bttn).text('More info');
        bttn.setAttribute('class', 'btn btn-info btn-xs');
        row.setAttribute('style', 'display: none;');
    }
}

function search() {
    $("#search_ex").keyup(function () {
        for (var i = 0; i < window.results_amount; i++) {
            if ($('#' + String(i) + '-min-row td:first').text().toLowerCase().indexOf($(this).val().toLowerCase()) === -1) {
                $('#' + String(i) + '-min-row').hide();
                $('#' + String(i)).hide();
                var button = $('#' + String(i) + '-button-used');
                $(button).text("More info");
                $(button).attr('class', 'btn btn-info btn-xs');
            } else {
                $('#' + String(i) + '-min-row').show();
            }
        }
    });
}

function more_bttn_l() {
    $("#more_bttn_l").on('click', function (e) {
        var _self = this;
        var start_val = parseInt($(this).val().split("/")[2]);
        var more_val = parseInt($(this).val().split("/")[1]);
        $(this).attr('class', 'btn-flat btn-link text-info center-block');
        $(this).empty().append('<span class="fa fa-spinner fa-pulse fa-2x">').blur();
        $.get($(this).val()).done(function (data) {
            $("#rslt_body").append(data);
            $(_self).attr('class', 'btn btn-primary center-block');
            $(_self).empty().append('Load more');
            more_val += 25;
            start_val += 25;
            $(_self).val("more/" + more_val + "/" + start_val);
            window.results_amount += 25;
            $("#search_ex").trigger('keyup');
            getallButtons();
        });
    });
}

function more_bttn_d() {
    $("#more_bttn_d").on('click', function (e) {
        var _self = this;
        var page = parseInt($(this).val().split("/")[1]);
        $(this).attr('class', 'btn-flat btn-link text-info center-block');
        $(this).empty().append('<span class="fa fa-spinner fa-pulse fa-2x">').blur();
        $.get($(this).val()).done(function (data) {
            $("#rslt_body").append(data);
            $(_self).attr('class', 'btn btn-primary center-block');
            $(_self).empty().append('Load more');
            page += 1;
            $(_self).val("more/" + page);
            window.results_amount += 50;
            $("#search_ex").trigger('keyup');
            getallButtons();
        });
    });
}

function getallButtons() {
    getDlBttns();
    getInfoBttns();
    getStreamBttns();
    search();
}

window.addEventListener("DOMContentLoaded", function () {
    window.stream_minimized = false;
    window.results_amount = 50;
    more_bttn_l();
    more_bttn_d();
    getDlBttns();
    getInfoBttns();
    getStreamBttns();
    search();
    window.addEventListener('resize', function () {
        if(window.stream_minimized === true && window.innerWidth <= 768) {
         $("#stream_bar").css('bottom', '-180px');
        }
        if(window.stream_minimized === true && window.innerWidth > 768) {
         $("#stream_bar").css('bottom', '-300px');
        }
    });
});