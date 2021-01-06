// import all required modules
const express=require('express');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const cors=require('cors');

// make object of express
const API=express();

// import env file for credentials
require('dotenv/config');


// MongoDB connect

mongoose.connect('mongodb+srv://'+process.env.MONGODB_USER+':'+process.env.MONGODB_PASSWORD+'@cluster0.1b7a3.mongodb.net/'+process.env.MONGODB_DBNAME+'?retryWrites=true&w=majority',{'useUnifiedTopology':true})
.then(()=>{
    console.log('database connected');
})
.catch(()=>{
    console.log('database connectivity failed');
});
mongoose.set('useFindAndModify', false);

// adding cors middleware for Cross Origin Resource Sharing
API.use(cors());

// adding body-parser JSON middleware for accessing application/json data
API.use(bodyParser.json());

// adding body-parser URL Encoded middleware for accessing URLEncoded data
API.use(bodyParser.urlencoded({extended: false}));

var UserRoute = require("./route/User.js")
var BlogRoute = require("./route/Blog.js");

API.use('/user',UserRoute);
API.use('/blog',BlogRoute);

var port =process.env.PORT || 3000;
API.listen(port);