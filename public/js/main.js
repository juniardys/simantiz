define(["js/sockets","js/ui"],function(socket,ui){
return {
    initialize:function(_args){
        var user = _args[0];
        var room = _args[1];
        var roomstatus = _args[2];

        socket.join(room,user);

        socket.listen(ui);

        $(document).ready(function(){
            ui.initialize(user,roomstatus);
            ui.listen(socket, function(type,data){
                socket.emit(type,data);
            });
        });
    }
};
});
