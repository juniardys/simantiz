let date = require('date-and-time');

var Log = function() {
    this.printed = "";
}

Log.prototype.print = function (msg, mod, roomid, userdata, socketid) {
    mod = mod || "system";
    roomid = roomid || false;
    userdata = userdata || false;
    socketid = socketid || false;

    now = date.format(new Date, "DD-MM-YYYY HH:mm:ss")
    mod = mod.toUpperCase();
    this.printed = "[" + now + "][" + mod + "]";
    if (roomid) this.printed += "[room-" + roomid + "]";
    if (userdata) this.printed += "[user-" + userdata + "]";
    if (socketid) this.printed += "[sock-" + socketid + "]";
    this.printed += ": " + msg;
    console.log(this.printed);
}

module.exports = new Log;