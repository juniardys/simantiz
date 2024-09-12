var Warehouse = require('./warehouse');
var HandlingEQP = require('./handlingeqp');
var Rawmaterial = require('./rawmaterial');
var Factory = require('./factory');
var MachineBig = require('./machine_big');
var MachineSmall = require('./machine_small');
var Production = require('./production');
var Worker = require('./worker');
var Agent = require('./agent');
var Salesman = require('./salesman');
var Clororo = require('./clororo');
var PRD = require('./prd');
var SIP = require('./sip');
var QAP = require('./qap');
var EDP = require('./edp');
var MRP = require('./mrp');
var PP = require('./pp');
var SSP = require('./ssp');
var gameconfig = require('./../config/game');
var log = require('./../helper/log');
require('./../config/database'); // have global var connection
var squel = require('squel');
var date = require('date-and-time');

// Define initial money
var initial_capital = gameconfig.initial_capital;

var Users = function() {
    this.user = {};
};

// When user logout
Users.prototype.logout = function(io, rooms, id) {
    let user = this.user[id];
    
    roomStatus = rooms.checkStatus(user.roomid);
    rooms.removeUser(io, rooms, user.roomid, id);
    log.print('User has been logout', 'user', user.roomid, user.email);
    // room active
    if (roomStatus == 'y') {
        rooms.emitUpdateBidParticipator(user.roomid, io);
        io.to(user.roomid).emit('user leave', { id: id, name: user.name });
        totalUser = rooms.totalUser(user.roomid);
        if(totalUser == 1) {
            setTimeout(function(){
                rooms.endGame(user.roomid, io);
            }, 100);
        }
    }
    delete this.user[id];
}

// Add new user when login
Users.prototype.addNew = function (data) {
    var attr = data;
    var warehouse = data.warehouse || 0;
    var handlingeqp = data.handlingeqp || 0;
    var rw = data.rawmaterial || 0;
    var factory = data.factory || 0;
    var machinebig = data.machine_big || 0;
    var machinesmall = data.machine_small || 0;
    var prod = data.production || 0;
    var worker = data.worker || 0;
    var agent = data.agent || 0;
    var salesman = data.salesman || 0;
    var clororo = data.clororo || 0;
    var prd = data.prd || 0;
    var sip = data.sip || 0;
    var qap = data.qap || 0;
    var edp = data.edp || 0;
    var mrp = data.mrp || 0;
    var pp = data.pp || 0;
    var ssp = data.ssp || 0;

    attr.warehouse = new Warehouse(warehouse);
    attr.handlingeqp = new HandlingEQP(handlingeqp);
    attr.rawmaterial = new Rawmaterial(rw);
    attr.factory = new Factory(factory);
    attr.machinebig = new MachineBig(machinebig);
    attr.machinesmall = new MachineSmall(machinesmall);
    attr.production = new Production(prod);
    attr.worker = new Worker(worker);
    attr.agent = new Agent(agent);
    attr.salesman = new Salesman(salesman);
    attr.clororo = new Clororo(clororo);
    attr.prd = new PRD(prd);
    attr.sip = new SIP(sip);
    attr.qap = new QAP(qap);
    attr.edp = new EDP(edp);
    attr.mrp = new MRP(mrp);
    attr.pp = new PP(pp);
    attr.ssp = new SSP(ssp);

    attr.money = data.money || initial_capital;
    attr.point = data.point || 0;
    attr.auto_process = 0;
    attr.buyed_auto_process = false;
    attr.revenue = 0;
    attr.sales_price = [];
    attr.bid_initiator = 0;
    attr.bid_participator = 0;
    attr.total_unit_sold = 0;
    attr.sales_unit = attr.total_unit_sold;

    this.user[data.id] = attr;

    log.print("Initialize user data", "user", '', attr.email);
};

// Set raw material capacity
Users.prototype.setRawMaterialCapacity = function(id, cty){
    var user = this.user[id];
    user.rawmaterial_capacity = user.rawmaterial.addCapacity(cty);
};

// Set handling capacity
Users.prototype.setHandlingCapacity = function(id){
    var user = this.user[id];
    user.handling_capacity = user.handlingeqp.total_capacity;
};

// Set machine capacity
Users.prototype.setMachineCapacity = function(id){
    var user = this.user[id];
    user.machine_capacity = user.machinebig.getCapacity() + user.machinesmall.getCapacity();
};

