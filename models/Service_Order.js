const mongoose = require('mongoose');
const Service_Order = mongoose.Schema({
	Customer_Id:{type:String},
	Business_Id:{type:String},
	Amount:{type:String}
});
module.exports = mongoose.model("Service_Order",Service_Order);