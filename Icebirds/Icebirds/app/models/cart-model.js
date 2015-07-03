var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CARTSchema = new Schema({
	CART_MOBILE_NUM: { type: String, required: true },
	CART_HOTEL: {type: Number},
	CART_ITEMS: {type: Array,"default":{} }
},{collection:'CART_MASTER'});

module.exports = mongoose.model('CART', CARTSchema);
