var User = require('../models/User.js');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var hash = require('object-hash');
var privateKEY  = fs.readFileSync('./private.key', 'utf8');

module.exports = {
    signup:function(req,res)
    {
        var post=req.body;

        var passwordObj = {password:post.password};
        var password_hash = hash(passwordObj)
        
        var obj = new User({
            email:post.email,
			username:post.username,
			name:post.name,
			age:post.age,
			password:password_hash
        });
  
        User.find({username:post.username},function(err,data){
            if(err)
            {
                res.json({
                    status:500,
                    message:"Internal Server Error"
                });
            }
            else if(data.length==0)
            {
                obj.save();
                res.json({
                    status:200,
                    message:"Success"
                });
            }
            else
            {
                res.json({
                    status:409,
                    message:"Username Already Exists"
                });
            }
        })
    },
    login:function(req,res)
    {
        var post = req.body;

        var passwordObj = {password:post.password};
        var password_hash = hash(passwordObj)
        
        User.find({username:post.username,password:password_hash},function(err,data){
            if(err)
            {
                res.json({
                    status:500,
                    message:"Internal Server Error"
                });
            }
            else if(data.length==0)
            {
                res.json({
                    status:404,
                    message:"User Not Found"
                });
            }
            else
            {
                var payload={
                    username:post.username
                }

                var signOptions = {
                    issuer:  process.env.ISSUER,
                    subject: process.env.SUBJECT,
                    audience:  process.env.AUDIENCE,
                    expiresIn:  process.env.EXPIRESIN,
                    algorithm: process.env.ALGORITHM
                };
            
                jwt.sign(payload, privateKEY, signOptions,function(err,token){
                    if(err)
                    {
                        res.json({
                            status:403,
                            message:"Error in Generating JWT Token"
                        });

                    }
                    else
                    {
                        res.json({
                            status:200,
                            message:"Success",
                            jwt_token:token
                        });
                    }
                });            
            }
        })
    }
}