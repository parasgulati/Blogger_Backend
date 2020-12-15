const mongoose = require('mongoose');
const Item = mongoose.Schema({
	Business_Id:{type:String},
	Name:{type:String}
});
module.exports = mongoose.model("Item",Item);