// Set manpower capacity
Users.prototype.setManpowerCapacity = function(id){
    var user = this.user[id];
    user.manpower_capacity = user.worker.getCapacity();
};

// Set production capacity
Users.prototype.setProductionCapacity = function(id){
    var user = this.user[id];
    user.production_capacity = user.production.setProdCapacity(user.machinebig, user.machinesmall, user.worker);
};

// Set clororo capacity
Users.prototype.setClororoCapacity = function(id, cty){
    var user = this.user[id];
    user.clororo_capacity = user.clororo.addCapacity(cty);
};

// Buy raw material
Users.prototype.buyMaterial = function(id,qty){
    var user = this.user[id];
    var checkMoney = this.checkMoney(user.rawmaterial.getTotalCost(qty), id);
    if (checkMoney) {
        var cost = user.rawmaterial.buy(qty);
        user.money-=cost;
        return 1;
    } else {
        return 0;
    }
};

// Buy Warehouse
Users.prototype.buyWarehouse = function(id,qty){
    var user = this.user[id];
    var checkMoney = this.checkMoney(user.warehouse.getTotalCost(qty), id);
    var canBuy = user.warehouse.canBuy(qty);
    if (checkMoney && canBuy) {
        var buyed = user.warehouse.buy(qty);
        this.setRawMaterialCapacity(id, buyed.total_capacity);
        user.money-=buyed.total_cost;
        return 1;
    } else {
        return 0;
    }
};

// Buy Handling Equipment
Users.prototype.buyHandlingEQP = function(id,qty){
    var user = this.user[id];
    var checkMoney = this.checkMoney(user.handlingeqp.getTotalCost(qty), id);
    var canBuy = user.handlingeqp.canBuy(qty);
    if (checkMoney && canBuy) {
        var buyed = user.handlingeqp.buy(qty);
        this.setHandlingCapacity(id);
        user.money-=buyed.total_cost;
        return 1;
    } else {
        return 0;
    }
};

// Buy Factory
Users.prototype.buyFactory = function(id,qty){
    var user = this.user[id];
    var checkMoney = this.checkMoney(user.factory.getTotalCost(qty), id);
    var canBuy = user.factory.canBuy(qty);
    if (checkMoney && canBuy) {
        var buyed = user.factory.buy(qty);
        user.money-=buyed.total_cost;
        return 1;
    } else {
        return 0;
    }
};

// Buy machine big
Users.prototype.buyMachineBig = function(id,qty){
    var user = this.user[id];
    var checkMoney = this.checkMoney(user.machinebig.getTotalCost(qty), id);
    if (checkMoney) {
        var buyed = user.machinebig.buy(qty);
        this.setMachineCapacity(id);
        this.setProductionCapacity(id);
        user.money-=buyed.total_cost;
        return 1;
    } else {
        return 0;
    }
};

// buy machine small
Users.prototype.buyMachineSmall = function(id,qty){
    var user = this.user[id];
    var checkMoney = this.checkMoney(user.machinesmall.getTotalCost(qty), id);
    if (checkMoney) {
        var buyed = user.machinesmall.buy(qty);
        this.setMachineCapacity(id);
        this.setProductionCapacity(id);
        user.money-=buyed.total_cost;
        return 1;
    } else {
        return 0;
    }
};

// hire worker
Users.prototype.hireWorker = function(id,qty){
    var user = this.user[id];
    var checkMoney = this.checkMoney(user.worker.getTotalCost(qty), id);
    if (checkMoney) {
        var hired = user.worker.hire(qty);
        this.setManpowerCapacity(id);
        this.setProductionCapacity(id);
        user.money-=hired.total_cost;
        return 1;
    } else {
        return 0;
    }
};

// hire agent
Users.prototype.hireAgent = function(id,qty){
    var user = this.user[id];
    var checkMoney = this.checkMoney(user.agent.getTotalCost(qty), id);
    if (checkMoney) {
        var hired = user.agent.hire(qty);
        this.setClororoCapacity(id, hired.total_capacity);
        user.money-=hired.total_cost;
        return 1;
    } else {
        return 0;
    }
};

// hire salesman
Users.prototype.hireSalesman = function(id,qty){
    var user = this.user[id];
    var checkMoney = this.checkMoney(user.salesman.getTotalCost(qty), id);
    if (checkMoney) {
        var hired = user.salesman.hire(qty);
        user.money-=hired.total_cost;
        return 1;
    } else {
        return 0;
    }
};

