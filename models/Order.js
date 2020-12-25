const mongoose = require('mongoose');
const Order = mongoose.Schema({
	Customer_Id:{type:String},
	Country_Code:{type:String},
	Phone_Number:{type:String},
	Name:{type:String},	
	Type:{type:String},
	Category:{type:String},
	Address:{type:String},
	Amount:{type:String}
});
module.exports = mongoose.model("Order",Order);