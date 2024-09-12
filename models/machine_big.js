var gameconfig = require('./../config/game');

var MachineBig = function(ext) {
    for(var name in gameconfig.machinebig){
        this[name] = gameconfig.machinebig[name];
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

module.exports = MachineBig;
