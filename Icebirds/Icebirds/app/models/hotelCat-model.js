var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var HotelCatSchema = new Schema({
  GRP_ID: { type: Number, required: true, index: { unique: true } },
  GRP_NAME: {type: String },
  GRP_HOTELS: {type: Array, "default":{} }

},{collection:'HOTELCAT_MASTER'});

module.exports = mongoose.model('HotelCat', HotelCatSchema);
