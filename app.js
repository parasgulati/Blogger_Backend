// import all required modules
const express=require('express');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const cors=require('cors');

// make object of express
const API=express();

// import env file for credentials
require('dotenv/config');

// import database mongoose models
const Registration = require('./models/Registration');
const Business = require('./models/Business');
const Item = require('./models/Item');


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


API.post('/register-user',(req,res,next)=>{
	var post=req.body;
	
	var obj= new Registration({
		Name:post.Name,
		Phone_Number:post.Phone_Number,
		Country_Code:post.Country_Code
	});
	
	Registration.findOne({
							Phone_Number:post.Phone_Number, 
							Country_Code:post.Country_Code
						},function(err,data){
							if(err)
							{
								res.json({
									status:500,
									message:'Internal Server Error'
								}).send();
							}
							else if(data==null)
							{
								obj.save();
								res.json({
									status:201,
									message:'Created'
								}).send();
							}
							else
							{
								res.json({
									status:409,
									message:'Conflict'
								}).send();
							}
						})
})


API.post('/fetch-all-businesses-registerd-on-phone-number',(req,res,next)=>{
	var post=req.body;
	
	Business.find({
						Phone_Number:post.Phone_Number, 
						Country_Code:post.Country_Code
					},function(err,data){
						if(err)
						{
							res.json({
									status:500,
									message:'Internal Server Error'
								}).send();
						}
						else if(data.length==0)
						{
							res.json({
								status:404,
								message:'Not Found'
							}).send();
						}
						else
						{
							res.json({
								status:200,
								message:'Success',
								businesses:data
							}).send();
						}
					})
})


API.post('/create-new-business',(req,res,next)=>{
	var post=req.body;
	
	const obj = new Business({
		Country_Code:post.Country_Code,
		Phone_Number:post.Phone_Number,
		Name:post.Name,	
		Type:post.Type,
		Category:post.Category,
		Address:post.Address
	});
	
	Business.find(obj,function(err,data){
						if(err)
						{
							res.json({
									status:500,
									message:'Internal Server Error'
								}).send();
						}
						else if(data.length==0)
						{
							obj.save(function(e,d){
								if(e)
								{								
									res.json({
										status:500,
										message:'Internal Server Error'
									}).send();	
								}
								else
								{
									res.json({
										status:201,
										message:'Created',
										business:d
									}).send();
								}
							});
						}
						else
						{
							res.json({
								status:409,
								message:'Conflict'
							}).send();
						}
					})
})

API.post('/remove-business',(req,res,next)=>{
	var post=req.body;
	
	Business.deleteMany({_id:{$in:post.Business_Ids}},function(err,data){
						if(err)
						{
							res.json({
									status:500,
									message:'Internal Server Error'
								}).send();
						}
						else
						{
							res.json({
								status:200,
								message:'Success'
							}).send();
						}
					})
})

API.post('/fetch-all-items-in-a-business',(req,res,next)=>{
	var post = req.body;
	
	Item.find({Business_Id:post.Business_Id},function(err,data){
						if(err)
						{
							res.json({
									status:500,
									message:'Internal Server Error'
								}).send();
						}
						else
						{
							res.json({
								status:200,
								message:'Success',
								items:data
							}).send();
						}
	})
})

API.post('/add-new-item',(req,res,next)=>{
	var post=req.body;
	
	const obj = new Item({
		Business_Id:post.Business_Id,
		Name:post.Name
	});
	
	Item.findOne(obj,function(err,data){
						if(err)
						{
							res.json({
									status:500,
									message:'Internal Server Error'
								}).send();
						}
						else if(data==null)
						{
							obj.save(function(e,d){
								if(e)
								{								
									res.json({
										status:500,
										message:'Internal Server Error'
									}).send();	
								}
								else
								{
									res.json({
										status:201,
										message:'Created',
										item:d
									}).send();
								}
							});
						}
						else
						{
							res.json({
								status:409,
								message:'Conflict'
							}).send();
						}
					})
})

API.post('/remove-items',(req,res,next)=>{
	var post=req.body;
	
	Item.deleteMany({_id:{$in:post.Item_Ids}},function(err,data){
						if(err)
						{
							res.json({
									status:500,
									message:'Internal Server Error'
								}).send();
						}
						else
						{
							res.json({
								status:200,
								message:'Success'
							}).send();
						}
					})
})









// For user application
API.post('/fetch-all-businesses',(req,res,next)=>{
	
	Business.find({},function(err,data){
						if(err)
						{
							res.json({
									status:500,
									message:'Internal Server Error'
								}).send();
						}
						else
						{
							res.json({
								status:200,
								message:'Success',
								businesses:data
							}).send();
						}
	})
	
})

API.post('/chat',(req,res,next)=>{
	var post=req.body;
	
		Item.find({Business_Id:post.Business_Id},function(err,data){
						if(err)
						{
							res.json({
									status:500,
									message:'Internal Server Error'
								}).send();
						}
						else
						{
							var string1 = post.Query.toLowerCase();
							var overall_max=0;
							var ans = new Array();
							var flag=0;
							
							for(var i=0;i<data.length;i++)
							{
								var string2 = data[i].Name.toLowerCase();
								
								var arrayLCS = new Array(string1.length+1);
								
								for(var k=0;k<=string1.length;k++)
									arrayLCS[k] = new Array(string2.length+1);    
								
								for(var k=0;k<=string1.length;k++)
									arrayLCS[k][0]=0;
								for(var k=0;k<=string2.length;k++)
									arrayLCS[0][k]=0;
					
								var max=0;
								
								for(var k=1;k<=string1.length;k++)
								{
									for(var p=1;p<=string2.length;p++)
									{      
										if(string1[k-1]==string2[p-1])
											arrayLCS[k][p]=arrayLCS[k-1][p-1]+1;
										else
										{
											var firstTemp = arrayLCS[k-1][p];
											var secondTemp = arrayLCS[k][p-1];
											if(firstTemp>secondTemp)
												arrayLCS[k][p]=firstTemp;
											else
												arrayLCS[k][p]=secondTemp;
										}
										if(arrayLCS[k][p]>max)
										{
											max=arrayLCS[k][p];
										}
									}
								}
								
								if(max > overall_max)
									overall_max = max;
								if(overall_max == post.Query.length)
									flag=1;
								if((max/post.Query.length)*100 >= 70)
								{
									flag=-1;
									ans.push(data[i].Name);
								}
							}
							if(flag==1)
							{
								res.json({
									status:200,
									message:'Yes, we have that item'
								}).send();
							}
							else if(flag==-1)
							{
								res.json({
									status:200,
									message:'We did not find exact item, but got some suggestions for you.',
									suggestions:ans
								})
							}
							else
							{
								res.json({
									status:404,
									message:'Not Found'
								}).send();
							}
						}
	})
})

var port =process.env.PORT|3000;
API.listen(port);