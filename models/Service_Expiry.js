const mongoose = require('mongoose');
const Service_Expiry = mongoose.Schema({
	Business_Id:{type:String},
	Service_Period_End:{type:Date}
});
module.exports = mongoose.model("Service_Expiry",Service_Expiry);