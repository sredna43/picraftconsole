var socket = io.connect('http://' + document.domain + ':' + location.port)

var logged_in = false

socket.on('connect', function() {
    socket.emit('my event', {
        data: 'User Connected'
    })
    var form = $('#cmd-form').on('submit', function(e) {
        e.preventDefault()
        let command = $('#cmd').val().toLowerCase()
        if (logged_in) {
            socket.emit('command', {
                data: command,
            })
            $('#log').append('<li class="list-group-item list-group-item-success"><b style="color: #000">' + '>' + '</b> ' + command + '</li>')
        } else {
            $('#log').append('<li class="list-group-item list-group-item-danger"><b style="color: #000">></b> Error: Not logged in! Check the config/config.json file</li>')
        }
        $('#console').scrollTop($('#console')[0].scrollHeight);
        console.log($('#console')[0].scrollHeight)
        $('#cmd').val('').focus()
    })
})

socket.on('response', function(msg) {
    if (typeof msg.response !== 'undefined' && !msg.response.includes("Unknown or incomplete command")) {
        $('#log').append('<li class="list-group-item list-group-item-primary"><b style="color: #000">' + '<' + '</b> ' + msg.response + '</li>')
    } else if (typeof msg.response !== 'undefined' && msg.response.includes("Unknown or incomplete command")) {
        $('#log').append('<li class="list-group-item list-group-item-danger"><b style="color: #000">' + '<' + '</b> ' + msg.response + '</li>')
    }
})
socket.on('login', function(msg) {
    console.log(msg)
    if (msg.logged_in) {
        logged_in = true
        $('#status-icon').html('vpn_key')
        $('#status-text').html(`Logged into ${msg.host}:${msg.port}`)
    } else {
        $('#status-icon').html('error')
        $('#status-text').html(`Couldn't log into: ${msg.host}:${msg.port}`)
    }
    // $('#banner').append('Logged in: ' + msg.data)
})

//enable tooltips
$(function() {
    $('[data-toggle="tooltip"]').tooltip()
})

$(document).ready(function() {
    $('#reload-config').click(function() {
        socket.emit('reload config')
    })
    $('#clear-console').click(function() {
        $('#log').html('')
    })
})