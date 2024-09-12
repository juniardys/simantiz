define([], function() {
var res = {};
res.capacity = 0;

res.total = 0;

res.init = function(opt){
    for(var name in opt){
        this[name] = opt[name] || 0;
    }
};

res.getLeft = function(){
    return this.capacity - this.total;
}

return res;

});
