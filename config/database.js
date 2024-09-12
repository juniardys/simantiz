var mysql      = require('mysql');

// configure database
var db_config = {
	host     : String(process.env.DB_HOST),
	user     : String(process.env.DB_USER),
	password : String(process.env.DB_PASSWORD),
	database : String(process.env.DB_DATABASE)
};

function handleDisconnect() {
	global.connection = mysql.createConnection(db_config); // Recreate the connection, since
	                                              // the old one cannot be reused.
	                                              
	connection.connect(function(err) {              // The server is either down
		if(err) {                                     // or restarting (takes a while sometimes).
			console.log('Error when connecting to db:', err);
			setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
		} else {
		    console.log("Database is connected");
		}                                     // to avoid a hot loop, and to allow our node script to
	});                                     // process asynchronous requests in the meantime.
	                                      // If you're also serving http, display a 503 error.
	connection.on('error', function(err) {
		console.log('DB Error', err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
			handleDisconnect();                         // lost due to either server restart, or a
		} else {                                      // connnection idle timeout (the wait_timeout
			throw err;                                  // server variable configures this)
		}
	});
}

function keepalive() {
	connection.query('select 1', [], function(err, result) {
	  if(err) return console.log(err);
	  // Successul keepalive
	});
}

setInterval(keepalive, 1000*60*5);

handleDisconnect();

module.exports = {};