var gameconfig = require('./../config/game');

var MachineSmall = function(ext) {
    for(var name in gameconfig.machinesmall){
        this[name] = gameconfig.machinesmall[name];
    }
    this.total = ext || 0;

    this.buy = function(qty){
        this.total+=parseInt(qty);
        
        return { total_cost: this.cost*qty };
    };

    this.getTotal = function(){
        return this.total;
    };

    this.getTotalCost = function(qty){
        qty = qty || this.total;
        return qty*this.cost;
    };

    this.getCapacity = function(){
        return this.total*this.max_lot;
    };

};

module.exports = MachineSmall;
