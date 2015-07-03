var express  = require('express');
var app      = express(); 
var port = '19823';
var bodyParser = require('body-parser');

var env = process.env.NODE_ENV || '';
if('' == env){
	app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users 						// log every request to the console
	app.use(bodyParser()); 						// pull information from html in POST
	//app.use(express.methodOverride()); 						// simulate DELETE and PUT
}


app.listen(port);
console.log("App listening on the port " + port);
