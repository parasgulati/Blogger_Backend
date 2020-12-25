const mongoose = require('mongoose');
const Transaction = mongoose.Schema({
	Business_Id:{type:String},
	CURRENCY:{type:String},
	GATEWAYNAME:{type:String},
	RESPMSG:{type:String},
	BANKNAME:{type:String},
	PAYMENTMODE:{type:String},
	MID:{type:String},
	RESPCODE:{type:String},
	TXNID:{type:String},
	TXNAMOUNT:{type:String},
	ORDERID:{type:String},
	STATUS:{type:String},
	BANKTXNID:{type:String},
	TXNDATE:{type:Date},
	CHECKSUMHASH:{type:String}
});
module.exports = mongoose.model("Transaction",Transaction);