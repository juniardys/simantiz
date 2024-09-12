var gameconfig = require('./../config/game');

var Production = function(ext) {
    for(var name in gameconfig.production){
        this[name] = gameconfig.production[name];
    }
    this.total = ext || 0;
    this.capacity = 0;

    this.setProdCapacity = function(machinebig, machinesmall, worker){
        machineCty = machinebig.getCapacity() + machinesmall.getCapacity();
        workerCty = worker.getCapacity();
        capacity = 0;
        if(machineCty < workerCty){
            capacity = machineCty;
        } else {
            capacity = workerCty;
        }
        this.capacity = capacity;
        return capacity;
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


module.exports = Production;
