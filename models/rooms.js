var gameconfig = require('./../config/game');
var users = require('./users');
var log = require('./../helper/log');

// Function to leading zero
function str_pad_left(string,pad,length) {
    return (new Array(length+1).join(pad)+string).slice(-length);
}

var Room = function(room) {
    this.room = room;
    this.roomcount = 0;
    this.avlroom = [];
};

// Create room and define attributes
Room.prototype.createRoom = function (name) {
    this.roomcount++;
    var id = null
    do {
    id = Math.round(new Date().getTime()/1000).toString() + Math.floor((Math.random() * 100) + 1).toString() + this.roomcount.toString();
    } while (id == this.room.hasOwnProperty(id));
    this.room[id] = {
        id: name,
        active: 'n',
        maxuser: gameconfig.maxuser,
        users: [],
        turn: null,
        baseExecTime: gameconfig.exec_time,
        execTime: null,
        execTimeId: null,
        bidTime: null,
        bidTimeId: null,
        playingAt: null,
        bidRunning: false,
        bidParticipator: [],
        gameTimeLeft: gameconfig.game_time,
        gameTimeLeftId: null,
        firstplay: 1,
        played: 0,
        activeplayed: false,
        saveGame: false,
        end: 0,
        round: 0,
        optional_decisions: {
            'prd': [],
            'sip': [],
            'qap': [],
            'edp': [],
            'mrp': [],
            'pp': [],
            'ssp': []
        }
    };
    log.print("Create new room", 'room', id);
    return id;
};

// assign user to room
Room.prototype.assignUser = function(user){
    var usr = users.attach(user);
    var status = null;
    if(!usr.roomid){
        log.print('Find available room', 'room', '', usr.email);
        var roomid = this.findAvlRoom();
        users.setRoom(usr.id,roomid);
        this.room[roomid].users.push(usr.id);
        log.print('Joined room', 'room', roomid, usr.email);
        this.checkMax(roomid);
        status = this.checkStatus(roomid);
    } else {
        status = this.checkStatus(usr.roomid);
    }

    return [usr,status];
};

// remove user from room
Room.prototype.removeUser = function(io, rooms, roomid, userid){
    let room = this.room[roomid];
    let roomStatus = this.checkStatus(roomid);

    // Remove from room
    let i = room.users.indexOf(userid);
    if (i >= 0) {
        nowTurnId = this.getTurnId(roomid);
        this.room[roomid].users.splice(i, 1);
        // If user turn & room active
        if(nowTurnId == userid && roomStatus == 'y'){
            turn = this.room[roomid].turn;
            turn--;
            this.room[roomid].turn = (!(turn >= 0))? (this.room[roomid].users.length-1) : turn;
            this.execNextTurn(roomid, io, rooms);
        }
    }

    // Remove from bidding participator
    for (i in room.bidParticipator) {
        if (room.bidParticipator[i].id == userid) {
            delete this.room[roomid].bidParticipator[i];
        }
    }

    log.print("Leave room", "room", roomid, users.user[userid].email || '');
}

// check if room max and activate it if max
Room.prototype.checkMax = function(roomid){
    var tot = this.room[roomid].users.length;
    if(tot==this.room[roomid].maxuser) {
        this.room[roomid].active = 'y';
        this.room[roomid].playingAt = new Date;
        log.print('Room changed to active', 'room', roomid)
        var index = this.avlroom.indexOf(roomid);
        if (index > -1) {
            this.avlroom.splice(index, 1);
            log.print("Remove (" + roomid + ") room from available room", "room");
        }
    }
};

// Total user in room
Room.prototype.totalUser = function(roomid){
    return this.room[roomid].users.length;
}

// check room status
Room.prototype.checkStatus = function(roomid){
    return this.room[roomid].active;
};

// find available room
Room.prototype.findAvlRoom = function(){
    if(this.avlroom[0]) return this.avlroom[0];
    var roomid = this.createRoom('new');
    this.avlroom.push(roomid);
    return roomid;
};

// get all user with their data attributes
Room.prototype.listUsers = function(roomid){
    var dtuser = [];
    for(var i=0;i<this.room[roomid].users.length;i++){
        dtuser[i] = users.getData(this.room[roomid].users[i]);
    }
    return dtuser;
};

