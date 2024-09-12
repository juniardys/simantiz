var gameconfig = require('./../config/game');

var Agent = function(ext) {
    for(var name in gameconfig.agent){
        this[name] = gameconfig.agent[name];
    }
    this.total = ext || 0;

    this.hire = function(qty){
        this.total+=parseInt(qty);
        return { total_cost: this.cost*qty, total_capacity: this.capacity*qty };
    };

    this.getTotal = function(){
        return this.total;
    };

    this.getTotalCost = function(qty){
        qty = qty || this.total;
        return qty*this.cost;
    };

    this.getCapacity = function(){
        return this.total*this.capacity;
    };
};

module.exports = Agent;
