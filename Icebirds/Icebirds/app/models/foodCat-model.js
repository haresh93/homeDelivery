var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FoodCatSchema = new Schema({
  FCAT_ID: { type: Number, required: true, index: { unique: true } },
  FCAT_NAME: {type: String }

},{collection:'FOODCAT_MASTER'});

module.exports = mongoose.model('FoodCat', FoodCatSchema);
