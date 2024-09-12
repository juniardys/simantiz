var gameconfig = require('./../config/game');

var Clororo = function(ext) {
    for(var name in gameconfig.clororo){
        this[name] = gameconfig.clororo[name];
    }
    this.total = ext || 0;
    this.capacity = 0;

    this.addCapacity = function(cty){
        this.capacity += cty;
        return this.capacity;
    }

    this.getTotal = function(){
        return this.total;
    };

    this.getTotalCost = function(qty){
        qty = qty || this.total;
        return qty*this.cost;
    };

    this.getCapacity = function(){
        return this.capacity;
    };

    this.capacityLeft = function(){
        return this.capacity - this.total;
    };
};


module.exports = Clororo;
