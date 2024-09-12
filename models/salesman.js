var gameconfig = require('./../config/game');

var Salesman = function(ext) {
    for(var name in gameconfig.salesman){
        this[name] = gameconfig.salesman[name];
    }
    this.total = ext || 0;
    this.commision_total = 0;

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

    this.sellClororo = function(user){
        var earnings = user.qty*user.price;
        this.commision_total = earnings*gameconfig.salesman.commission;
        return { total: user.qty, earnings: earnings, commision: this.commision_total };
    }

    this.allowedSellClororo = function (clo) {
        var max = this.getCapacity();
        if (max > clo) max = clo;
        return max;
    }
};

module.exports = Salesman;