// add product rnd
Users.prototype.addPRD = function(id,qty){
    var user = this.user[id];
    if (!(qty in user.prd.option)) return false;
    var checkMoney = this.checkMoney(user.prd.getTotalCost(qty), id);
    if (checkMoney) {
        var added = user.prd.add(qty);
        user.money-=added.total_cost;
        user.point+=added.point;
        user.prd.disabled = true;
        return 1;
    } else {
        return 0;
    }
};

// add system improvement
Users.prototype.addSIP = function(id,qty){
    var user = this.user[id];
    if (!(qty in user.sip.option)) return false;
    var checkMoney = this.checkMoney(user.sip.getTotalCost(qty), id);
    if (checkMoney) {
        var added = user.sip.add(qty);
        user.money-=added.total_cost;
        user.point+=added.point;
        user.sip.disabled = true;
        return 1;
    } else {
        return 0;
    }
};

// add quality assurance
Users.prototype.addQAP = function(id,qty){
    var user = this.user[id];
    if (!(qty in user.qap.option)) return false;
    var checkMoney = this.checkMoney(user.qap.getTotalCost(qty), id);
    if (checkMoney) {
        var added = user.qap.add(qty);
        user.money-=added.total_cost;
        user.point+=added.point;
        user.qap.disabled = true;
        return 1;
    } else {
        return 0;
    }
};

// add employee development
Users.prototype.addEDP = function(id,qty){
    var user = this.user[id];
    if (!(qty in user.edp.option)) return false;
    var checkMoney = this.checkMoney(user.edp.getTotalCost(qty), id);
    if (checkMoney) {
        var added = user.edp.add(qty);
        user.money-=added.total_cost;
        user.point+=added.point;
        user.edp.disabled = true;
        return 1;
    } else {
        return 0;
    }
};

// add market research
Users.prototype.addMRP = function(id,qty){
    var user = this.user[id];
    if (!(qty in user.mrp.option)) return false;
    var checkMoney = this.checkMoney(user.mrp.getTotalCost(qty), id);
    if (checkMoney) {
        var added = user.mrp.add(qty);
        user.money-=added.total_cost;
        user.point+=added.point;
        user.mrp.disabled = true;
        return 1;
    } else {
        return 0;
    }
};

// add promotion program
Users.prototype.addPP = function(id,qty){
    var user = this.user[id];
    if (!(qty in user.pp.option)) return false;
    var checkMoney = this.checkMoney(user.pp.getTotalCost(qty), id);
    if (checkMoney) {
        var added = user.pp.add(qty);
        user.money-=added.total_cost;
        user.point+=added.point;
        user.pp.disabled = true;
        return 1;
    } else {
        return 0;
    }
};

// add sales service
Users.prototype.addSSP = function(id,qty){
    var user = this.user[id];
    if (!(qty in user.ssp.option)) return false;
    var checkMoney = this.checkMoney(user.ssp.getTotalCost(qty), id);
    if (checkMoney) {
        var added = user.ssp.add(qty);
        user.money-=added.total_cost;
        user.point+=added.point;
        user.ssp.disabled = true;
        return 1;
    } else {
        return 0;
    }
};

// Check user money enough or not
Users.prototype.checkMoney = function(cost,id){
    if (this.user[id].money < cost) {
        return 0;
    }
    return 1;
}

