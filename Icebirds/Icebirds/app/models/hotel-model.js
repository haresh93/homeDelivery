var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var HotelSchema = new Schema({
    HT_ID: { type: String, required: true, index: { unique: true } },
    HT_NAME: {type: String },
    HT_ADDR: { type: String},
    HT_SHORT_ADDR: {type: String },
    HT_Contact : {type:String},
    HT_LOCATION : {
        Latitude : {type:Number},
        Longitude : {type:Number}
    }

},{collection:'HOTELS_MASTER'});

module.exports = mongoose.model('Hotel', HotelSchema);
