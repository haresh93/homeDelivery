var express  = require('express');
var app      = express(); 
var cors = require('cors');
var port = '12345';
var logger = require('logger');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var database = require('./config/database');


var connection = mongoose.connect(database.url,function(err) {
    if (err) throw err;
    console.log('Successfully connected to MongoDB');
});

var env = process.env.NODE_ENV || '';
if('' == env){
	app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users 						// log every request to the console
	app.use(bodyParser()); 						// pull information from html in POST
	//app.use(express.methodOverride()); 						// simulate DELETE and PUT
}
app.use(cors());


require('./app/routes.js')(app,connection);

app.listen(port);
console.log("App listening on the port " + port);
