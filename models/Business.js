const mongoose = require('mongoose');
const Business = mongoose.Schema({
	Country_Code:{type:String},
	Phone_Number:{type:String},
	Name:{type:String},	
	Type:{type:String},
	Category:{type:String},
	Address:{type:String}
});
module.exports = mongoose.model("Business",Business);