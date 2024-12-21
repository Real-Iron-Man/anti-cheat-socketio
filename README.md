# anti-cheat-socketio
<br/>
<br/>

[![npm version](https://img.shields.io/npm/v/anticheat-socketio.svg)](https://npmjs.org/package/anticheat-socketio 'View this project on NPM')
[![npm downloads](https://img.shields.io/npm/dm/anticheat-socketio)](https://www.npmjs.com/package/anticheat-socketio)
<p style="font-size: 2vw; color:gray;">above header help from <a href="https://github.com/expressjs/express" style="font-size: 2vw; color:gray;">here</a>

<br/>
<br/>

<div>
<img src="Controller_front_view.png" style="width:10vw">
</div>
 Server-side anti-cheat library for socketIO games

 <br/>

 gitHub repo here <a href="https://github.com/Real-Iron-Man/anticheat-socketio">here</a>

<br/>
<br/>

# History
    Created by Stark for the game studio he created

<br/>
<br/>
<br/>

# Made For  : 

    SocketIO library "npm i socketio"
    https://www.npmjs.com/package/socketio

<br/>
<br/>
<br/>

# Getting Started : 

 Install package : 

    npm i anticheat-socketio

<br/>

 Running example project : 
 
    nodemon server.js
<br/>
<br/>

# Usage : 

```js
const anti_cheat = require('anticheat-socketio')

io.on('connect', function(socket){

    anti_cheat.connect_socket_anticheat(socket);

    var initial_integrity_package = anti_cheat.init_anticheat_join_package(socket);

    // Unique game room  :
    var game_id = 1;
    socket.join('anticheat-' + game_id);

    socket.emit("init_antiC", initial_integrity_package);

    socket.on("click_event", function(data){

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

            var antiC_package = {
                "min_delta_t_ms" : 200 // In millisecond
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

        is_valid_collect_item = anti_cheat.is_item_ok(data);
        if(!is_valid_move){
            return;
        };
        
    })

})



io.on('disconnected', function (socket) {
    anti_cheat.disconnect_socket_anticheat(socket);
})
```

<br/>
<br/>
<br/>


# Overall Goals : 

    - Efficient event-driven integrity events with minimum latency
    
    - pass in game config to configure acceptible game mechanics

    - configure overall settings (ex. max # of concurrent connections, time delays and more)


# To do / doing : 

    🔳 example project with anti-cheat

# Features : 
    🔳 Time between requests
    ✅ # of concurrent connections (socket Vs. address)
    🔳 Server-side update events : 
        ✅ position
    🔳 Client-side update events : 
        ✅ position (example project)
    ✅ Player clicked off from window : 
        ✅ Check new socket ID (see s_id)
    🔳 move algorithms :
        🔳 Linear slope (still testing)
        🔳 new x vs. last x
        🔳 new y vs. last y
        🔳 new z vs. last z
    🔳 items check : 
        ✅ is_item_ok
        🔳 Is item value ok


<br/>
<br/>
<br/>

# To Detect Goals : 
 - number of concurrent connections
 - initial join package
 - events, movement, items and IO package anomalies
 - more arriving soon

<br/>
<br/>
<br/>

# Naming Convention : 
snake_case (yes for all aspects front-end, back-end, packages)

Reasons why : 

1) Readability

2) reduced context-shifting and mental strain


Why? see <a href="https://stackoverflow.com/questions/21503430/snake-case-or-camelcase-in-node-jshttps://www.cs.kent.edu/~jmaletic/papers/ICPC2010-CamelCaseUnderScoreClouds.pdf">here</a>, <a href="https://stackoverflow.com/questions/33094418/why-use-camel-case-for-js-and-snake-case-for-your-db">here</a> , and <a href="https://www.cs.kent.edu/~jmaletic/papers/ICPC2010-CamelCaseUnderScoreClouds.pdf">here</a>


<br/>
<br/>
<br/>

Sources : 
<a href="https://expressjs.com/en/5x/api.html">express template</a>
<a href="https://socket.io/docs/v4/client-installation/">client IO</a>
<a href="https://socket.io/docs/v4/server-instance/">server IO</a>