var express = require('express');
var router = express.Router();
var BlogController = require("../controller/Blog.js");

var jwt = require('jsonwebtoken');
var fs = require('fs');
var publicKEY  = fs.readFileSync('./public.key', 'utf8');


function verify_jwt(req,res,next)
{
    var verifyOptions = {
        issuer:  process.env.ISSUER,
        subject:  process.env.SUBJECT,
        audience:  process.env.AUDIENCE,
        expiresIn:  process.env.EXPIRESIN,
        algorithm:  [process.env.ALGORITHM]
       };
       
       jwt.verify(req.body.token, publicKEY, verifyOptions,function(err,data){
           if(err)
           {
               res.json({
                   status:401,
                   message:"Token Error"
               });
           }
           else
           {
               if(data.username == req.body.username)
               {
                    next();
               }
               else
               {
                    res.json({
                        status:400,
                        message:"Bad Request"
                    });
               }
           }
       })
}


function validate_blog_create(req,res,next)
{
    var username = req.body.username;
    var title = req.body.title;
    var body = req.body.body;
    var tag = req.body.tag;
    
    var username_regularExpression = new RegExp("[a-zA-Z0-9]+");
    var title_regularExpression = new RegExp("[a-zA-Z0-9 ]+");
    var body_regularExpression = new RegExp("[a-zA-Z0-9 ]+");
    var tag_regularExpression = new RegExp("[a-zA-Z0-9 ]+");
    
    var Username = username_regularExpression.exec(username);
    var Title = title_regularExpression.exec(title);
    var Body = body_regularExpression.exec(body);
    var Tag = tag_regularExpression.exec(tag);
   
    if(username == Username && title == Title && body == Body && tag == Tag)
    {
        next();
    }
    else
    {
        res.json({
            status:406,
            message:"Validation Fail"
        });  
    }
}


function AuthenticatePOST(req,res,next)
{
    if(process.env.API_KEY==req.body.API_KEY)
    {
        next();
    }
    else
    {
        res.json({
            status:403,
            message:"Forbidden"
        }).send();
    }
}

function AuthenticateGET(req,res,next)
{
    if(process.env.API_KEY==req.query.API_KEY)
    {
        next();
    }
    else
    {
        res.json({
            status:403,
            message:"Forbidden"
        }).send();
    }
}

router.post('/create',AuthenticatePOST,verify_jwt,validate_blog_create,BlogController.create);
router.get('/fetch-based-upon-time',AuthenticateGET,BlogController.fetchBasedOnTime);
router.post('/fetch-user',AuthenticatePOST,verify_jwt,BlogController.fetchUser);
router.get('/fetch-tag',AuthenticateGET,BlogController.fetchTag);

module.exports = router;