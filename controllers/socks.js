var exports = module.exports = {};
var gameconfig = require('./../config/game');
var log = require('./../helper/log');

exports.listen = function(socket,io,rooms,users){

    // Socket Join
    socket.on('join',function(roomid,userid){
        socket.join(roomid);
        log.print('User joined room', 'room', roomid, users.user[userid].email, socket.id);
        var status = rooms.checkStatus(roomid);
        var room = rooms.room[roomid];

        // Room status active
        if(status=='y'){
            io.to(roomid).emit('room active', rooms.listUsers(roomid));
            log.print("Emit room active to player inside room", "emit", roomid);
            totalUser = rooms.totalUser(roomid);
            if(totalUser == 1) {
                if (room.saveGame) {
                    io.to(socket.id).emit('update loader', true); // show loader
                } else {
                    io.to(socket.id).emit('end game');
                    log.print("Game ended!", "gameplay", roomid, users.user[userid].email, socket.id);
                }
            } else if(rooms.room[roomid].firstplay){
                rooms.startGame(roomid, io, rooms);
            }
        }
    });

    // Get Highlight
    socket.on('getHighlight', function(roomid){
        log.print('get highlight', 'gameplay', roomid, '', socket.id);
        user = rooms.listUsers(roomid);
        
        for (var i=0;i<user.length;i++) {
            var stat = users.getStatistics(user[i].id, rooms);
            io.to(roomid).emit('update highlight', stat);
            log.print('Send highlight', 'gameplay', roomid);
        }
    });

    // Get Statistics
    socket.on('get statistics', function(userid) {
        log.print('get statistics', 'gameplay', users.user[userid].roomid, userid, socket.id);
        var stat = users.getStatistics(userid, rooms);
        io.to(users.user[userid].roomid).emit('update statistics ' + userid, stat);
    })

    // Buy Warehouse
    socket.on('warehouse',function(data){
        log.print('Request buy warehouse', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        if (!rooms.isUserTurn(data.roomid, data.userid)) return;
        data.dt = parseInt(data.dt);
        if (isNaN(data.dt) || data.dt <= 0) return;
        var buyed = users.buyWarehouse(data.userid,data.dt);
        if (buyed) {
            log.print('Buy ' + data.dt + ' warehouse', 'gameplay', data.roomid, users.user[data.userid].email);
            var stat = users.getStatistics(data.userid, rooms);
            io.to(data.roomid).emit('update highlight', stat);
            io.to(data.roomid).emit('update statistics ' + data.userid, stat);
            log.print('Send highlight (buy warehouse)', 'gameplay', data.roomid);
            rooms.send_all_player_money(data.roomid, io);
            log.print('Send all player money (buy warehouse)', 'gameplay', data.roomid);
            io.to(data.roomid).emit('warehouse return', stat);
            log.print('Send Response Buy Warehouse (buy warehouse)', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
            rooms.execNextTurn(data.roomid, io, rooms);
        } else { 
            io.to(socket.id).emit('insufficient balance');
            log.print('Insufficient balance while (buy Warehouse)', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        }
    });

    // Buy Handling Equipment
    socket.on('handlingeqp',function(data){
        log.print('Request Buy Handling Equipment', 'gameplay', data.roomid, data.userid, socket.id);
        if (!rooms.isUserTurn(data.roomid, data.userid)) return;
        data.dt = parseInt(data.dt);
        if (isNaN(data.dt) || data.dt <= 0) return;
        var buyed = users.buyHandlingEQP(data.userid,data.dt);
        if (buyed) {
            var stat = users.getStatistics(data.userid, rooms);
            log.print('Buy ' + data.dt + ' Handling Equipment', 'gameplay', data.roomid, users.user[data.userid].email);
            io.to(data.roomid).emit('update highlight', stat);
            io.to(data.roomid).emit('update statistics ' + data.userid, stat);
            log.print('Send highlight (Buy Handling Equipment)', 'gameplay', data.roomid);
            rooms.send_all_player_money(data.roomid, io);
            log.print('Send all player money (Buy Handling Equipment)', 'gameplay', data.roomid);
            io.to(data.roomid).emit('handlingeqp return', stat);
            log.print('Response Buy Handling Equipment', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
            rooms.execNextTurn(data.roomid, io, rooms);
        } else {
            io.to(socket.id).emit('insufficient balance');
            log.print('Insufficient balance while (buy Handling Equipment)', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        }
    });

    // Buy Raw Material
    socket.on('rawmaterial',function(data){
        log.print('Request Buy Raw Material', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        if (!rooms.isUserTurn(data.roomid, data.userid)) return;
        data.dt = parseInt(data.dt);
        if (isNaN(data.dt) || data.dt <= 0) return;
        var buyed = users.buyMaterial(data.userid,data.dt);
        if (buyed) {
            log.print('Buy ' + data.dt + ' Raw Material', 'gameplay', data.roomid, users.user[data.userid].email);
            var stat = users.getStatistics(data.userid, rooms);
            io.to(data.roomid).emit('update highlight', stat);
            io.to(data.roomid).emit('update statistics ' + data.userid, stat);
            log.print('Send highlight (buy Raw Material)', 'gameplay', data.roomid);
            rooms.send_all_player_money(data.roomid, io);
            log.print('Send all player money (buy Raw Material)', 'gameplay', data.roomid);
            io.to(data.roomid).emit('rawmaterial return', stat);
            log.print('Response Buy Raw Material', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
            rooms.execNextTurn(data.roomid, io, rooms);
        } else {
            io.to(socket.id).emit('insufficient balance');
            log.print('Insufficient balance while (buy Raw Material)', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        }
    });

    // Buy Factory
    socket.on('factory',function(data){
        log.print('Request Buy Factory', 'gameplay', data.roomid, data.userid, socket.id);
        if (!rooms.isUserTurn(data.roomid, data.userid)) return;
        data.dt = parseInt(data.dt);
        if (isNaN(data.dt) || data.dt <= 0) return;
        var buyed = users.buyFactory(data.userid,data.dt);
        if (buyed) {
            log.print('Buy ' + data.dt + ' Factory', 'gameplay', data.roomid, users.user[data.userid].email);
            var stat = users.getStatistics(data.userid, rooms);
            io.to(data.roomid).emit('update highlight', stat);
            io.to(data.roomid).emit('update statistics ' + data.userid, stat);
            log.print('Send highlight (Buy Factory)', 'gameplay', data.roomid);
            rooms.send_all_player_money(data.roomid, io);
            log.print('Send all player money (Buy Factory)', 'gameplay', data.roomid);
            io.to(data.roomid).emit('factory return', stat);
            log.print('Response Buy Factory', 'gameplay', data.roomid);
            rooms.execNextTurn(data.roomid, io, rooms);
        } else {
            io.to(socket.id).emit('insufficient balance');
            log.print('Insufficient balance while (buy Factory)', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        }
    });

    // Buy Machine Big
    socket.on('machinebig',function(data){
        log.print('Request Buy Big Machine', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        if (!rooms.isUserTurn(data.roomid, data.userid)) return;
        data.dt = parseInt(data.dt);
        if (isNaN(data.dt) || data.dt <= 0) return;
        if (!(users.user[data.userid].factory.getTotal() > 0)) {
            io.to(socket.id).emit('toast', 'Buy Factory First!');
            log.print("Can\'t buy big machine because hasn't bought Factory", 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
            return;
        }
        var buyed = users.buyMachineBig(data.userid,data.dt);
        if(buyed){
            log.print('Buy ' + data.dt + ' Big Machine', 'gameplay', data.roomid, users.user[data.userid].email);
            var stat = users.getStatistics(data.userid, rooms);
            io.to(data.roomid).emit('update highlight', stat);
            io.to(data.roomid).emit('update statistics ' + data.userid, stat);
            log.print('Send highlight (Buy Big Machine)', 'gameplay', data.roomid);
            rooms.send_all_player_money(data.roomid, io);
            log.print('Send all player money (Buy Big Machine)', 'gameplay', data.roomid);
            io.to(data.roomid).emit('machinebig return', stat);
            log.print('Response Buy Factory', 'gameplay', data.roomid);
            rooms.execNextTurn(data.roomid, io, rooms);
        } else {
            io.to(socket.id).emit('insufficient balance');
            log.print('Insufficient balance while buy (Big Machine)', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        }
    });

    // Buy Machine Small
    socket.on('machinesmall',function(data){
        log.print('Request Buy Small Machine', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        if (!rooms.isUserTurn(data.roomid, data.userid)) return;
        data.dt = parseInt(data.dt);
        if (isNaN(data.dt) || data.dt <= 0) return;
        if (!(users.user[data.userid].factory.getTotal() > 0)) {
            io.to(socket.id).emit('toast', 'Buy Factory First!');
            log.print("Can\'t buy small machine because hasn't bought Factory", 'gameplay', data.roomid, users.user[data.userid].email);
            return;
        }
        var buyed =  users.buyMachineSmall(data.userid,data.dt);
        if(buyed){
            log.print('Buy ' + data.dt + ' Small Machine', 'gameplay', data.roomid, users.user[data.userid].email);
            var stat = users.getStatistics(data.userid, rooms);
            io.to(data.roomid).emit('update highlight', stat);
            io.to(data.roomid).emit('update statistics ' + data.userid, stat);
            log.print('Send highlight (Buy Small Machine)', 'gameplay', data.roomid);
            rooms.send_all_player_money(data.roomid, io);
            log.print('Send all player money (Buy Small Machine)', 'gameplay', data.roomid);
            io.to(data.roomid).emit('machinesmall return', stat);
            log.print('Response Buy Small Machine', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
            rooms.execNextTurn(data.roomid, io, rooms);
        } else {
            io.to(socket.id).emit('insufficient balance');
            log.print('Insufficient balance while (buy Small Machine)', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        }
    });

    // Hire Worker
    socket.on('worker',function(data){
        log.print('Request hire worker', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        if (!rooms.isUserTurn(data.roomid, data.userid)) return;
        data.dt = parseInt(data.dt);
        if (isNaN(data.dt) || data.dt <= 0) return;
        if (!(users.user[data.userid].factory.getTotal() > 0)) {
            io.to(socket.id).emit('toast', 'Buy Factory First!');
            log.print("Can\'t hire worker because hasn't bought Factory", 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
            return;
        }
        var hired = users.hireWorker(data.userid,data.dt);
        if(hired){
            log.print('Hire ' + data.dt + ' Worker', 'gameplay', data.roomid, users.user[data.userid].email);
            var stat = users.getStatistics(data.userid, rooms);
            io.to(data.roomid).emit('update highlight', stat);
            io.to(data.roomid).emit('update statistics ' + data.userid, stat);
            log.print('Send highlight (hire worker)', 'gameplay', data.roomid);
            rooms.send_all_player_money(data.roomid, io);
            log.print('Send all player money (hire worker)', 'gameplay', data.roomid);
            io.to(data.roomid).emit('worker return', stat);
            log.print('Response hire Worker', 'gameplay', data.roomid, users.user[data.userid].email, socket.io);
            rooms.execNextTurn(data.roomid, io, rooms);
        } else {
            io.to(socket.id).emit('insufficient balance');
            log.print('Insufficient balance while (hire Worker)', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        }
    });

    // Hire Agent
    socket.on('agent',function(data){
        log.print('Request hire Agent', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        if (!rooms.isUserTurn(data.roomid, data.userid)) return;
        data.dt = parseInt(data.dt);
        if (isNaN(data.dt) || data.dt <= 0) return;
        var hired = users.hireAgent(data.userid,data.dt);
        if (hired) {
            log.print('Hire ' + data.dt + ' Agent', 'gameplay', data.roomid, users.user[data.userid].email);
            var stat = users.getStatistics(data.userid, rooms);
            io.to(data.roomid).emit('update highlight', stat);
            io.to(data.roomid).emit('update statistics ' + data.userid, stat);
            log.print('Send highlight (hire Agent)', 'gameplay', data.roomid);
            rooms.send_all_player_money(data.roomid, io);
            log.print('Send all player money (hire Agent)', 'gameplay', data.roomid);
            io.to(data.roomid).emit('agent return', stat);
            log.print('Response hire Agent', 'gameplay', data.roomid, users.user[data.userid].email, socket.io);
            rooms.execNextTurn(data.roomid, io, rooms);
        } else {
            io.to(socket.id).emit('insufficient balance');
            log.print('Insufficient balance while (hire Agent)', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        }
    });

    // Hire Salesman
    socket.on('salesman',function(data){
        log.print('Request hire Salesman', 'gameplay', data.roomid, data.userid, socket.id);
        if (!rooms.isUserTurn(data.roomid, data.userid)) return;
        data.dt = parseInt(data.dt);
        if (isNaN(data.dt) || data.dt <= 0) return;
        var hired = users.hireSalesman(data.userid,data.dt);
        if (hired) {
            log.print('Hire ' + data.dt + ' Salesman', 'gameplay', data.roomid, users.user[data.userid].email);
            var stat = users.getStatistics(data.userid, rooms);
            io.to(data.roomid).emit('update highlight', stat);
            io.to(data.roomid).emit('update statistics ' + data.userid, stat);
            log.print('Send highlight (hire Salesman)', 'gameplay', data.roomid);
            rooms.send_all_player_money(data.roomid, io);
            log.print('Send all player money (hire Salesman)', 'gameplay', data.roomid);
            io.to(data.roomid).emit('salesman return', stat);
            log.print('Response hire Salesman', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
            rooms.execNextTurn(data.roomid, io, rooms);
        } else {
            io.to(socket.id).emit('insufficient balance');
            log.print('Insufficient balance while (hire Salesman)', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        }
    });

    // Add RnD
    socket.on('prd',function(data){
        log.print('Request buy Product RnD', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        if (!rooms.isUserTurn(data.roomid, data.userid)) return;
        data.dt = parseInt(data.dt);
        if (isNaN(data.dt) || data.dt <= 0) return;
        if (rooms.room[data.roomid].optional_decisions['prd'].includes(data.dt)) return;
        var added = users.addPRD(data.userid,data.dt);
        if (added) {
            log.print('Buy ' + data.dt + ' Product RnD', 'gameplay', data.roomid, users.user[data.userid].email);
            var stat = users.getStatistics(data.userid, rooms);
            io.to(data.roomid).emit('update highlight', stat);
            io.to(data.roomid).emit('update statistics ' + data.userid, stat);
            log.print('Send highlight (buy Product RnD)', 'gameplay', data.roomid);
            rooms.send_all_player_point(data.roomid, io);
            log.print('Send all player point (buy Product RnD)', 'gameplay', data.roomid);
            rooms.send_all_player_money(data.roomid, io);
            log.print('Send all player money (buy Product RnD)', 'gameplay', data.roomid);
            rooms.room[data.roomid].optional_decisions['prd'].push(data.dt);
            io.to(data.roomid).emit('prd return', stat);
            log.print('Response buy Product RnD', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
            rooms.execNextTurn(data.roomid, io, rooms);
        } else {
            io.to(socket.id).emit('insufficient balance');
            log.print('Insufficient balance while (buy Product RnD)', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        }
    });

    // Add System Improvement
    socket.on('sip',function(data){
        log.print('Request buy System Improvement', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        if (!rooms.isUserTurn(data.roomid, data.userid)) return;
        data.dt = parseInt(data.dt);
        if (isNaN(data.dt) || data.dt <= 0) return;
        if (rooms.room[data.roomid].optional_decisions['sip'].includes(data.dt)) return;
        var added = users.addSIP(data.userid,data.dt);
        if (added) {
            log.print('Buy ' + data.dt + ' System Improvement', 'gameplay', data.roomid, users.user[data.userid].email);
            var stat = users.getStatistics(data.userid, rooms);
            io.to(data.roomid).emit('update highlight', stat);
            io.to(data.roomid).emit('update statistics ' + data.userid, stat);
            log.print('Send highlight (buy System Improvement)', 'gameplay', data.roomid);
            rooms.send_all_player_point(data.roomid, io);
            log.print('Send all player point (buy System Improvement)', 'gameplay', data.roomid);
            rooms.send_all_player_money(data.roomid, io);
            log.print('Send all player money (buy System Improvement)', 'gameplay', data.roomid);
            rooms.room[data.roomid].optional_decisions['sip'].push(data.dt);
            io.to(data.roomid).emit('sip return', stat);
            log.print('Response buy System Improvement', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
            rooms.execNextTurn(data.roomid, io, rooms);
        } else {
            io.to(socket.id).emit('insufficient balance');
            log.print('Insufficient balance while buy System Improvement', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        }
    });

    // Add Quality Assurance
    socket.on('qap',function(data){
        log.print('Request buy Quality Assurance', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        if (!rooms.isUserTurn(data.roomid, data.userid)) return;
        data.dt = parseInt(data.dt);
        if (isNaN(data.dt) || data.dt <= 0) return;
        if (rooms.room[data.roomid].optional_decisions['qap'].includes(data.dt)) return;
        var added = users.addQAP(data.userid,data.dt);
        if (added) {
            log.print('Buy ' + data.dt + ' Quality Assurance', 'gameplay', data.roomid, users.user[data.userid].email);
            var stat = users.getStatistics(data.userid, rooms);
            io.to(data.roomid).emit('update highlight', stat);
            io.to(data.roomid).emit('update statistics ' + data.userid, stat);
            log.print('Send highlight (buy Quality Assurance)', 'gameplay', data.roomid);
            rooms.send_all_player_point(data.roomid, io);
            log.print('Send all player point (buy Quality Assurance)', 'gameplay', data.roomid);
            rooms.send_all_player_money(data.roomid, io);
            log.print('Send all player money (buy Quality Assurance)', 'gameplay', data.roomid);
            rooms.room[data.roomid].optional_decisions['qap'].push(data.dt);
            io.to(data.roomid).emit('qap return', stat);
            log.print('Response buy System Improvement', 'gameplay', data.roomid, users.user[data.userid].email);
            rooms.execNextTurn(data.roomid, io, rooms);
        } else {
            io.to(socket.id).emit('insufficient balance');
            log.print('Insufficient balance while buy Quality Assurance', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        }
    });

    // Add Employee Development
    socket.on('edp',function(data){
        log.print('Request buy Employee Development', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        if (!rooms.isUserTurn(data.roomid, data.userid)) return;
        data.dt = parseInt(data.dt);
        if (isNaN(data.dt) || data.dt <= 0) return;
        if (rooms.room[data.roomid].optional_decisions['edp'].includes(data.dt)) return;
        var added = users.addEDP(data.userid,data.dt);
        if (added) {
            log.print('Buy ' + data.dt + ' Employee Development', 'gameplay', data.roomid, users.user[data.userid].email);
            var stat = users.getStatistics(data.userid, rooms);
            io.to(data.roomid).emit('update highlight', stat);
            io.to(data.roomid).emit('update statistics ' + data.userid, stat);
            log.print('Send highlight (buy Employee Development)', 'gameplay', data.roomid);
            rooms.send_all_player_point(data.roomid, io);
            log.print('Send all player point (buy Employee Development)', 'gameplay', data.roomid);
            rooms.send_all_player_money(data.roomid, io);
            log.print('Send all player money (buy Employee Development)', 'gameplay', data.roomid);
            rooms.room[data.roomid].optional_decisions['edp'].push(data.dt);
            io.to(data.roomid).emit('edp return', stat);
            log.print('Response buy Employee Development', 'gameplay', data.roomid, users.user[data.userid].email, socket.io);
            rooms.execNextTurn(data.roomid, io, rooms);
        } else {
            io.to(socket.id).emit('insufficient balance');
            log.print('Insufficient balance while buy Employee Development', 'gameplay', data.roomid, users.user[data.userid].email, socket.io);
        }
    });

    // Add Market Research
    socket.on('mrp',function(data){
        log.print('Request buy Market Research', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        if (!rooms.isUserTurn(data.roomid, data.userid)) return;
        data.dt = parseInt(data.dt);
        if (isNaN(data.dt) || data.dt <= 0) return;
        if (rooms.room[data.roomid].optional_decisions['mrp'].includes(data.dt)) return;
        var added = users.addMRP(data.userid,data.dt);
        if (added) {
            log.print('Add ' + data.dt + ' Market Research', 'gameplay', data.roomid, users.user[data.userid].email);
            var stat = users.getStatistics(data.userid, rooms);
            io.to(data.roomid).emit('update highlight', stat);
            io.to(data.roomid).emit('update statistics ' + data.userid, stat);
            log.print('Send highlight (buy Market Research)', 'gameplay', data.roomid);
            rooms.send_all_player_point(data.roomid, io);            
            log.print('Send all player point (buy Market Research)', 'gameplay', data.roomid);
            rooms.send_all_player_money(data.roomid, io);
            log.print('Send all player money (buy Market Research)', 'gameplay', data.roomid);
            rooms.room[data.roomid].optional_decisions['mrp'].push(data.dt);
            io.to(data.roomid).emit('mrp return', stat);
            log.print('Response buy Market Research', 'gameplay', data.roomid, users.user[data.userid].email, socket.io);
            rooms.execNextTurn(data.roomid, io, rooms);
        } else {
            io.to(socket.id).emit('insufficient balance');
            log.print('Insufficient balance while buy Market Research', 'gameplay', data.roomid, users.user[data.userid].email, socket.io);
        }
    });

    // Add Promotion Program
    socket.on('pp',function(data){
        log.print('Request buy Promotion Program', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        if (!rooms.isUserTurn(data.roomid, data.userid)) return;
        data.dt = parseInt(data.dt);
        if (isNaN(data.dt) || data.dt <= 0) return;
        if (rooms.room[data.roomid].optional_decisions['pp'].includes(data.dt)) return;
        var added = users.addPP(data.userid,data.dt);
        if (added) {
            log.print('Buy ' + data.dt + ' Promotion Program', 'gameplay', data.roomid, users.user[data.userid].email);
            var stat = users.getStatistics(data.userid, rooms);
            io.to(data.roomid).emit('update highlight', stat);
            io.to(data.roomid).emit('update statistics ' + data.userid, stat);
            log.print('Send highlight (buy Promotion Program)', 'gameplay', data.roomid);
            log.print('Send all player point (buy Promotion Program)', 'gameplay', data.roomid);
            rooms.send_all_player_point(data.roomid, io);            
            log.print('Send all player money (buy Promotion Program)', 'gameplay', data.roomid);
            rooms.send_all_player_money(data.roomid, io);
            rooms.room[data.roomid].optional_decisions['pp'].push(data.dt);
            io.to(data.roomid).emit('pp return', stat);
            log.print('Response buy Promotion Program', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
            rooms.execNextTurn(data.roomid, io, rooms);
        } else {
            io.to(socket.id).emit('insufficient balance');
            log.print('Insufficient balance while buy Promotion Program', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        }
    });

    // Add Sales Service
    socket.on('ssp',function(data){
        log.print('Request buy Sales Service', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        if (!rooms.isUserTurn(data.roomid, data.userid)) return;
        data.dt = parseInt(data.dt);
        if (isNaN(data.dt) || data.dt <= 0) return;
        if (rooms.room[data.roomid].optional_decisions['ssp'].includes(data.dt)) return;
        var added = users.addSSP(data.userid,data.dt);
        if (added) {
            log.print('Buy ' + data.dt + ' sales service', 'gameplay', data.roomid, users.user[data.userid].email);
            var stat = users.getStatistics(data.userid, rooms);
            var allpoint = rooms.getAllPlayerPoint(data.roomid, io);
            io.to(data.roomid).emit('update highlight', stat);
            io.to(data.roomid).emit('update statistics ' + data.userid, stat);
            rooms.send_all_player_point(data.roomid, io);
            log.print('Send highlight (buy Sales Service)', 'gameplay', data.roomid);
            log.print('Send all player point (buy Sales Service)', 'gameplay', data.roomid);
            rooms.send_all_player_money(data.roomid, io);
            log.print('Send all player money (buy Sales Service)', 'gameplay', data.roomid);
            rooms.room[data.roomid].optional_decisions['ssp'].push(data.dt);
            io.to(data.roomid).emit('ssp return', stat);
            log.print('Response buy Sales Service', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
            rooms.execNextTurn(data.roomid, io, rooms);
        } else {
            io.to(socket.id).emit('insufficient balance');
            log.print('Insufficient balance while buy Sales Service', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        }
    });

    // Get & Check for showing modal optional decisions
    socket.on('optional decisions', function(data){
        var used = {};
        var radio = {};
        var disabled = true;
        log.print('Trying to Open modal (Optional decisions)', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        if (users.allowOptionalPick(data.userid)) {
            switch(data.dt.type){
                case 'prd':
                    if(typeof(rooms.room[data.roomid].optional_decisions['prd']) != 'undefined')
                        used = rooms.room[data.roomid].optional_decisions['prd'];
                    radio = users.user[data.userid].prd.renderOption(used);
                    disabled = (typeof(users.user[data.userid].prd.disabled) != 'undefined')? users.user[data.userid].prd.disabled : false;
                    break;
                case 'sip':
                    if(typeof(rooms.room[data.roomid].optional_decisions['sip']) != 'undefined')
                        used = rooms.room[data.roomid].optional_decisions['sip'];
                    radio = users.user[data.userid].sip.renderOption(used);
                    disabled = (typeof(users.user[data.userid].sip.disabled) != 'undefined')? users.user[data.userid].sip.disabled : false;
                    break;
                case 'qap':
                    if(typeof(rooms.room[data.roomid].optional_decisions['qap']) != 'undefined')
                        used = rooms.room[data.roomid].optional_decisions['qap'];
                    radio = users.user[data.userid].qap.renderOption(used);
                    disabled = (typeof(users.user[data.userid].qap.disabled) != 'undefined')? users.user[data.userid].qap.disabled : false;
                    break;
                case 'edp':
                    if(typeof(rooms.room[data.roomid].optional_decisions['edp']) != 'undefined')
                        used = rooms.room[data.roomid].optional_decisions['edp'];
                    radio = users.user[data.userid].edp.renderOption(used);
                    disabled = (typeof(users.user[data.userid].edp.disabled) != 'undefined')? users.user[data.userid].edp.disabled : false;
                    break;
                case 'mrp':
                    if(typeof(rooms.room[data.roomid].optional_decisions['mrp']) != 'undefined')
                        used = rooms.room[data.roomid].optional_decisions['mrp'];
                    radio = users.user[data.userid].mrp.renderOption(used);
                    disabled = (typeof(users.user[data.userid].mrp.disabled) != 'undefined')? users.user[data.userid].mrp.disabled : false;
                    break;
                case 'pp':
                    if(typeof(rooms.room[data.roomid].optional_decisions['pp']) != 'undefined')
                        used = rooms.room[data.roomid].optional_decisions['pp'];
                    radio = users.user[data.userid].pp.renderOption(used);
                    disabled = (typeof(users.user[data.userid].pp.disabled) != 'undefined')? users.user[data.userid].pp.disabled : false;
                    break;
                case 'ssp':
                    if(typeof(rooms.room[data.roomid].optional_decisions['ssp']) != 'undefined')
                        used = rooms.room[data.roomid].optional_decisions['ssp'];
                    radio = users.user[data.userid].ssp.renderOption(used);
                    disabled = (typeof(users.user[data.userid].ssp.disabled) != 'undefined')? users.user[data.userid].ssp.disabled : false;
                    break;
                default:
                    break;
            }
        } else {
            io.to(socket.id).emit('toast', 'You must completely buy Imperative Decisions first!', 2000);
            log.print('Not Allowed buy optional', 'gameplay', data.roomid, data.userid, socket.id);
            return;
        }
        if (!disabled) log.print('Open modal (Optional decisions)', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        io.to(socket.id).emit(
            'optional decisions return',
            {
                radio: radio,
                type: data.dt.type,
                used: used,
                disabled: disabled
            }
        );
    });

    // Input bidding
    socket.on('bidding', function (data) {
        log.print("User request to bid (bidding)", "gameplay", data.roomid, users.user[data.userid].email, socket.id);
        let user = users.user[data.userid];
        if (!(user.clororo.total > 0)){ 
            io.to(socket.id).emit("toast", "Can't bid because you don't have enough Clororo to sold", 2000);
            log.print("Emit: Can't bid because you don't have enough Clororo to sold", "gameplay", data.roomid, data.userid, socket.id);
            return; // Check have clororo or not
        }
        if (!(data.dt in gameconfig.clororo.option)) return; // Check data is on list (antisipasi hacker)
        let turnId = rooms.getTurnId(data.roomid); // Get turn id
        if (rooms.checkJoinedBid(data.roomid, data.userid)) return; // Check user has joined bid
        if (!rooms.room[data.roomid].bidRunning && data.userid != turnId) return; // Check not his turn & not on bidding
        if (!users.allowOptionalBid(data.userid)) {  // Check Optional Rules
            io.to(socket.id).emit("toast", "Can\'t bid because Optional Decisions rules not fulfilled", 2000);
            io.to(socket.id).emit("toast", "Buy Optional Pre-Production min: 1", 2000);
            io.to(socket.id).emit("toast", "Buy Optional Production min: 1", 2000);
            io.to(socket.id).emit("toast", "Buy Optional Post-Production min: 2", 2000);
            log.print("Emit: Can\'t bid because Optional Decisions rules not fulfilled", "gameplay", data.roomid, data.userid, socket.id);
            return;
        }
        let time_left = rooms.room[data.roomid].gameTimeLeft;
        if (time_left <= gameconfig.bid_time && !rooms.room[data.roomid].bidRunning) { 
            io.to(socket.id).emit('toast', 'Can\'t BID because game will end soon');
            return;
        }
        let bid = users.bid(data.roomid, io, rooms, data.userid, data.dt);
        if (bid) {
            io.to(socket.id).emit('toast', 'Bidding: Bid ' + bid.qty + ' lot for R$ ' + bid.price + '/lot', 5000);
            log.print("Bidding: Bid " + bid.qty + " lot for R$ " + bid.price + "/lot", 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        }
    })

    // Get execution time
    socket.on('get execution time', function (roomid) {
        log.print("Get execution time (Request)", "user", roomid, '', socket.id);
        if (rooms.room[roomid].played) {
            rooms.sendExecTime(roomid, io, rooms);
            io.to(socket.id).emit('game time left', rooms.prettyTime(rooms.room[roomid].gameTimeLeft));
        }
    });

    // Get bid time
    socket.on('get bid time', function (roomid) {
        if (rooms.room[roomid].played && rooms.room[roomid].bidRunning) {
            rooms.sendBidTime(roomid, io, rooms);
            rooms.emitUpdateBidParticipator(roomid, io);
        }
    });

    // Get Bid Participator
    socket.on('get bid participator', function (roomid) {
        rooms.emitUpdateBidParticipator(roomid, io);
    })

    // Listen to get all player point
    socket.on('get all player point', function (roomid) {
        rooms.send_all_player_point(roomid, io);
    });

    // Listen to get all player money
    socket.on('get all player money', function (roomid) {
        rooms.send_all_player_money(roomid, io);        
    });

    // Buy automatic process
    socket.on('buy auto process', function (data) {
        log.print("Request buy auto process", "user", data.roomid, users.user[data.userid].email, socket.id);
        let user = users.user[data.userid];
        if (user.buyed_auto_process) return;
        let checkMoney = users.checkMoney(gameconfig.automatic_cost, data.userid);
        if (checkMoney) {
            user.money -= gameconfig.automatic_cost;
            user.buyed_auto_process = true;
            users.setAutoProcess(data.userid, 1);
            rooms.send_all_player_money(data.roomid, io);
            io.to(socket.id).emit('auto process', 1);
            log.print("Response buy auto process", "gameplay", data.roomid, users.user[data.userid].email, socket.id);
        } else {
            io.to(socket.id).emit('insufficient balance');
            log.print('Insufficient balance while buy auto process', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        }
    })

    // Set lever for auto process
    socket.on('set auto process', function(data){
        log.print("Request change lever for automatic process", "gameplay", data.roomid, users.user[data.userid].email, socket.id);
        let roomid = data.roomid;
        let userid = data.userid;
        let user = users.user[userid];
        let value = (data.dt)? 1 : 0;
        if (rooms.room[roomid].played) {
            if (user.buyed_auto_process) {
                users.setAutoProcess(userid, value);
                io.to(socket.id).emit('auto process', value);
                log.print("Lever changed! (lever auto process)", "gameplay", data.roomid, users.user[data.userid].email, socket.id);
            } else {
                let turnId = rooms.getTurnId(data.roomid);
                if (turnId == data.userid) {
                    io.to(socket.id).emit('buy auto process', { price: gameconfig.automatic_cost });
                    log.print('Show buy auto process modal! (auto process)', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
                }
            }
        } else {
            value = 0;
            io.to(socket.id).emit('auto process', value);
        }
    });

    // Process game for operational decisions
    socket.on('process game', function(data){
        log.print('User request to process ' + data.dt, 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
        let roomid = data.roomid;
        let userid = data.userid;
        let type = data.dt;
        if(!rooms.isUserTurn(roomid, userid)) return;
        processed = 1;
        switch(type){
            case 'all':
                processed = users.processAll(userid);
                if(processed == -1) return;
                else if(!processed) io.to(socket.id).emit('toast', 'Set Lever to automatic first');
                break;
            case 'raw':
                processed = users.sendRaw(userid);
                break;
            case 'production':
                processed = users.processProd(userid);
                break;
            case 'default':
                processed = 0;
                break;
        }

        if (processed) {
            log.print("User successfully process game (process " + data.dt + ")", "gameplay", data.roomid, users.user[data.userid].email);
            io.to(socket.id).emit('auto process', users.user[userid].auto_process);
            log.print('Change lever auto process (process ' + data.dt + ')', 'gameplay', data.roomid, users.user[data.userid].email, socket.id);
            var stat = users.getStatistics(userid, rooms);
            io.to(roomid).emit('process game '+userid, stat);
            io.to(roomid).emit('update highlight', stat);
            log.print('Send highlight (process ' + data.dt + ')', 'gameplay', data.roomid);
            rooms.send_all_player_money(roomid, io);
            io.to(roomid).emit('Send all player money', stat);
            log.print('Send all player money (process ' + data.dt + ')', 'gameplay', data.roomid);
            rooms.execNextTurn(roomid, io, rooms);
        }
    })
};