// get user statistics
Users.prototype.getStatistics = function(id, rooms){
    var user = this.user[id];
    var res = {};

    res.userid = id;
    res.warehouse = user.warehouse.getTotal();
    res.handlingeqp = user.handlingeqp.getTotal();
    res.handling_capacity = user.handling_capacity;
    res.rawmaterial = user.rawmaterial.getTotal();
    res.rawmaterial_capacity = user.rawmaterial_capacity;
    res.factory = user.factory.getTotal();
    res.machinebig = user.machinebig.getTotal();
    res.machinesmall = user.machinesmall.getTotal();
    res.machine_capacity = user.machine_capacity;
    res.worker = user.worker.getTotal();
    res.manpower_capacity = user.manpower_capacity;
    res.production = user.production.getTotal();
    res.production_capacity = user.production_capacity;
    res.agent = user.agent.getTotal();
    res.agent_capacity = user.agent.getCapacity();
    res.salesman = user.salesman.getTotal();
    res.salesman_capacity = user.salesman.getCapacity();
    res.clororo = user.clororo.getTotal();
    res.clororo_capacity = user.clororo_capacity;
    res.prd = user.prd.getTotal();
    res.sip = user.sip.getTotal();
    res.qap = user.qap.getTotal();
    res.edp = user.edp.getTotal();
    res.mrp = user.mrp.getTotal();
    res.pp = user.pp.getTotal();
    res.ssp = user.ssp.getTotal();
    res.money = user.money;
    res.point = user.point;
    res.revenue = user.revenue;
    res.bid_initiator = user.bid_initiator;
    res.bid_participator = user.bid_participator;
    res.total_unit_sold = user.total_unit_sold;
    res.sales_unit = user.total_unit_sold;
    res.avg_sales_price = this.get_avg_sales_price(id);
    res.last_sales_price = user.sales_price[0] || 0;

    $report = this.getSaveData(rooms.room[user.roomid], id);

    res.est_profit = $report['net_profit'];
    res.cdm_ratio = $report['cdm_ratio'];
    res.return_equity = $report['return_equity'];
    res.market_share = this.getMarketShare(rooms, id);
    res.profit_sales = $report['net_profit'] / $report['tot_price_clororo_sold'];

    return res;
};

// attach user
Users.prototype.attach = function(user){
    if(!this.user[user.id]) this.addNew(user);
    return this.user[user.id];
};

// set user room
Users.prototype.setRoom = function(usrid,roomid){
    this.user[usrid].roomid = roomid;
};

// for debug list user
Users.prototype.listusers = function(){
    console.log(this.user);
};

// get data user by id
Users.prototype.getData = function(id){
    return this.user[id] || null;
}

// get data user by email
Users.prototype.getDataByEmail = function(email){
    for (i in this.user) {
        if (this.user[i].email == email) return this.user[i];
    }
    return false;
}

// send raw material to production
Users.prototype.sendRaw = function(id) {
    var usr = this.user[id];
    // Raw Material to Production
    if (usr.rawmaterial.getTotal() > 0) {
        raw = usr.rawmaterial.getTotal();
        handlingeqp_capacity = usr.handlingeqp.total_capacity;
        prod_capacity = usr.production.capacityLeft();
        total = 0;

        // Item can be transported by handling equipment
        total = (raw > handlingeqp_capacity)? handlingeqp_capacity : raw;

        // Check Production Capacity
        total = (total > prod_capacity)? prod_capacity : total;

        this.user[id].rawmaterial.total -= total;
        this.user[id].production.total += total;

        return true;
    }
    return false;
}

// process production to clororo
Users.prototype.processProd = function(id) {   
    var usr = this.user[id];
    // Production to Clororo
    if (usr.production.getTotal() > 0) {
        prod = usr.production.getTotal();
        clo_capacity = usr.clororo.capacityLeft();
        total = 0;
        prod = usr.production.getTotal();

        total = (prod > clo_capacity)? clo_capacity : prod;

        this.user[id].production.total -= total;
        this.user[id].clororo.total += total;
        
        return true;
    }

    return false;
}

// process all operational
Users.prototype.processAll = function(id) {
    if(!this.user[id].auto_process) return 0;
    let process_prod = this.processProd(id);
    let process_raw = this.sendRaw(id);
    if (!process_prod && !process_raw) return -1;
    return 1;
}

// set lever auto process in user
Users.prototype.setAutoProcess = function(id, value) {
    this.user[id].auto_process = (value)? 1 : 0;
    return 1;
}

// clororo allowed to sell
Users.prototype.allowedSellClororo = function (id) {
    let user = this.user[id];
    let clo = user.clororo.getTotal();
    return this.user[id].salesman.allowedSellClororo(clo);
}

// sell clororo
Users.prototype.sellClororo = function (user) {
    let usr = this.user[user.id];
    let sell = usr.salesman.sellClororo(user);
    usr.money += sell.earnings - sell.commision;
    usr.clororo.total -= sell.total;
    usr.revenue += sell.earnings;
    usr.total_unit_sold += sell.total;
    usr.sales_unit = user.total_unit_sold;
    usr.sales_price.unshift(user.price);
    return sell;
}

