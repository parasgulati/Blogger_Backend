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
const Transaction = require('./models/Transaction');
const Order = require('./models/Order');
const Service_Order = require('./models/Service_Order');
const Service_Expiry = require('./models/Service_Expiry');

// paytm requirement

const ejs = require("ejs");
const {initPayment, responsePayment} = require("./Paytm/services/index");


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


// paytm
API.use(express.static(__dirname + "/views"));
API.set("view engine", "ejs");

API.get("/paywithpaytm", (req, res) => {
	
		initPayment(req.query.amount,req.query.Customer_Id,req.query.CreateBusiness,req.query.Order_Id).then(
			success => {
				res.render("paytmRedirect.ejs", {
					resultData: success,
					paytmFinalUrl: process.env.PAYTM_FINAL_URL
				});
			},
			error => {
				res.send(error);
			}
		);
});

API.post("/paywithpaytmresponse", (req, res) => {
    responsePayment(req.body).then(
        success => {
			var post = req.body;
			
			Service_Order.findOne({_id:post.ORDERID},function(err1,data1){
				if(err1)
				{
					res.json({
						status:500,
						message:"Internal Server Error"
					}).send();
				}
				else
				{
					Service_Expiry.findOne({Business_Id:data1.Business_Id},function(err2,data2){
						if(err2)
						{
							res.status(500).json({
								message:"Internal Server Error"
							}).send();
						}
						else
						{
							var current_date = new Date();
							var end_date = data2.Service_Period_End;
							var new_end_date;
							var new_start_date;
							
							if(current_date <= end_date)
							{
								end_date.setDate(end_date.getDate()+30);
								new_end_date = end_date;
							}
							else
							{
								current_date.setDate(current_date.getDate()+30);
								new_end_date = current_date;
							}
							Service_Expiry.updateOne({Business_Id:data1.Business_Id},{Service_Period_End:new_end_date},function(err3,data3){
								if(err3)
								{
									res.status(500).json({
										message:"Internal Server Error"
									}).send();
								}
								else
								{
									var TransactionObj = new Transaction({
												Business_Id:data1.Business_Id,
												CURRENCY:post.CURRENCY,
												GATEWAYNAME:post.GATEWAYNAME,
												RESPMSG:post.RESPMSG,
												BANKNAME:post.BANKNAME,
												PAYMENTMODE:post.PAYMENTMODE,
												MID:post.MID,
												RESPCODE:post.RESPCODE,
												TXNID:post.TXNID,
												TXNAMOUNT:post.TXNAMOUNT,
												ORDERID:post.ORDERID,
												STATUS:post.STATUS,
												BANKTXNID:post.BANKTXNID,
												TXNDATE:post.TXNDATE,
												CHECKSUMHASH:post.CHECKSUMHASH
											});
											TransactionObj.save();
									res.render("response.ejs", {resultData: "true", responseData: success})		
								}
							})
						}
					})
				}		
			})			
        },
        error => {
            res.send(error);
        }
    );
});