// Execution timer all time
Room.prototype.execTimer = function(roomid, io, rooms) {
    time = (this.room[roomid].execTime-1);
    if(time < 0)
        this.execNextTurn(roomid, io, rooms);
        if(!this.room[roomid].played) return;
    else 
        this.room[roomid].execTime = time;
    var allTime = {};
    for (var i = 0; i < this.room[roomid].users.length; i++) {
        if(this.room[roomid].turn == i)
            allTime[this.room[roomid].users[i]] = time;
        else
            allTime[this.room[roomid].users[i]] = this.getExecTimeLeft(roomid, i, time);
    }
    return allTime;
}

// Execution next turn
Room.prototype.execNextTurn = function(roomid, io, rooms) {
    if(this.room[roomid].turn == null) 
        this.room[roomid].turn = 0;
    else {
        if((this.room[roomid].turn+1) == this.room[roomid].users.length)
            if(this.room[roomid].gameTimeLeft > 0)
                this.endRound(roomid, io, rooms);
            else {
                this.endGame(roomid, io);
                return;
            }
        else 
            this.room[roomid].turn++;
    }

    log.print("Execution next turn. Now is " + users.user[this.getTurnId(roomid)].email + " turn", 'gameplay', roomid);
    if(this.room[roomid].execTimeId != null) clearInterval(this.room[roomid].execTimeId);
    this.room[roomid].execTime = this.room[roomid].baseExecTime;
    this.sendExecTime(roomid, io, rooms);
    this.room[roomid].execTimeId = setInterval(function(){
        rooms.sendExecTime(roomid, io, rooms);
    }, 1000);
}

// Send emitter execution time
Room.prototype.sendExecTime = function(roomid, io, rooms) {
    var allTime = rooms.execTimer(roomid, io, rooms);
    if(!this.room[roomid].played) return;
    io.to(roomid).emit('execution time update', {time: allTime, turn: this.getTurnId(roomid), round: rooms.room[roomid].round});
}

// get turn user id
Room.prototype.getTurnId = function(roomid) {
    return this.room[roomid].users[this.room[roomid].turn];
}

// get execution time left / waiting time for next turn
Room.prototype.getExecTimeLeft = function(roomid, indexId, timenow) {
    var nowTurn = this.room[roomid].turn;
    var turnLeft = 0;
    if(nowTurn > indexId){
        turnLeft = (this.room[roomid].users.length - nowTurn)+(indexId-1);
    } else {
        turnLeft = ((indexId-nowTurn)-1);
    }
    if(turnLeft < 0) return 0;
    else return (turnLeft*(gameconfig.exec_time))+timenow;
}

// check if user turn
Room.prototype.isUserTurn = function(roomid, userid) {
    if(userid == this.getTurnId(roomid)) return true;
    return false;
}

// function end round
Room.prototype.endRound = function(roomid, io, rooms) {
    log.print("Round " + this.room[roomid].round, 'gameplay', roomid);
    this.room[roomid].turn = 0;
    this.room[roomid].round++;
}

// start game and add prepare time
Room.prototype.startGame = function (roomid, io, rooms) {
    this.room[roomid].activeplayed = true;
    log.print('Prepare start game!', 'gameplay', roomid);
    let totalRoomPlaying = this.totalRoomPlaying();
    log.print('Total played ' + totalRoomPlaying + ' rooms', 'system');
    this.room[roomid].firstplay = 0;
    var startTimer = 3;
    io.to(roomid).emit('start timer', startTimer);
    io.to(roomid).emit('open game');
    var tid = setInterval(function(){
        io.to(roomid).emit('open game');
        startTimer--;
        if(startTimer > 0) 
            io.to(roomid).emit('start timer', startTimer);
        else {
            io.to(roomid).emit('start timer', 'Start!');
            clearInterval(tid);
            log.print('Start game!', 'gameplay', roomid);
            rooms.room[roomid].played = 1;
            rooms.room[roomid].round = 1;
            rooms.execNextTurn(roomid, io, rooms);
            rooms.startGameTimeLeft(roomid, io, rooms);
        }
    }, 1000);
    return;
}

// set time to hh:mm:ss format
Room.prototype.prettyTime = function (time) {
    var hours = Math.floor(time / 3600);
    time -= hours*3600;
    var minutes = Math.floor(time / 60);
    time -= minutes*60;
    var seconds = time;
    var finalTime = str_pad_left(hours,'0',2)+':'+str_pad_left(minutes,'0',2)+':'+str_pad_left(seconds,'0',2);
    return finalTime;
}

