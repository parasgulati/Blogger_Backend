const mongoose = require('mongoose');
const Blog = mongoose.Schema({
    username:{type:String},
    title:{type:String},
    body:{type:String},
    tag:{type:String},
    time:{type:Date}
});
module.exports = mongoose.model("Blog",Blog);