// check if optional decisions allowed to pick
Users.prototype.allowOptionalPick = function (id) {
    var user = this.user[id];
    if (!(user.warehouse.getTotal() > 0)) return false;
    if (!(user.handlingeqp.getTotal() > 0)) return false;
    if (!(user.factory.getTotal() > 0)) return false;
    if (!(user.machinebig.getTotal() > 0) && !(user.machinesmall.getTotal() > 0)) return false;
    if (!(user.worker.getTotal() > 0)) return false;
    if (!(user.agent.getTotal() > 0)) return false;
    if (!(user.salesman.getTotal() > 0)) return false;
    return true;
}

// Do user bid
Users.prototype.bid = function (roomid, io, rooms, userid, value) {
    var user = this.user[userid];
    var check = this.checkMoney(gameconfig.bid_cost, userid);
    if (check) {
        let bid = rooms.userBidding(roomid, io, rooms, userid, value);
        if (bid) {
            user.money -= gameconfig.bid_cost;
            rooms.send_all_player_money(roomid, io);
        }
        return bid;
    } else {
        io.to(roomid).emit('insufficient balance');
        log.print('Insufficient balance while bidding', 'gameplay', data.roomid, this.user[userid].email, socket.id);
        return false;
    }
}

Users.prototype.allowOptionalBid = function (userid) {
    var user = this.user[userid];
    let pre = 0;
    let prod = 0;
    let post = 0;

    // check owned optional pre production
    if (user.prd.getTotal()) pre++;
    if (user.sip.getTotal()) pre++;

    // check owned optional production
    if (user.qap.getTotal()) prod++;
    if (user.edp.getTotal()) prod++;

    // check owned optional post production
    if (user.mrp.getTotal()) post++;
    if (user.pp.getTotal()) post++;
    if (user.ssp.getTotal()) post++;

    if (pre >= 1 && prod >= 1 && post >= 2) return true;
    else return false;

}

// Get Users Sales Price
Users.prototype.get_avg_sales_price = function (userid) {
    var sales_price = this.user[userid].sales_price;
    var tot = 0;
    for (i in sales_price) {
        tot += sales_price[i];
    }
    var avg_sales_price = tot / sales_price.length;
    return avg_sales_price;
}

// Save Data User
Users.prototype.saveData = function (room, userid) {
    var user = this.user[userid];
    var roomid = user.roomid;
    log.print('Saving Data ' + user.email, 'gameplay', roomid, userid);
    
    var dtInsert = this.getSaveData(room, userid);

    var insertQuery = squel.insert().into('game_history');

    for (i in dtInsert) {
        insertQuery.set(i, dtInsert[i]);
    }

    insertQuery = insertQuery.toString();

    // log.print('Save Query: ' +insertQuery, 'gameplay', roomid, userid);

    connection.query(insertQuery, function(err, rows) {
        if (err) return;
        log.print('Data has been saved (' + user.email + ')', 'gameplay', roomid, userid);
    });
}

