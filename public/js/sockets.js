define([], function() {
var res = {};
var socket = io();
var user = {};
var roomid;

// Client socket join
res.join = function(room,usr){
    socket.emit('join',room,usr.id);
    roomid = room;
    user = usr;
    this.roomid = roomid;
    this.user = user;
};

// Template emitter
res.emit = function(name,dt){
    var data = {roomid:roomid,userid:user.id,dt:dt};
    socket.emit(name,data);
};

// Listen from socket
res.listen = function(ui){
    $this = this;

    // end game
    socket.on('end game', function(data) {
        swal("Game Ended!", "Please Re-login to play again", "info");
    });

    // user leave
    socket.on('user leave', function(data) {
        if(data.id == user.id) {
            document.location.reload();
            socket.disconnect();
        } else {
            ui.removeUser(data.id);
            Materialize.toast(data.name+" (left the game)", 1000);
        }
    });

    // Loader
    socket.on('update loader', function(active) {
        ui.updateLoader(active);
    })

    // start timer before playing
    socket.on('start timer', function(data) {
        Materialize.toast(data, 1000);
    });

    // update execution time
    socket.on('execution time update', function(data) {
        ui.updateParticipantTurnLabel(data.turn == user.id, data.time[user.id]);
        ui.updateParticipantTurn(data.turn);
        ui.updateExecTime(data.time[user.id]);
        ui.updateRound(data.round);
    });

    // update game time left
    socket.on('game time left', function(data) {
        ui.updateGameTimeLeft(data);
    });

    // update lever auto process
    socket.on('auto process', function(data) {
        ui.updateAutoProcess(data);
    });

    // update user highlight
    socket.on('update highlight', function(data) {
        ui.updateHighlight(data);
    });

    // update user statistics
    socket.on('update statistics ' + user.id, function (data) {
        ui.updateStatistics(data);
    })

    // allowed show modal buy auto process
    socket.on('buy auto process', function (data) {
        ui.showBuyAutoProcess(data.price, function () {
            $this.emit('buy auto process', true);
        });
    })

    // process game success and update data
    socket.on('process game '+this.user.id, function(data) {
        ui.updateRMTotal(data.rawmaterial);
        ui.updateProdTotal(data.production);
        ui.updateCloTotal(data.clororo);
    });

    // show insufficient balance
    socket.on('insufficient balance', function(data) {
        ui.showInsufficientBalance();
    });

    // toast
    socket.on('toast', function (msg, time) {
        time = time || 1000;
        Materialize.toast(msg, time);
    });

    // toast by id
    socket.on('toast ' + this.user.id, function (msg, time) {
        time = time || 1000;
        Materialize.toast(msg, time);
    });

    // update point
    socket.on('update point', function (data) {
        for (id in data) {
            let point = data[id];
            ui.updateListPlayerPoint(id, point);
            if (id == user.id) {
                user.point = point;
                ui.updateUserPoint(point);
            }
        }
    });

    // update money
    socket.on('update money', function (data) {
        for (id in data) {
            let money = data[id];
            ui.updateListPlayerMoney(id, money);
            if (id == user.id) {
                user.money = money;
                ui.updateMoney(money);
            }
        }
    });

    // update bid time
    socket.on('bid time', function (time) {
        ui.updateBidTime(time);
    });

    // update bid initiator
    socket.on('bid initiator', function (data) {
        ui.updateBidInitiator(data);
    })

    // update bid participator
    socket.on('bid participator', function (data) {
        ui.updateBidParticipator(data);
    })

    // success buy warehouse
    socket.on('warehouse return', function(data) {
        if (data.userid != user.id) return;
        ui.updateWTotal(data.warehouse);
        ui.updateRMCapacity(data.rawmaterial_capacity);
    });

    // success buy handling equipment
    socket.on('handlingeqp return', function(data) {
        if (data.userid != user.id) return;
        ui.updateHETotal(data.handlingeqp);
    });

    // success buy raw material
    socket.on('rawmaterial return', function(data) {
        if (data.userid != user.id) return;
        ui.updateRMTotal(data.rawmaterial);
    });

    // success buy factory
    socket.on('factory return', function(data) {
        if (data.userid != user.id) return;
        ui.updateFacTotal(data.factory);
    });

    // success buy machine big
    socket.on('machinebig return', function(data) {
        if (data.userid != user.id) return;
        ui.updateMBTotal(data.machinebig);
        ui.updateProdCapacity(data.production_capacity);
    });

    // success buy machinesmall
    socket.on('machinesmall return', function(data) {
        if (data.userid != user.id) return;
        ui.updateMSTotal(data.machinesmall);
        ui.updateProdCapacity(data.production_capacity);
    });

    // success hire worker
    socket.on('worker return', function(data) {
        if (data.userid != user.id) return;
        ui.updateWorkerTotal(data.worker);
        ui.updateProdCapacity(data.production_capacity);
    });

    // success hire agent
    socket.on('agent return', function(data) {
        if (data.userid != user.id) return;
        ui.updateAGTotal(data.agent);
        ui.updateCloCapacity(data.clororo_capacity);
    });

    // success hire salesman
    socket.on('salesman return', function(data) {
        if (data.userid != user.id) return;
        ui.updateSMTotal(data.salesman);
        ui.updateCloCapacity(data.clororo_capacity);
    });

    // if room active
    socket.on('room active', function(data) {
        socket.emit('get execution time', roomid);
        socket.emit('get all player point', roomid);
        socket.emit('get all player money', roomid);
        socket.emit('get bid time', roomid);
        socket.emit('get bid participator', roomid);
        socket.emit('get statistics', user.id);
        ui.prepareGame(data, roomid);
        ui.openGame();
    });

    // Open game
    socket.on('open game', function(data) {
        ui.openGame();
    });

    // success add RnD
    socket.on('prd return', function(data) {
        if (data.userid != user.id) return;
        ui.updatePRDTotal(data.prd);
    });

    // success add System improvement
    socket.on('sip return', function(data) {
        if (data.userid != user.id) return;
        ui.updateSIPTotal(data.sip);
    });

    // success add quality asurance
    socket.on('qap return', function(data) {
        if (data.userid != user.id) return;
        ui.updateQAPTotal(data.qap);
    });

    // success add employee development
    socket.on('edp return', function(data) {
        if (data.userid != user.id) return;
        ui.updateEDPTotal(data.edp);
    });

    // success add market research
    socket.on('mrp return', function(data) {
        if (data.userid != user.id) return;
        ui.updateMRPTotal(data.mrp);
    });

    // success add promotion program
    socket.on('pp return', function(data) {
        if (data.userid != user.id) return;
        ui.updatePPTotal(data.pp);
    });

    // success add sales service
    socket.on('ssp return', function(data) {
        if (data.userid != user.id) return;
        ui.updateSSPTotal(data.ssp);
    });

    // check allowed to show modal optional decisions
    socket.on('optional decisions return', function(data) {
        if(!data.disabled){
            switch(data.type){
                case 'prd':
                    ui.inputPRD(data.radio, function(total){
                        $this.emit('prd', total);
                    });
                    break;
                case 'sip':
                    ui.inputSIP(data.radio, function(total){
                        $this.emit('sip', total);
                    });
                    break;
                case 'qap':
                    ui.inputQAP(data.radio, function(total){
                        $this.emit('qap', total);
                    });
                    break;
                case 'edp':
                    ui.inputEDP(data.radio, function(total){
                        $this.emit('edp', total);
                    });
                    break;
                case 'mrp':
                    ui.inputMRP(data.radio, function(total){
                        $this.emit('mrp', total);
                    });
                    break;
                case 'pp':
                    ui.inputPP(data.radio, function(total){
                        $this.emit('pp', total);
                    });
                    break;
                case 'ssp':
                    ui.inputSSP(data.radio, function(total){
                        $this.emit('ssp', total);
                    });
                    break;
                default:
                    break;
            }
        }
    });
};

return res;

});
