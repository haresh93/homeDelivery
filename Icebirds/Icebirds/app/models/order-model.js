var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ORDERSchema = new Schema({
	ORDER_NUM: {type: Number,required: true},
	ORDER_MOBILE_NUM: { type: String, required: true },
	ORDER_DELIVERYADDRESS: {type:String},
	ORDER_ITEMS: {type: Array}
},{collection:'ORDER_MASTER'});

module.exports = mongoose.model('ORDER', ORDERSchema);