// game time left and start it
Room.prototype.startGameTimeLeft = function(roomid, io, rooms) {
    this.prettyTime(this.room[roomid].gameTimeLeft);
    this.room[roomid].gameTimeLeftId = setInterval(function(){
        if(rooms.room[roomid].gameTimeLeft > 0)
            rooms.room[roomid].gameTimeLeft--;

        if(rooms.room[roomid].gameTimeLeft > 0){
            var show = rooms.prettyTime(rooms.room[roomid].gameTimeLeft);
        } else {
            var show = "This Round";
        }
        io.to(roomid).emit("game time left", show);
    }, 1000);
}

// end game
Room.prototype.endGame = function(roomid, io) {
    $this = this;
    clearInterval(this.room[roomid].execTimeId);
    clearInterval(this.room[roomid].gameTimeLeftId);
    this.room[roomid].activeplayed = false;
    this.room[roomid].played = 0;
    this.room[roomid].turn = null;
    this.room[roomid].end = 1;
    this.saveGame(roomid, io, function() {
        io.to(roomid).emit('end game');
        log.print("Game ended!", "gameplay", roomid);
        let totalRoomPlaying = $this.totalRoomPlaying();
        log.print('Total played ' + totalRoomPlaying + ' rooms', 'system');
    });
}

// save game
Room.prototype.saveGame = function (roomid, io, callback) {
    var room = this.room[roomid];
    var listUsersId = this.room[roomid].users;
    log.print('Saving Game', 'gameplay', roomid);
    room.saveGame = true;
    io.to(roomid).emit('update loader', true); // show loader
    log.print('Show Loader (Save game)', 'gameplay', roomid);
    for (i in listUsersId) {
        users.saveData(room, listUsersId[i]);
    }
    room.saveGame = false;
    io.to(roomid).emit('update loader', false); // hide loader
    log.print('All user saved!', 'gameplay', roomid);
    callback();
}

// get all player point
Room.prototype.getAllPlayerPoint = function (roomid) {
    let dtuser = this.listUsers(roomid);
    let result = {};
    for (i in dtuser) {
        result[dtuser[i].id] = dtuser[i].point;
    }
    return result;
}

// get all player money
Room.prototype.getAllPlayerMoney = function (roomid) {
    let dtuser = this.listUsers(roomid);
    let result = {};
    for (i in dtuser) {
        result[dtuser[i].id] = dtuser[i].money;
    }
    return result;
}

// input user bidding
Room.prototype.userBidding = function (roomid, io, rooms, userid, value) {
    if (!this.room[roomid].bidRunning) {
        this.room[roomid].bidParticipator = [];
    }
    var clo = users.allowedSellClororo(userid);
    if (!(clo > 0)) return false;
    let user = users.user[userid];
    let user_bid = {
        id: userid,
        name: user.name,
        value: value,
        qty: clo,
        price: gameconfig.clororo.option[value].price,
        point: gameconfig.clororo.option[value].point + user.point
    };
    this.room[roomid].bidParticipator.push(user_bid);
    if (this.room[roomid].bidParticipator[0].id == userid) this.execNextTurn(roomid, io, rooms);
    if (!this.room[roomid].bidRunning) this.startBidding(roomid, io, rooms, userid);
    else users.user[userid].bid_participator++;
    var stat = users.getStatistics(userid, this);
    io.to(roomid).emit('update statistics ' + userid, stat);
    log.print('User update statistics (bidding)', roomid, users.user[userid].email);
    this.emitUpdateBidParticipator(roomid, io);
    return user_bid;
}

// if user is bid initiator and start bidding
Room.prototype.startBidding = function (roomid, io, rooms, userid) {
    this.room[roomid].bidRunning = true;
    this.room[roomid].bidTime = 15;
    this.sendBidTime(roomid, io, rooms);
    this.room[roomid].bidParticipator[0].point += gameconfig.bid_initiator_point;
    users.user[userid].bid_initiator++;
    log.print('User become bid initiator (bidding)', 'gameplay', roomid, users.user[userid].email);
    this.room[roomid].bidTimeId = setInterval(function () {
        rooms.room[roomid].bidTime--;
        rooms.sendBidTime(roomid, io, rooms);
        if (rooms.room[roomid].bidTime == 0) rooms.endBid(roomid, io, rooms);
}, 1000);
}

