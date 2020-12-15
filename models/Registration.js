const mongoose=require('mongoose');
const Registration=mongoose.Schema({
	Name:{type:String},	
	Phone_Number:{type:String},
	Country_Code:{type:String}
});
module.exports = mongoose.model("Registration",Registration);