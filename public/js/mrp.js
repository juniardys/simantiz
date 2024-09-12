// Market Research

define([], function() {
var res = {};

res.checkErr = function(inputValue){
    if (inputValue === false) return 1;
    if (inputValue === "") {
        return 2;
    }
    if (isNaN(inputValue)) {
        return 3;
    }
    
    return false;
};

res.total = 0;

res.init = function(opt){
    for(var name in opt){
        this[name] = opt[name] || 0;
    }
};

res.getLeft = function(){
    return this.max - this.total;
}

return res;

});
