var gameconfig = require('./../config/game');
var rn = require('random-number');

var Worker = function(ext) {
    for(var name in gameconfig.worker){
        this[name] = gameconfig.worker[name];
    }
    this.total = ext || 0;
    // this.total_capacity = this.capacity*this.total;

    this.hire = function(qty){
        this.total+=parseInt(qty);
        // this.total_capacity = this.capacity*this.total;
        // return { total_cost: this.cost*qty, total_capacity: this.capacity*qty };
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

module.exports = Worker;