// emmiter bid time
Room.prototype.sendBidTime = function (roomid, io, rooms) {
    io.to(roomid).emit('open game');
    io.to(roomid).emit('bid time', this.room[roomid].bidTime);
}

// check if user is joined bid
Room.prototype.checkJoinedBid = function (roomid, userid) {
    if (this.room[roomid].bidRunning) {
        let bidParticipator = this.room[roomid].bidParticipator;
        for (key in bidParticipator) {
            if (userid == bidParticipator[key].id) return true;   
        }
    }
    return false;
}

// bid time ended
Room.prototype.endBid = function (roomid, io, rooms) {
    log.print("Bid ended!", 'gameplay', roomid)
    clearInterval(this.room[roomid].bidTimeId);
    this.room[roomid].bidRunning = false;

    // System find choosen
    let bidParticipator = this.room[roomid].bidParticipator;
    let player_choosen = [];
    let choosen = 0;
    for (key in bidParticipator) {
        if (bidParticipator[key].point > choosen) {
            player_choosen = [];
            choosen = bidParticipator[key].point;
        }
        if (bidParticipator[key].point >= choosen)
            player_choosen.push(bidParticipator[key].id);
    }
    // System take bid
    for (key in bidParticipator) {
        // Won bid
        if (player_choosen.includes(bidParticipator[key].id)) {
            let sell = users.sellClororo(bidParticipator[key]);
            var stat = users.getStatistics(bidParticipator[key].id, this);
            io.to(roomid).emit('toast ' + bidParticipator[key].id, 'Bidding: You won bidding!', 2000);
            io.to(roomid).emit('toast ' + bidParticipator[key].id, 'Bidding: You sold ' + bidParticipator[key].qty + ' lot for R$ ' + sell.earnings + '!', 3000);
            io.to(roomid).emit('process game ' + bidParticipator[key].id, stat);
            io.to(roomid).emit('update highlight', stat);
            io.to(roomid).emit('update statistics ' + bidParticipator[key].id, stat);
            log.print('Won bidding!', 'gameplay', roomid, users.user[bidParticipator[key].id].email);
            log.print('Sold ' + bidParticipator[key].qty + ' lot for R$ ' + sell.earnings + '!', roomid, users.user[bidParticipator[key].id].email);
        } else { // Lose bid
            io.to(roomid).emit('toast ' + bidParticipator[key].id, 'Bidding: You lose bidding!', 2000);
            log.print('Lose bidding!', 'gameplay', roomid, users.user[bidParticipator[key].id].email);
        }
    }
    this.send_all_player_money(roomid, io);
    this.emitUpdateBidParticipator(roomid, io);
}

Room.prototype.emitUpdateBidParticipator = function (roomid, io) {
    let bidParticipator = [];
    let bidRunning = this.room[roomid].bidRunning;
    for (i in this.room[roomid].bidParticipator) {
        let bp = this.room[roomid].bidParticipator[i];
        let dt = {};
        dt.id = bp.id;
        dt.name = bp.name;
        dt.qty = bp.qty;
        if (!bidRunning) {
            dt.value = bp.value;
            dt.price = bp.price;
            dt.point = bp.point;
        }
        bidParticipator[i] = dt;
    }
    io.to(roomid).emit('bid initiator', bidParticipator[0]);
    io.to(roomid).emit('bid participator', bidParticipator);
}

Room.prototype.totalRoomPlaying = function () {
    let total = 0;
    for (i in this.room) {
        if (this.room[i].activeplayed) total++;
    }
    return total;
}

// Function get all player point
Room.prototype.send_all_player_point = function (roomid, io) {
    allpoint = this.getAllPlayerPoint(roomid);
    io.to(roomid).emit('update point', allpoint);
    log.print('Send All Player Money', 'room', roomid);
}

// Function get all player money
Room.prototype.send_all_player_money = function (roomid, io) {
    allmoney = this.getAllPlayerMoney(roomid);
    io.to(roomid).emit('update money', allmoney);
    log.print('Send All Player Money', 'room', roomid);
}

module.exports = Room;
