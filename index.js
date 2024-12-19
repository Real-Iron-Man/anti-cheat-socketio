var array_to_catch_bad_addresses = [];
console.dir("Started : anti-cheat-socketIO ... ")

var is_socket_io_debug_on = false;

module.exports = {

    connect_socket_anticheat : async function(socket){
        increase_socket_connection_count_tracker(socket);
    },

    disconnect_socket_anticheat : async function(socket){
        decrease_socket_connection_count_tracker(socket);
    },

    init_anticheat_join_package : async function(socket){
        
        var inital_integrity_package = {
            "socket_id" : socket.id
        };

        return inital_integrity_package
    },

    is_move_event_ok : async function(data){

        var slope_past  = data.y_0 / data.x_0
        var slope_prior = data.y_1 / data.x_1
        var slope_now   = data.y_2 / data.x_2

        if(slope_past == slope_prior == slope_now){
            return false;
        };

        try {
            return true;
        } catch (error) {
            return undefined;
        };
        
    },

    is_item_ok : async function(data, list_items){

        var item_index = list_items.map(function(an_item){
            an_item.item_id;
        }).indexOf(data.item_id)

        if(item_index == -1){
            return false;
        };

        return true;
        
    },

    is_socket_cheating_via_too_quick : async function(socket){

        try {

            var index_of_unique_socket = find_id_from_connected(socket);

            if(!index_of_unique_socket){
                return; // break early if no socket with unique id found
            }

            var last_req_datetime = array_to_catch_bad_addresses[index_of_unique_socket].last_req;
            var current_req_datetime = new Date();
            var delta_time = (current_req_datetime - last_req_datetime)
            console.log(" Delta time for socket request = " + delta_time);
    
            if (delta_time < 1) {
                console.log("Player is cheating with delta time = " + delta_time);
                return true;
            } else {
                return false;
            };
    
        } catch (error) {
            return true;
        };

    },


    update_number_requests_made_during_time_period : async function(socket){ // Main custom rate limiter (still testing)

        try {

            var index_of_unique_socket = find_id_from_connected(socket);

            if(!index_of_unique_socket){
                add_new_id_to_connection_array(socket);
                return; // Break out early if a new ID address
            };

            if (is_socket_io_debug_on) {
                console.dir("🟢 update_number_requests_made_during_time_period ... " + index_of_unique_socket);
            };

            var maximum_requests_per_time_period = 10;
            var maximum_time_period_minutes = 1;

            var last_req_datetime = array_to_catch_bad_addresses[index_of_unique_socket].last_req;
            
            if(!last_req_datetime){ // First time loading page, no last request datetime
                array_to_catch_bad_addresses[index_of_unique_socket].last_req = new Date();
                return;
            }else{

                var current_req_datetime = new Date();
                var delta_time = (current_req_datetime - last_req_datetime)
                console.log("Check Delta time for socket request for custom rate limiter, delta_time = " + delta_time);

                var current_running_total_reqs = address_number_current_requests(socket);
                
                if(delta_time <= maximum_time_period_minutes && (current_running_total_reqs >= maximum_requests_per_time_period)){
                    console.log("Hit request limit");
                }

            }

        } catch (error) {
            return undefined;
        }

    }

}

function find_id_from_connected(socket){

    try {

        var current_socket_address = socket.request.connection.remoteAddress;

        var index_of_unique_socket = array_to_catch_bad_addresses.map(function (x) {
            return x.address
        }).indexOf(current_socket_address)

        return index_of_unique_socket;

    } catch (error) {
        return undefined;
    };

   
};

function add_new_id_to_connection_array(socket){

    var current_socket_address = socket.request.connection.remoteAddress;
    
    var connect_package = {
        "address": current_socket_address,
        "num_req": 1,
        "num_connections": 1,
        "last_req": "",
        "current_req_timestamp": new Date(),
        "cheating_flag": false
    };

    array_to_catch_bad_addresses.push(connect_package);

};

function address_number_current_requests(socket){

    var index_of_socket_id = find_id_from_connected(socket);
    if(index_of_socket_id > -1){
        return array_to_catch_bad_addresses[index_of_socket_id].num_req
    }else{
        console.log(" Error getting current number of requests for socket...");
        return undefined;
    };
};

async function increase_socket_connection_count_tracker(socket) {

    if (is_socket_io_debug_on) {
        console.log(" increase_socket_connection_count_tracker ... ");
    };

    try {

        var current_socket_address = socket.request.connection.remoteAddress;

        var current_datetime = new Date();

        var connect_package = {
            "address": current_socket_address,
            "num_req": 1,
            "num_connections": 1,
            "last_req": current_datetime, // Set the initial values so it can be compared to the new current request timestamp later
            "current_req_timestamp": current_datetime,
            "cheating_flag": false
        };

        var index_of_unique_socket = find_id_from_connected(socket);

        if (index_of_unique_socket == -1) {
            array_to_catch_bad_addresses.push(connect_package);
        } else {

            array_to_catch_bad_addresses[index_of_unique_socket].num_req++

            array_to_catch_bad_addresses[index_of_unique_socket].num_connections++
            var num_connections = array_to_catch_bad_addresses[index_of_unique_socket].num_connections;

            if (num_connections > 1) {
                array_to_catch_bad_addresses[index_of_unique_socket].cheating_flag = true;
            };

            var is_too_quick = is_socket_cheating_via_too_quick(socket, index_of_unique_socket);

        };

    } catch (error) {

        if (is_socket_io_debug_on) {
            console.log("❌ Catch Error socket error = " + error);
        };

    };

};

async function decrease_socket_connection_count_tracker(socket) {

    try {
    
        var index_of_unique_socket = find_id_from_connected(socket);

        if (is_socket_io_debug_on) {
            console.dir("🟢 index_of_unique_socket to decrease # of connections = " + index_of_unique_socket);
        };

        if (index_of_unique_socket > -1) {
            if (array_to_catch_bad_addresses[index_of_unique_socket].num_connections > 0) {
                array_to_catch_bad_addresses[index_of_unique_socket].num_connections--
            };
        };

    } catch (error) {

        if (is_socket_io_debug_on) {
            console.log("❌ Error : updating decrase socket count, error = " + error);
        };

    };

};