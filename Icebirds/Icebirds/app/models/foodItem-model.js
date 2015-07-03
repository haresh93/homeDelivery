var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FoodItemSchema = new Schema(
{
  FI_ID : { type: Number, required: true, index: { unique: true } },
  FI_NAME : {type: String },
  FI_PRICE : {type: Number},
  FI_CAT_ID : { type: Number}
},{collection:'FOODITEMS_MASTER'});

module.exports = mongoose.model('FoodItem', FoodItemSchema);