Users.prototype.getReport = function(userid) {
    var user = this.user[userid];
    var roomid = user.roomid;
    var report = {};

    report['room_id'] = roomid;
    report['user_id'] = userid;
    report['initial_balance'] = gameconfig.initial_capital;
    report['balance'] = user.money;
    report['tot_clororo_sold'] = user.total_unit_sold;
    report['tot_price_clororo_sold'] = user.revenue;
    report['tot_cash_inflow'] = report['tot_price_clororo_sold'];
    report['buy_warehouse_unit'] = user.warehouse.getTotal();
    report['buy_warehouse_price'] = gameconfig.warehouse.cost;
    report['buy_warehouse_tot_price'] = user.warehouse.getTotalCost();
    report['dep_warehouse_price'] = gameconfig.warehouse.depreciation;
    report['dep_warehouse_tot_price'] = report['buy_warehouse_unit'] * report['dep_warehouse_price'];
    report['buy_handling_equipment_unit'] = user.handlingeqp.getTotal();
    report['buy_handling_equipment_price'] = gameconfig.handlingeqp.cost;
    report['buy_handling_equipment_tot_price'] = user.handlingeqp.getTotalCost();
    report['dep_handling_equipment_price'] = gameconfig.handlingeqp.depreciation;
    report['dep_handling_equipment_tot_price'] = report['buy_handling_equipment_unit'] * report['dep_handling_equipment_price'];
    report['buy_factory_unit'] = user.factory.getTotal();
    report['buy_factory_price'] = gameconfig.factory.cost;
    report['buy_factory_tot_price'] = user.factory.getTotalCost();
    report['dep_factory_price'] = gameconfig.factory.depreciation;
    report['dep_factory_tot_price'] = report['buy_factory_unit'] * report['dep_factory_price'];
    report['buy_big_machine_unit'] = user.machinebig.getTotal();
    report['buy_big_machine_price'] = gameconfig.machinebig.cost;
    report['buy_big_machine_tot_price'] = user.machinebig.getTotalCost();
    report['dep_big_machine_price'] = gameconfig.machinebig.depreciation;
    report['dep_big_machine_tot_price'] = report['buy_big_machine_unit'] * report['dep_big_machine_price'];
    report['buy_small_machine_unit'] = user.machinesmall.getTotal();
    report['buy_small_machine_price'] = gameconfig.machinesmall.cost;
    report['buy_small_machine_tot_price'] = user.machinesmall.getTotalCost();
    report['dep_small_machine_price'] = gameconfig.machinesmall.depreciation;
    report['dep_small_machine_tot_price'] = report['buy_small_machine_unit'] * report['dep_small_machine_price'];
    report['buy_worker_unit'] = user.worker.getTotal();
    report['buy_worker_price'] = gameconfig.worker.cost;
    report['buy_worker_tot_price'] = user.worker.getTotalCost();
    report['buy_agent_unit'] = user.agent.getTotal();
    report['buy_agent_price'] = gameconfig.agent.cost;
    report['buy_agent_tot_price'] = user.agent.getTotalCost();
    report['buy_salesman_unit'] = user.salesman.getTotal();
    report['buy_salesman_price'] = gameconfig.salesman.cost;
    report['buy_salesman_tot_price'] = user.salesman.getTotalCost();
    report['buy_prd_packet'] = user.prd.getTotal();
    report['buy_prd_price'] = user.prd.getTotalCost();
    report['buy_sip_packet'] = user.sip.getTotal();
    report['buy_sip_price'] = user.sip.getTotalCost();
    report['buy_qap_packet'] = user.qap.getTotal();
    report['buy_qap_price'] = user.qap.getTotalCost();
    report['buy_edp_packet'] = user.edp.getTotal();
    report['buy_edp_price'] = user.edp.getTotalCost();
    report['buy_mrp_packet'] = user.mrp.getTotal();
    report['buy_mrp_price'] = user.mrp.getTotalCost();
    report['buy_pp_packet'] = user.pp.getTotal();
    report['buy_pp_price'] = user.pp.getTotalCost();
    report['buy_ssp_packet'] = user.ssp.getTotal();
    report['buy_ssp_price'] = user.ssp.getTotalCost();
    report['buy_raw_material_lot'] = user.rawmaterial.getAllTotal();
    report['buy_raw_material_price'] = gameconfig.rawmaterial.cost;
    report['buy_raw_material_tot_price'] = user.rawmaterial.getTotalCost(report['buy_raw_material_lot']);
    report['join_bid_total'] = user.bid_initiator + user.bid_participator;
    report['join_bid_price']   = gameconfig.bid_cost;
    report['join_bid_tot_price'] = report['join_bid_total'] * report['join_bid_price'];
    report['buy_auto_process'] = (user.buyed_auto_process)? 1 : 0;
    report['buy_auto_process_price'] = gameconfig.automatic_cost;
    report['buy_auto_process_tot_price'] = report['buy_auto_process'] * report['buy_auto_process_price'];
    report['personal_administration_cost'] = gameconfig.personal_administration_cost;
    report['tot_cash_outflow'] = this.totCashOutflow(report, userid);
    report['pre_production_lot'] = user.rawmaterial.getTotal();
    report['pre_production_price'] = gameconfig.rawmaterial.cost;
    report['pre_production_tot_price'] = user.rawmaterial.getTotalCost();
    report['production_lot'] = user.production.getTotal();
    report['production_price'] = gameconfig.production.cost;
    report['production_tot_price'] = user.production.getTotalCost();
    report['post_production_lot'] = user.clororo.getTotal();
    report['post_production_price'] = gameconfig.clororo.cost;
    report['post_production_tot_price'] = user.clororo.getTotalCost();
    report['cost_of_goods_sold'] = this.getCostGoodSold(report, userid);
    report['gross_profit'] = report['tot_price_clororo_sold'] - report['cost_of_goods_sold'];
    report['tot_marketing_expenses'] = this.getTotalMarketExp(report, userid);;
    report['tot_admin_overhead'] = report['personal_administration_cost'] + report['dep_warehouse_tot_price'];
    report['net_profit'] = ((report['gross_profit'] - report['tot_marketing_expenses']) - report['tot_admin_overhead']);
    report['cdm_ratio'] = (((report['cost_of_goods_sold'] / report['tot_clororo_sold']) - 25) / 25);
    report['return_equity'] = report['net_profit'] / report['initial_balance'];

    report['cdm_ratio'] = isFinite(report['cdm_ratio']) && report['cdm_ratio'] || 0;

    return report;
}

