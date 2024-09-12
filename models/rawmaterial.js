var gameconfig = require('./../config/game');

var RawMaterial = function(ext) {
    for(var name in gameconfig.rawmaterial){
        this[name] = gameconfig.rawmaterial[name];
    }
    this.alltotal = 0;
    this.total = ext || 0;
    this.capacity = 0;

    this.buy = function(qty){
        this.total+=qty;
        this.alltotal+=qty;
        return this.cost*qty;
    };

    this.addCapacity = function(cty){
        this.capacity += cty;
        return this.capacity;
    }

    this.getTotal = function(){
        return this.total;
    };

    this.getAllTotal = function(){
        return this.alltotal;
    };

    this.getCapacity = function(){
        return this.capacity;
    };

    this.getTotalCost = function(qty){
        qty = qty || this.total;
        return qty*this.cost;
    };
};


module.exports = RawMaterial;
