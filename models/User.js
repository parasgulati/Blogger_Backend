const mongoose = require('mongoose');
const User = mongoose.Schema({
	username:{type:String},
	password:{type:String},
	email:{type:String},
	age:{type:Number},
	name:{type:String}
});
module.exports = mongoose.model("User",User);