Users.prototype.getSaveData = function(room, userid) {
    var user = this.user[userid];
    var roomid = user.roomid;
    var dtInsert = {};
    var playing_at = room.playingAt;

    dtInsert = this.getReport(userid);
    dtInsert['playing_at'] = date.format(playing_at, 'YYYY-MM-DD');

    return dtInsert;
}

Users.prototype.totCashOutflow = function(dt, userid) {
    var total = 0;
    total += dt['buy_warehouse_tot_price'];
    total += dt['buy_handling_equipment_tot_price'];
    total += dt['buy_factory_tot_price'];
    total += dt['buy_big_machine_tot_price'];
    total += dt['buy_small_machine_tot_price'];
    total += dt['buy_worker_tot_price'];
    total += dt['buy_agent_tot_price'];
    total += dt['buy_salesman_tot_price'];
    total += dt['buy_prd_price'];
    total += dt['buy_sip_price'];
    total += dt['buy_qap_price'];
    total += dt['buy_edp_price'];
    total += dt['buy_mrp_price'];
    total += dt['buy_pp_price'];
    total += dt['buy_ssp_price'];
    total += dt['buy_raw_material_tot_price'];
    total += dt['join_bid_tot_price'];
    total += dt['buy_auto_process_tot_price'];
    total += dt['personal_administration_cost'];

    return total;
}

Users.prototype.getCostGoodSold = function (dt, userid) {
    var total_a = 0;
    total_a += dt['buy_raw_material_tot_price'];
    total_a += dt['buy_worker_tot_price'];
    total_a += dt['buy_prd_price'];
    total_a += dt['buy_sip_price'];
    total_a += dt['buy_qap_price'];
    total_a += dt['buy_edp_price'];
    total_a += dt['buy_auto_process_tot_price'];
    total_a += dt['dep_handling_equipment_tot_price'];
    total_a += dt['dep_factory_tot_price'];
    total_a += dt['dep_big_machine_tot_price'];
    total_a += dt['dep_small_machine_tot_price'];

    var total_b = 0;
    total_b += dt['pre_production_tot_price'];
    total_b += dt['production_tot_price'];
    total_b += dt['post_production_tot_price'];

    return total_a - total_b;
}

Users.prototype.getTotalMarketExp = function (dt, userid) {
    var total = 0;

    total += dt['buy_agent_tot_price'];
    total += dt['buy_salesman_tot_price'];
    total += this.user[userid].salesman.commision_total;
    total += dt['buy_mrp_price'];
    total += dt['buy_pp_price'];
    total += dt['buy_ssp_price'];
    total += dt['join_bid_tot_price'];

    return total;
}

Users.prototype.getMarketShare = function (rooms, userid, roomid) {
    userid = userid || null;
    roomid = roomid || null;

    if (userid) {
        var user = this.user[userid];
        var rid = user.roomid;
        var room = rooms.room[rid];
    } else if (roomid) {
        var rid = roomid
        var room = rooms.room[rid];
    }

    var dtuser = rooms.listUsers(rid)
    var tot_all = 0;
    for (i in dtuser) {
        tot_all += dtuser[i].total_unit_sold;
    }

    if (!userid && roomid) {
        result = {};
        for (i in dtuser) {
            result[dtuser[i]['id']] = (dtuser[i] * 100) / tot_all;
        }
        return result;
    } else if (userid) {
        result = (user.total_unit_sold * 100) / tot_all;
        return result;
    } else return 0;
}

module.exports = new Users();
