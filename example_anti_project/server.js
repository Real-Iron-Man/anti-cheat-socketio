const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server) // need to attach to current server running

const anti_cheat = require('anticheat-socketio')

// Express example : 
app.use(express.static(__dirname  + '/public/'))
app.set('view engine', 'html')
app.set('views', __dirname + '/views/')

var is_socket_debug_on = true;
var is_interval_heart_beat_on = false;

app.get('/', function(req, res){
    res.sendFile(__dirname  + '/views/test.html')
});


io.on('disconnect', function(socket){
    anti_cheat.disconnect_socket_anticheat(socket);
})

io.on('connect', function(socket){

    console.dir("socket connected...");

    anti_cheat.connect_socket_anticheat(socket);

    if(is_interval_heart_beat_on){
        // Integrity heart-beat : 
        setInterval(function(){

            var is_id_ok_check = anti_cheat.is_connected_id_integrity_ok(socket);
            if(!is_id_ok_check){
                return;
            };

        }, 5000)
    };


    var initial_integrity_package = anti_cheat.init_anticheat_join_package(socket);
    socket.emit("init_antiC", initial_integrity_package);

    // Unique game room  :
    var game_id = 1;
    socket.join('anticheat-' + game_id);

    socket.on("click_event", async function(){

        console.dir("click_event");

        var update_req_timestamp = await anti_cheat.update_event_timestamp(socket);
        var is_click_ok = await anti_cheat.is_socket_event_too_quick(socket);

        var socket_package = {
            "value" : is_click_ok
        };

        console.dir("click_event value = " + is_click_ok);

        // Handle regular events here :
        socket.emit("got_click", socket_package);


    });

    socket.on("move_event", function(data){

        if(is_socket_debug_on){
            console.dir("move_event data = " + JSON.stringify(data));
        };

        if(!data){
            return;
        };

        if(data.event == 'up'){

            var player_index = anti_cheat.find_player_within_players(socket);
            if(!player_index > -1){
                return;
            };

            // To do (minimum time delay between actions i.e. cooldown (CD) period)
            var antiC_package = {
                "min_delta_t_ms" : 200 // CD In millisecond
            };

            anti_cheat.update_player_position('up', socket, antiC_package);    // Update server-side data (for server auth.)

            var socket_package = {
                'event' : 'up',
                'socket' : socket
            };

            socket.emit('update_player_data', socket_package);    // Update client-side data

        };
        
        var is_valid_move = anti_cheat.is_move_event_ok(data);

        if(!is_valid_move){
            return;
        };

    });

    socket.on("collect_item_event", function(data){

        if(is_socket_debug_on){
            console.dir("collect_item_event data = " + JSON.stringify(data));
        };

        var is_valid_collect_item = anti_cheat.is_item_ok(data);
        if(!is_valid_collect_item){
            return;
        };
        
    })

})

server.listen(8080, function(){
    console.dir("Server live on 8080");
});