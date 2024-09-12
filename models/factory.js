var gameconfig = require('./../config/game');

var Factory = function(ext) {
    for(var name in gameconfig.factory){
        this[name] = gameconfig.factory[name];
    }
    this.total = ext || 0;
    this.total_capacity = this.capacity*this.total;

    this.buy = function(qty){
        this.total+=parseInt(qty);
        this.left = this.max - this.total;
        this.total_capacity = this.total*this.capacity;
        return { total_cost: this.cost*qty, total_capacity: this.capacity*qty };
    };

    this.getTotal = function(){
        return this.total;
    };

    this.getTotalCost = function(qty){
        qty = qty || this.total;
        return qty*this.cost;
    };

    this.canBuy = function (qty) {
        if (qty > this.left) return false;
        return true;
    }
};

module.exports = Factory;
