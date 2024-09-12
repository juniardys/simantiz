define([
    "js/warehouse",
    "js/handlingeqp",
    "js/rawmaterial",
    "js/factory",
    "js/machinebig",
    "js/machinesmall",
    "js/production",
    "js/worker",
    "js/agent",
    "js/salesman",
    "js/clororo",
    "js/prd",
    "js/sip",
    "js/qap",
    "js/edp",
    "js/mrp",
    "js/pp",
    "js/ssp",
], function(
    warehouse,
    handlingeqp,
    rawmaterial,
    factory,
    machinebig,
    machinesmall,
    production,
    worker,
    agent,
    salesman,
    clororo,
    prd,
    sip,
    qap,
    edp,
    mrp,
    pp,
    ssp,
) {
var socket = io();
var res = {};
// part highlight
var part_highlight = [
    { data: 'rawmaterial_capacity', selector: 'warehouse'},
    { data: 'handling_capacity', selector: 'handling'},
    { data: 'machine_capacity', selector: 'machine'},
    { data: 'manpower_capacity', selector: 'manpower'},
    { data: 'production_capacity', selector: 'production'},
    { data: 'agent_capacity', selector: 'agent'},
    { data: 'salesman_capacity', selector: 'salesman'},
    { data: 'rawmaterial', selector: 'rawmaterial'},
    { data: 'production', selector: 'product'},
    { data: 'clororo', selector: 'clororo'},
    { data: 'prd', selector: 'prd'},
    { data: 'sip', selector: 'sip'},
    { data: 'qap', selector: 'qap'},
    { data: 'edp', selector: 'edp'},
    { data: 'mrp', selector: 'mrp'},
    { data: 'pp', selector: 'pp'},
    { data: 'ssp', selector: 'ssp' },
    { data: 'revenue', selector: 'revenue'},
    { data: 'sales_unit', selector: 'sales_unit' },
    { data: 'avg_sales_price', selector: 'avg_sales_price' },
];

// part statistics
var part_statistics = [
    { data: 'money', selector: 'balance', money: true },
    { data: 'revenue', selector: 'revenue', money: true },
    { data: 'bid_initiator', selector: 'bid_initiator', money: false },
    { data: 'bid_participator', selector: 'bid_participator', money: false },
    { data: 'total_unit_sold', selector: 'total_unit_sold', money: false },
    { data: 'avg_sales_price', selector: 'avg_sales_price', money: true },
    { data: 'last_sales_price', selector: 'last_sales_price', money: true },
    { data: 'est_profit', selector: 'est_profit', money: true },
    { data: 'cdm_ratio', selector: 'cdm_ratio', money: false },
    { data: 'return_equity', selector: 'return_equity', money: false },
    { data: 'market_share', selector: 'market_share', money: false },
    { data: 'profit_sales', selector: 'profit_sales', money: false },
]

res.myturn = false;
res.bidRunning = false;
res.modalAutoProcess = false;
res.saveGame = false;

// function check modal
var checkModal = function(name,inputValue){
    var err = false;
    switch(name){
        case 'material':
            err = rawmaterial.checkErr(inputValue);
            break;
        case 'warehouse':
            err = warehouse.checkErr(inputValue);
            break;
        case 'handlingeqp':
            err = handlingeqp.checkErr(inputValue);
            break;
        case 'factory':
            err = factory.checkErr(inputValue);
            break;
        case 'machinebig':
            err = machinebig.checkErr(inputValue);
            break;
        case 'machinesmall':
            err = machinesmall.checkErr(inputValue);
            break;
        case 'worker':
            err = worker.checkErr(inputValue);
            break;
        case 'agent':
            err = agent.checkErr(inputValue);
            break;
        case 'salesman':
            err = salesman.checkErr(inputValue);
            break;
        case 'prd':
            err = prd.checkErr(inputValue);
            break;
        case 'sip':
            err = sip.checkErr(inputValue);
            break;
        case 'qap':
            err = qap.checkErr(inputValue);
            break;
        case 'edp':
            err = edp.checkErr(inputValue);
            break;
        case 'mrp':
            err = mrp.checkErr(inputValue);
            break;
        case 'pp':
            err = pp.checkErr(inputValue);
            break;
        case 'ssp':
            err = ssp.checkErr(inputValue);
            break;
    }
    return err;
};

// Open modal
var openModal = function(attr,onclick){
    // Set for text description
    attr.text = attr.text || '';
    if(attr.text) attr.text = '\n' + attr.text;

    // For normal text input
    if (attr.type == "inp1") {
        var opt = {
            title: attr.title,
            text: "<h4>Set your Value:</h4>" + attr.text,
            type: "input",
            html: true,
            showCancelButton: true,
            closeOnConfirm: false,
            animation: "slide-from-top",
            inputPlaceholder: "Set Value"
        };

        swal(opt, function(inputValue){
            inputValue = parseInt(inputValue);
            var err = checkModal(attr.name,inputValue);
            if(err){
                switch (err) {
                    case 1:
                        break;
                    case 2:
                        swal.showInputError("You need to set value");
                        break;
                    case 3:
                        swal.showInputError("Please input a number");
                        break;
                    case 4:
                        swal.showInputError("Max Warehouse allowed: "+warehouse.max+" ("+(warehouse.getLeft())+" left)");
                        break;
                    case 5:
                        swal.showInputError("Max Raw Material allowed: "+rawmaterial.capacity+" ("+(rawmaterial.getLeft())+" left)");
                        break;
                    case 6:
                        swal.showInputError("Max Factory allowed: "+factory.max+" ("+(factory.getLeft())+" left)");
                        break
                    case 7:
                        swal.showInputError("Max Handling Equipment allowed: "+handlingeqp.max+" ("+(handlingeqp.getLeft())+" left)");
                        break;
                    default:

                }
                return false;
            }
            onclick(inputValue);
            swal.close();
        });
    // For radio input
    } else if(attr.type == "inp2") {
        var radio = '';
        for (var i = 0; i < attr.radio.length; i++) {
            radio += '<input type="radio" name="swal-radio" value="'+attr.radio[i].value+'" id="swal-radio-'+i+'" /><label for="swal-radio-'+i+'" class="blue-grey-text text-darken-3">'+attr.radio[i].label+'</label>';
            if((i+1) < attr.radio.length) radio += '<br>';
        }
        var input = '<p style="text-align:left;padding-left:20%;color:#000;">'+radio+'</p>';
        var opt = {
            title: attr.title,
            text: attr.text+'Set your Value:'+input,
            html:true,
            showCancelButton: true,
            closeOnConfirm: false,
            animation: "slide-from-top",
            inputPlaceholder: "Set Value" 
        };

        swal(opt, function(confirm){
            if (confirm === false) return false;
            inputValue = parseInt($('input[name=swal-radio]:checked').val());
            // var err = checkModal(attr.name,inputValue);
            onclick(inputValue);
            swal.close();
        });
    }
};

// When initialize game
res.initialize = function(attr,roomstatus){
    $('ul.tabs').tabs();

    // Initialize Data
    var money = attr.money;
    var rm = attr.rawmaterial.total || 0;
    var rm_cty = attr.rawmaterial_capacity || 0;
    var prod = attr.production.total || 0;
    var prod_cty = attr.production_capacity || 0;
    var clo = attr.clororo.total || 0;
    var clo_cty = attr.clororo_capacity || 0;
    var w_tot = attr.warehouse.total || 0;
    var he_tot = attr.handlingeqp.total || 0;
    var fac_tot = attr.factory.total || 0;
    var mb_tot = attr.machinebig.total || 0;
    var ms_tot = attr.machinesmall.total || 0;
    var worker_tot = attr.worker.total || 0;
    var ag_tot = attr.agent.total || 0;
    var sm_tot = attr.salesman.total || 0;
    var prd_tot = attr.prd.total || 0;
    var sip_tot = attr.sip.total || 0;
    var qap_tot = attr.qap.total || 0;
    var edp_tot = attr.edp.total || 0;
    var mrp_tot = attr.mrp.total || 0;
    var pp_tot = attr.pp.total || 0;
    var ssp_tot = attr.ssp.total || 0;

    // Initialize Money
    this.updateMoney(money);

    // Initialize Raw Material
    rawmaterial.init(attr.rawmaterial);
    this.updateRMTotal(rm);
    this.updateRMCapacity(rm_cty);

    // Initialize Production
    production.init(attr.production);
    this.updateProdTotal(prod);
    this.updateProdCapacity(prod_cty);

    // Initialize Clororo
    clororo.init(attr.clororo);
    this.updateCloTotal(clo);
    this.updateCloCapacity(clo_cty);

    // Initialize Warehouse
    warehouse.init(attr.warehouse);
    this.updateWTotal(w_tot);

    // Initialize Handling Equipment
    handlingeqp.init(attr.handlingeqp);
    this.updateHETotal(he_tot);

    // Initialize Factory
    factory.init(attr.factory);
    this.updateFacTotal(fac_tot);

    // Initialize Big Machine
    machinebig.init(attr.machinebig);
    this.updateMBTotal(mb_tot);

    // Initialize Small Machine
    machinesmall.init(attr.machinesmall);
    this.updateMSTotal(ms_tot);

    // Initialize Worker
    worker.init(attr.worker);
    this.updateWorkerTotal(worker_tot);

    // Initialize Agent
    agent.init(attr.agent);
    this.updateAGTotal(ag_tot);

    // Initialize Salesman
    salesman.init(attr.salesman);
    this.updateSMTotal(sm_tot);

    // Initialize Product R & D
    prd.init(attr.prd);
    this.updatePRDTotal(prd_tot);

    // Initialize System Improvement
    sip.init(attr.sip);
    this.updateSIPTotal(sip_tot);

    // Initialize Quality Assurance
    qap.init(attr.qap);
    this.updateQAPTotal(qap_tot);

    // Initialize Employee Development
    edp.init(attr.edp);
    this.updateEDPTotal(edp_tot);

    // Initialize Market Research
    mrp.init(attr.mrp);
    this.updateMRPTotal(mrp_tot);

    // Initialize Promotion Program
    pp.init(attr.pp);
    this.updatePPTotal(pp_tot);

    // Initialize Sales Service
    ssp.init(attr.ssp);
    this.updateSSPTotal(ssp_tot);

    // Initialize Auto Proccess Lever
    this.updateAutoProcess(attr.auto_process);

    // Initialize Price Bidding Option
    this.updateBiddingPriceOption(attr.clororo.option);

    // ui bid cost
    $('#bid_cost').text(bid_cost);

    if(roomstatus=='y') {
        this.openGame();
    }
};

// prepare game
res.prepareGame = function(users, roomid){
    for(var i=0;i<users.length;i++){
        if($("#part_user_" + users[i].id).length != 0) continue;
        $('#part_user').append('<th id="part_user_'+users[i].id+'">'+users[i].name+'</th>');

        for(var x in part_highlight){
            $('#part_'+part_highlight[x]['selector']).append('<td id="'+part_highlight[x]['selector']+'_'+users[i].id+'">0</td>');
        }
    }
    
    this.updateListPlayer(users);

    socket.emit('getHighlight', roomid);
};

// function to open board game
res.openGame = function(){
    $('#dv_cont_room').addClass('hidden');
    $('#dv_cont_game').removeClass('hidden');
    $('#balance').removeClass('hidden');
};

// update highlight
res.updateHighlight = function(data){
    var userid = data.userid;

    for(var x in part_highlight){
        var tx = part_highlight[x]['data'];
        $('#'+part_highlight[x]['selector']+'_'+userid).text(data[tx]||0);
    }
};

// update statistics
res.updateStatistics = function (data) {
    for (var i in part_statistics) {
        var ps = part_statistics[i];
        var money = ps['money'];
        this.countJS('ps_' + ps['selector'], data[ps['data']] || 0, money);
    }
}

// Update list Player
res.updateListPlayer = function(users){

    for(var i=0;i<users.length;i++){
        // List Player
        if($("#list_player_" + users[i].id).length != 0) continue;
        $('#list_player > tbody')
        .append(
            '<tr id="list_player_'+users[i].id+'" class="list_player">'+
                '<td id="list_player_name_' + users[i].id +'">'+users[i].name+'</td>'+
                '<td>R$ <span id="list_player_money_' + users[i].id +'">0</span></td>'+
                '<td id="list_player_point_' + users[i].id +'">0</td>'+
            '</tr>'
        );
    }
}


/* ============================= socket =================== */
res.listen = function(sockets, callback){
    var $this = this;
    $('#dv_warehouse').click(function(e){
        e.preventDefault();
        if(!$this.myturn) return;
        $this.inputWarehouse(function(total){
            callback('warehouse',total);
        });
    });

    $('#dv_handling_eqp').click(function(e){
        e.preventDefault();
        if(!$this.myturn) return;
        $this.inputHandlingEQP(function(total){
            callback('handlingeqp',total);
        });
    });

    $('#dv_raw_mat').click(function(e){
        e.preventDefault();
        if(!$this.myturn) return;
        $this.inputRawMaterial(function(total){
            callback('rawmaterial',total);
        });
    });


    $('#dv_factory').click(function(e){
        e.preventDefault();
        if(!$this.myturn) return;
        $this.inputFactory(function(total){

            callback('factory',total);
        });
    });

    $('#dv_machine_big').click(function(e){
        e.preventDefault();
        if(!$this.myturn) return;
        $this.inputMachineBig(function(total){
            callback('machinebig',total);
        });
    });

    $('#dv_machine_small').click(function(e){
        e.preventDefault();
        if(!$this.myturn) return;
        $this.inputMachineSmall(function(total){
            callback('machinesmall',total);
        });
    });

    $('#dv_worker').click(function(e){
        e.preventDefault();
        if(!$this.myturn) return;
        $this.inputWorker(function(total){
            callback('worker',total);
        });
    });

    $('#dv_agent').click(function(e){
        e.preventDefault();
        if(!$this.myturn) return;
        $this.inputAgent(function(total){
            callback('agent',total);
        });
    });

    $('#dv_salesman').click(function(e){
        e.preventDefault();
        if(!$this.myturn) return;
        $this.inputSalesman(function(total){
            callback('salesman',total);
        });
    });

    $('#dv_prd').click(function(e){
        e.preventDefault();
        if(!$this.myturn) return;
        sockets.emit('optional decisions', {type: 'prd', userid: sockets.user.id, roomid: sockets.roomid});
    });

    $('#dv_sip').click(function(e){
        e.preventDefault();
        if(!$this.myturn) return;
        sockets.emit('optional decisions', {type: 'sip', userid: sockets.user.id, roomid: sockets.roomid});
    });

    $('#dv_qap').click(function(e){
        e.preventDefault();
        if(!$this.myturn) return;
        sockets.emit('optional decisions', {type: 'qap', userid: sockets.user.id, roomid: sockets.roomid});
    });

    $('#dv_edp').click(function(e){
        e.preventDefault();
        if(!$this.myturn) return;
        sockets.emit('optional decisions', {type: 'edp', userid: sockets.user.id, roomid: sockets.roomid});
    });

    $('#dv_mrp').click(function(e){
        e.preventDefault();
        if(!$this.myturn) return;
        sockets.emit('optional decisions', {type: 'mrp', userid: sockets.user.id, roomid: sockets.roomid});
    });

    $('#dv_pp').click(function(e){
        e.preventDefault();
        if(!$this.myturn) return;
        sockets.emit('optional decisions', {type: 'pp', userid: sockets.user.id, roomid: sockets.roomid});
    });

    $('#dv_ssp').click(function(e){
        e.preventDefault();
        if(!$this.myturn) return;
        sockets.emit('optional decisions', {type: 'ssp', userid: sockets.user.id, roomid: sockets.roomid});
    });

    $('#lever_process').click(function(e){
        value = $(this).is(':checked');
        $this.updateAutoProcess(!value);
        callback('set auto process', value);
    });

    $('#send_raw').click(function(e){
        e.preventDefault();
        callback('process game', 'raw');
    });

    $('#process_production').click(function(e){
        e.preventDefault();
        callback('process game', 'production');
    });

    $('.auto_process').click(function(e){
        e.preventDefault();
        callback('process game', 'all');
    });

    $('#dv_bid').click(function(e) {
        e.preventDefault();
        let value = $('#select-bidding-price').val();
        callback('bidding', value);
    })
};
/* ============================= end socket =================== */





/* ========================= warehouse ========================= */

res.inputWarehouse = function(callback){
    var $this = this;
    var text = "Price <b>R$ " + warehouse.cost + "/building</b><br>" + "Capacity: <b>" + warehouse.capacity + " lots</b><br>" + "Max: <b>" + warehouse.max + " building</b>";
    openModal({title: "Gedung Kantor & Gudang",name:'warehouse',type:'inp1',text:text},function(inputValue){
        callback(inputValue);
    });
};

res.updateWTotal = function(tot){
    warehouse.total = tot;
    warehouse.updateCapacity();
    $('#warehouse_val').text(tot);
};

/* ========================= end warehouse ========================= */



/* ========================= Handling Equipment ========================= */

res.inputHandlingEQP = function(callback){
    var $this = this;
    var text = "Price <b>R$ " + handlingeqp.cost + "/unit</b><br>" + "Capacity: <b>" + handlingeqp.capacity + " lots/process</b><br>" + "Max: <b>" + handlingeqp.max + " unit</b>";
    openModal({title: "Handling Equipment",name:'handlingeqp',type:'inp1',text:text},function(inputValue){
        callback(inputValue);
    });
};

res.updateHETotal = function(tot){
    handlingeqp.total = tot;
    handlingeqp.updateCapacity();
    $('#handling_eqp_val').text(tot);
};

/* ========================= end Handling Equipment ========================= */



/* ========================= raw material ========================= */

res.inputRawMaterial = function(callback){
    var $this = this;

    openModal({title: "Raw Material",name:'material',type:'inp1'},function(inputValue){
        callback(inputValue);
    });

};

res.updateRMTotal = function(tot){
    rawmaterial.total = tot;
    $('#rm_total').text(tot);
};

res.updateRMCapacity = function(tot){
    rawmaterial.capacity = tot;
    $('#rm_capacity').text(tot);
};

/* ========================= end raw material ========================= */


/* ========================= factory ========================= */
res.inputFactory = function(callback){
    var $this = this;
    var text = "Price <b>R$ " + factory.cost + "/building</b><br>" + "Max: <b>" + factory.max + " building</b>";
    openModal({title: "Factory",name:'factory',type:'inp1',text:text},function(inputValue){
        callback(inputValue);
    });
};

res.updateFacTotal = function(tot){
    factory.total = tot;
    factory.updateCapacity();
    $('#factory_val').text(tot);
};
/* ========================= end factory ========================= */


/* ========================= machine big ========================= */
res.inputMachineBig = function(callback){
    var $this = this;
    var text = "Price <b>R$ " + machinebig.cost + "/unit</b><br>" + "Capacity: <b>" + machinebig.max_lot + " lots/process</b><br>" + "Max: <b>N/A</b>";
    openModal({title: "Big Machine",name:'machinebig',type:'inp1',text:text},function(inputValue){
        callback(inputValue);
    });
};

res.updateMBTotal = function(tot){
    machinebig.total = tot;
    // machinebig.updateUnitTotal();
    $('#machine_big_val').text(tot);
};
/* ========================= end machine big ========================= */

/* ========================= machine small ========================= */
res.inputMachineSmall = function(callback){
    var $this = this;
    var text = "Price <b>R$ " + machinesmall.cost + "/unit</b><br>" + "Capacity: <b>" + machinesmall.max_lot + " lots/process</b><br>" + "Max: <b>N/A</b>";
    openModal({title: "Small Machine",name:'machinesmall',type:'inp1',text:text},function(inputValue){
        callback(inputValue);
    });
};

res.updateMSTotal = function(tot){
    machinesmall.total = tot;
    // machinesmall.updateUnitTotal();
    $('#machine_small_val').text(tot);
};
/* ========================= end machine small ========================= */


/* ========================= Worker ========================= */
res.inputWorker = function(callback){
    var $this = this;
    var text = "Price <b>R$ " + worker.cost + "/person</b><br>" + "Capacity: <b>" + worker.max_lot + " lots/process</b><br>" + "Max: <b>N/A</b>";
    openModal({title: "Worker",name:'worker',type:'inp1',text:text},function(inputValue){
        callback(inputValue);
    });
};

res.updateWorkerTotal = function(tot){
    worker.total = tot;
    // worker.updateCapacity();
    $('#worker_val').text(tot);
};
/* ========================= end Worker ========================= */


/* ========================= production ========================= */

res.updateProdTotal = function(tot){
    production.total = tot;
    $('#prod_total').text(tot);
};

res.updateProdCapacity = function(tot){
    production.production_capacity = tot;
    $('#prod_capacity').text(tot);
};

/* ========================= end production ========================= */


/* ========================= agent ========================= */
res.inputAgent = function(callback){
    var $this = this;
    var text = "Price <b>R$ " + agent.cost + "/agent</b><br>" + "Capacity: <b>" + agent.capacity + " lots</b><br>" + "Max: <b>N/A</b>";
    openModal({title: "Agent",name:'agent',type:'inp1',text:text},function(inputValue){
        callback(inputValue);
    });
};

res.updateAGTotal = function(tot){
    agent.total = tot;
    agent.updateCapacity();
    $('#agent_val').text(tot);
};
/* ========================= end agent ========================= */


/* ========================= salesman ========================= */
res.inputSalesman = function(callback){
    var $this = this;
    var text = "Price <b>R$ " + salesman.cost + "/sales</b><br>" + "Capacity: <b>" + salesman.capacity + " lots</b><br>" + "Commision: <b>" + (salesman.commission*100) + "%/lots sold</b></br>Max: <b>N/A</b>";
    openModal({title: "Sales Force",name:'salesman',type:'inp1',text:text},function(inputValue){
        callback(inputValue);
    });
};

res.updateSMTotal = function(tot){
    salesman.total = tot;
    salesman.updateCapacity();
    $('#salesman_val').text(tot);
};
/* ========================= end salesman ========================= */



/* ========================= clororo ========================= */

res.updateCloTotal = function(tot){
    clororo.total = tot;
    $('#clo_total').text(tot);
};

res.updateCloCapacity = function(tot){
    clororo.capacity = tot;
    $('#clo_capacity').text(tot);
};

/* ========================= end clororo ========================= */

/* ========================= product r & d ========================= */

res.inputPRD = function(radio = [], callback){
    var $this = this;
    openModal({title: "Product R & D",name:'prd',type:'inp2',radio: radio},function(inputValue){
        callback(inputValue);
    });
};

res.updatePRDTotal = function(tot){
    prd.total = tot;
    $('#prd_val').text(tot);
};

/* ========================= end product r & d ========================= */

/* ========================= system improvement ========================= */

res.inputSIP = function(radio = [], callback){
    var $this = this;
    openModal({title: "System Improvement",name:'sip',type:'inp2',radio: radio},function(inputValue){
        callback(inputValue);
    });
};

res.updateSIPTotal = function(tot){
    sip.total = tot;
    $('#sip_val').text(tot);
};

/* ========================= end system improvement ========================= */

/* ========================= quality assurance ========================= */

res.inputQAP = function(radio = [], callback){
    var $this = this;
    openModal({title: "Quality Assurance",name:'qap',type:'inp2',radio: radio},function(inputValue){
        callback(inputValue);
    });
};

res.updateQAPTotal = function(tot){
    qap.total = tot;
    $('#qap_val').text(tot);
};

/* ========================= end quality assurance ========================= */

/* ========================= employee development ========================= */

res.inputEDP = function(radio = [], callback){
    var $this = this;
    openModal({title: "Employee Development",name:'edp',type:'inp2',radio: radio},function(inputValue){
        callback(inputValue);
    });
};

res.updateEDPTotal = function(tot){
    edp.total = tot;
    $('#edp_val').text(tot);
};

/* ========================= end employee development ========================= */

/* ========================= market research ========================= */

res.inputMRP = function(radio = [], callback){
    var $this = this;
    openModal({title: "Market Research",name:'mrp',type:'inp2',radio: radio},function(inputValue){
        callback(inputValue);
    });
};

res.updateMRPTotal = function(tot){
    mrp.total = tot;
    $('#mrp_val').text(tot);
};

/* ========================= end market research ========================= */

/* ========================= promotion program ========================= */

res.inputPP = function(radio = [], callback){
    var $this = this;
    openModal({title: "Promotion Program",name:'pp',type:'inp2',radio: radio},function(inputValue){
        callback(inputValue);
    });
};

res.updatePPTotal = function(tot){
    pp.total = tot;
    $('#pp_val').text(tot);
};

/* ========================= end promotion program ========================= */

/* ========================= sales service ========================= */

res.inputSSP = function(radio = [], callback){
    var $this = this;
    openModal({title: "Sales Service",name:'ssp',type:'inp2',radio: radio},function(inputValue){
        callback(inputValue);
    });
};

res.updateSSPTotal = function(tot){
    ssp.total = tot;
    $('#ssp_val').text(tot);
};

/* ========================= end sales service ========================= */

/* ========================= end Insufficient Balance ========================= */

res.showInsufficientBalance = function(){
    Materialize.toast('Insufficient Balance', 2000);
}

/* ========================= end Insufficient Balance ========================= */

/* ========================= execution time ========================= */

res.updateExecTime = function(time){
    $('#exec_time').text(time);
}

/* ========================= end execution time ========================= */

/* ========================= participant turn ========================= */

res.updateParticipantTurn = function(turn){
    $('.list_player').removeClass('red');
    $('#list_player_'+turn).addClass('red');
}

res.updateParticipantTurnLabel = function(turn, time){
    if(turn){
        this.myturn = true;
        $('#exec_time_label').text('Deadline to execute');
        $('#exec_time_box').css('background-color', 'red');
    } else {
        this.myturn = false;
        if (!this.bidRunning && !this.modalAutoProcess && !swal_logout) swal.close();
        $('#exec_time_label').text('Waiting for next turn');
        $('#exec_time_box').css('background-color', 'aqua');
    }
}

/* ========================= end participant turn ========================= */

/* ========================= round ========================= */

res.updateRound = function(round){
    $('#dv_round').text(round);
}

/* ========================= end round ========================= */

/* ========================= game time left ========================= */

res.updateGameTimeLeft = function(time){
    $('#dv_game_time_left').text(time);
}

/* ========================= end game time left ========================= */

/* ========================= auto process ========================= */

res.updateAutoProcess = function(value){
    if (value) {
        $('.auto_process').removeClass('hidden');
        $('.manual_process').addClass('hidden');
        $('#lever_process').prop('checked', value);
    } else {
        $('.auto_process').addClass('hidden');
        $('.manual_process').removeClass('hidden');
        $('#lever_process').prop('checked', value);
    }
}

/* ========================= end auto process ========================= */

/* ========================= remove user ========================= */

res.removeUser = function(userid){
    // Delete List Player
    $('#list_player_'+userid).remove();

    // Delete Highlight
    $('#part_user_'+userid).remove();
    
    for(var x in part_highlight){
        $('#'+part_highlight[x]['selector']+'_'+userid).remove();
    }
}

/* ========================= end remove user ========================= */

/* ========================= Point ========================= */

res.updateListPlayerPoint = function (id, point) {
    this.countJS('list_player_point_' + id, point);
}

res.updateUserPoint = function (point) {
    for (let i = 1; i <= 3; i++) {
        this.countJS('dv_point_'+i, point);
    }
}

/* ========================= end Point ========================= */

/* ========================= Money ========================= */

res.updateMoney = function (money) {
    this.countJS('dv_duit', money, true);
};

res.updateListPlayerMoney = function (id, money) {
    this.countJS('list_player_money_' + id, money, true);
}

/* ========================= Money ========================= */

/* ========================= count js ========================= */

res.countJS = function (id, value, money) {
    var money = money || false;
    var current = parseInt($('#'+id).attr('count')) || 0;
    var options = {
        useEasing: true,
        useGrouping: true,
        separator: ',',
        decimal: '.',
    }
    var decimal = (money)? 2 : 0
    var count = new CountUp(id, current, value, decimal, 0.5, options);
    if (!count.error) {
        count.start();
    } else {
        console.error(count.error);
    }
}

/* ========================= end count js ========================= */

/* ========================= bidding ========================= */

res.updateBiddingPriceOption = function (data) {
    for (i in data) {
        $('#select-bidding-price').append('<option value="' + i + '">R$ ' + data[i].price + ' / ' + data[i].point + 'pts</option>');
    }
}

res.updateBidTime = function (time) {
    if (time > 0) {
        this.bidRunning = true;
        $('#bid_time_box').css('background-color', 'red');
        $('#bid_time').text(time);
        $('#bid_light').css('background-color', 'white');
        setTimeout(() => {
            $('#bid_light').css('background-color', '#ff0076');
        }, 500);
    } else {
        this.bidRunning = false;
        $('#bid_time_box').css('background-color', 'aqua');
        $('#bid_time').text('-');
    }
}

res.updateBidInitiator = function (data) {
    // Bid Initiator
    $('#bid_initiator > tbody').empty();
    if (typeof (data) === 'undefined' || data == null) return;
    if (this.bidRunning) {
        $('.bid_hidden').hide();
    } else {
        $('.bid_hidden').show();
    }
    let row = '<tr id="bid_initiator_' + data.id + '">' +
        '<td>' + data.name + '</td>' +
        '<td>' + data.qty + '</td>';
    if (!this.bidRunning) {
        row += '<td>R$ ' + data.price + '</td>' +
            '<td>' + data.point + '</td>';
    }
    row += '</tr>';
    $('#bid_initiator > tbody').append(row);
}

res.updateBidParticipator = function (data) {
    // Bid Participator
    $('#bid_participator > tbody').empty();
    if (typeof (data) === 'undefined' || data == null) return;
    if (this.bidRunning) {
        $('.bid_hidden').hide();
    } else {
        $('.bid_hidden').show();
    }
    for (i in data) {
        if (i == 0) continue;
        let row = '<tr id="bid_participator_' + data[i].id + '">' +
            '<td>' + data[i].name + '</td>' +
            '<td>' + data[i].qty + '</td>';
        if (!this.bidRunning) {
            row += '<td>R$ ' + data[i].price + '</td>' +
                '<td>' + data[i].point + '</td>';
        }
        row += '</tr>';
        $('#bid_participator > tbody').append(row);
    }
}

/* ========================= end bidding ========================= */

/* ========================= auto process ========================= */

res.showBuyAutoProcess = function (price, callback) {
    $th = this;
    $th.updateAutoProcess(false);
    $th.modalAutoProcess = true;
    swal({
        title: 'Buy Automatic Process?',
        text: "This will cost R$ "+price+"!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        animation: "slide-from-top",
        closeOnConfirm: false,
        closeOnCancel: false
    }, function(isConfirm) {
        $th.modalAutoProcess = false;
        if (isConfirm) {
            callback();
        }
        swal.close();
    })
}

/* ========================= end auto process ========================= */

/* ========================= loader ========================= */

res.updateLoader = function (active) {
    if (active) {
        saveGame = true;
        $('#loader').addClass('is-active');
    } else {
        saveGame = false;
        $('#loader').removeClass('is-active');
    }
}

/* ========================= end loader ========================= */

return res;

});