API.post("/paywithpaytmresponseCreate", (req, res) => {
    responsePayment(req.body).then(
        success =>
		{
					var post=req.body;
					console.log(post.ORDERID);
					Order.findOne({_id:post.ORDERID},function(err1,data1){
						if(err1)
						{
							res.send(err1);
						}
						else
						{	
							const obj = new Business({
								Country_Code:data1.Country_Code,
								Phone_Number:data1.Phone_Number,
								Name:data1.Name,	
								Type:data1.Type,
								Category:data1.Category,
								Address:data1.Address,
								Status:true
							});
	
							Business.find(obj,function(err2,data2){
								if(err2)
								{
									res.send(err2);
								}
								else if(data2.length==0)
								{
									obj.save(function(e,d){
										if(e)
										{								
											res.send(e);
										}
										else
										{
											var date = new Date();
											
											date.setDate(date.getDate() + 30);		
									
											var ser_exp = new Service_Expiry({
												Business_Id:d._id,
												Service_Period_End:date
											});
											ser_exp.save();
											
											var TransactionObj = new Transaction({
												Business_Id:d._id,
												CURRENCY:post.CURRENCY,
												GATEWAYNAME:post.GATEWAYNAME,
												RESPMSG:post.RESPMSG,
												BANKNAME:post.BANKNAME,
												PAYMENTMODE:post.PAYMENTMODE,
												MID:post.MID,
												RESPCODE:post.RESPCODE,
												TXNID:post.TXNID,
												TXNAMOUNT:post.TXNAMOUNT,
												ORDERID:post.ORDERID,
												STATUS:post.STATUS,
												BANKTXNID:post.BANKTXNID,
												TXNDATE:post.TXNDATE,
												CHECKSUMHASH:post.CHECKSUMHASH
											});
											TransactionObj.save();
											
											res.render("response.ejs", {resultData: "true", responseData: success});
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
						}
					})
        },
        error => {
            res.send(error);
        }
    );
});

API.post('/place-order-business',(req,res,next)=>{
	var post = req.body;

	var obj = new Order({
		Customer_Id:post.Customer_Id,
		Country_Code:post.Country_Code,
		Phone_Number:post.Phone_Number,
		Name:post.Name,	
		Type:post.Type,
		Category:post.Category,
		Address:post.Address,
		Amount:post.Amount
	})
	
	obj.save(function(err,data){
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
				order_id:data._id
			}).send();
		}
	})		
})


API.post('/place-order-service',(req,res,next)=>{
	var post = req.body;

	var obj = new Service_Order({
		Customer_Id:post.Customer_Id,
		Business_Id:post.Business_Id,
		Amount:post.Amount
	})
	
	obj.save(function(err,data){
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
				service_order_id:data._id
			}).send();
		}
	})		
})


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


