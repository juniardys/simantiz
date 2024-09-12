// System Improvement

var gameconfig = require('./../config/game');

var SIP = function (ext) {
    for (var name in gameconfig.sip) {
        this[name] = gameconfig.sip[name];
    }
    
    this.total = ext || 0;

    this.add = function (qty) {
        this.total = parseInt(qty);
        return { total_cost: this.option[qty].cost, point: this.option[qty].point };
    };

    this.getTotal = function () {
        return this.total;
    };

    this.getTotalCost = function (qty) {
        qty = qty || this.total;
        if (qty in this.option)
            return this.option[qty].cost;
        else
            return 0;
    };

    this.getPoint = function (qty) {
        qty = qty || this.total;
        if (qty in this.option)
            return this.option[qty].point;
        else
            return 0;
    }

    this.renderOption = function (used = []) {
        let result = [];
        loop:
        for (val in this.option) {
            for (let x = 0; x < used.length; x++) {
                if (val == used[x]) {
                    continue loop;
                }
            }
            let res = {
                value: val,
                label: val + ' - (R$' + this.option[val].cost + '/' + this.option[val].point + 'pts)',
            }
            result.push(res);
        }
        return result;
    }
};


module.exports = SIP;