API.post('/create-new-business',(req,res,next)=>{
	var post=req.body;
	
	const obj = new Business({
		Country_Code:post.Country_Code,
		Phone_Number:post.Phone_Number,
		Name:post.Name,	
		Type:post.Type,
		Category:post.Category,
		Address:post.Address,
		Status:true
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


API.post('/fetch-all-businesses-registerd-on-phone-number',(req,res,next)=>{
	var post=req.body;
		
	Business.find({
						Phone_Number:post.Phone_Number, 
						Country_Code:post.Country_Code
					},function(err1,data1){
						if(err1)
						{
							res.json({
									status:500,
									message:'Internal Server Error'
								}).send();
						}
						else if(data1.length==0)
						{
							res.json({
								status:404,
								message:'Not Found'
							}).send();
						}
						else
						{
							var ans=[];
							var n = data1.length;
							var syncLoop = require('sync-loop');
							
							syncLoop(n, function (loop) {
							  
							  var i = loop.iteration();
							  
									var state_temp;
									var obj = data1[i];
									
									let promise = new Promise((resolve,reject)=>{
										Service_Expiry.findOne({Business_Id:obj._id},function(err2,data2){
											if(err2)
											{
												resolve({"status":"200"});
											}
											else
											{	
												var date = new Date();
												if(date <= data2.Service_Period_End)
													state_temp = true;
												else
													state_temp = false;
												
												obj.State = state_temp
												var x = {"State":state_temp,"Obj":obj}
												ans.push(x);
												resolve({"status":"200"});
											}
										});	
									});
									
									promise.then((result)=>{
										loop.next();
									})
									.catch((error)=>{
										console.log("error in promise "+error);
									})
							  
							}, function () {
								
								res.status(200).json({
											message:'Success',
											businesses:ans
										}).send();
							});
						
						}
					})						
})


API.post('/remove-business',(req,res,next)=>{
	var post=req.body;

	let promise1 = new Promise((resolve,reject)=>{		
		Business.deleteMany({_id:{$in:post.Business_Ids}},function(err,data){
			if(err)
				reject();
			else
				resolve();
		})
	})
	
	let promise2 = new Promise((resolve,reject)=>{	
		Item.deleteMany({Business_Id:{$in:post.Business_Ids}},function(err,data){
			if(err)
				reject();
			else
				resolve();
		})
	})
	
	let promise3 = new Promise((resolve,reject)=>{
		Service_Expiry.deleteMany({Business_Id:{$in:post.Business_Ids}},function(err,data){
			if(err)
				reject();
			else
				resolve();
		})			
	})
	
	let promise4 = new Promise((resolve,reject)=>{
		Service_Order.deleteMany({Business_Id:{$in:post.Business_Ids}},function(err,data){
			if(err)
				reject();
			else
				resolve();
		})			
	})	
		
	let promise5 = new Promise((resolve,reject)=>{
		Transaction.deleteMany({Business_Id:{$in:post.Business_Ids}},function(err,data){
			if(err)
				reject();
			else
				resolve();
		})			
	})	
		
	promise1.then((result)=>{	
		promise2.then((result)=>{
			promise3.then((result)=>{
				promise4.then((result)=>{
					promise5.then((result)=>{
						res.status(200).json({
							message:"Success"
						}).send();
					})
					.catch((error)=>{
						res.status(500).json({
							message:"Internal Server Error"
						}).send();
					})
				})
				.catch((error)=>{
					res.status(500).json({
						message:"Internal Server Error"
					}).send();
				})
			})
			.catch((error)=>{
				res.status(500).json({
					message:"Internal Server Error"
				}).send();
			})
		})
		.catch((error)=>{
			res.status(500).json({
				message:"Internal Server Error"
			}).send();
		})	
	})					
	.catch((error)=>{
		res.status(500).json({
			message:"Internal Server Error"
		}).send();
	})
})

API.post('/query',(req,res,next)=>{
	var post=req.body;
	
	var total_length = post.query.length;
	var get_starting = Math.ceil((20/100)*total_length);
	var s = post.query.substring(0,get_starting);
	
	var search_string = "^"+s;
	Business.find({"Name":{$regex:search_string,$options:'i'}},function(err,data){
		if(err)
		{
			res.json({
				status:500,
				message:"Internal Server Error"
			}).send();
		}
		else if(data.length!=0)
		{
			var ans=[];
			for(var i=0;i<data.length;i++)
			{
				var string1 = post.query.toLowerCase();
				var string2 = data[i].Name.toLowerCase();
				
				var arrayLCS=new Array(string1.length+1);
				
				for(var k=0;k<=string1.length;k++)
                    arrayLCS[k]=new Array(string2.length+1);
				
                for(var k=0;k<=string1.length;k++)
                    arrayLCS[k][0]=0;
                for(var k=0;k<=string2.length;k++)
                    arrayLCS[0][k]=0;
				
				var max = 0;
				
                for(var k=1;k<=string1.length;k++)
                {
                    for(var p=1;p<=string2.length;p++)
                    {      
                        if(string1[k-1] == string2[p-1])
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
				if(((max*100)/Math.max(string1.length,string2.length))>=80)
				{
					ans.push(data[i]);
				}
			}
			res.json({
				status:200,
				message:"Success",
				businesses:ans
			}).send();
		}
		else
		{
			res.json({
				status:200,
				message:"Success",
				businesses:[]
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

API.post('/check-phone-number-already-registered',(req,res,next)=>{
	var post=req.body;
	
	Registration.findOne({Phone_Number:post.Phone_Number, Country_Code:post.Country_Code},function(err,data){
						if(err)
						{
							res.json({
									status:500,
									message:'Internal Server Error'
								}).send();
						}
						else if(data==null)
						{
							res.json({
								status:200,
								message:'Not Registered'
							}).send();
						}
						else
						{
							res.json({
								status:200,
								message:'Already Registered'
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

var port =process.env.PORT || 3000;
API.listen(port);