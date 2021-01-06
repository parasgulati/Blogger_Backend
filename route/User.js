var express = require('express');
var router = express.Router();

var UserController = require("../controller/User.js");

function validate_login(req,res,next)
{
    var username = req.body.username;
    var password = req.body.password;
    var username_regularExpression = new RegExp("[a-zA-Z0-9]+");
    var password_regularExpression = new RegExp("[a-zA-Z0-9@_]+");

    var use = username_regularExpression.exec(username);
    var pass = password_regularExpression.exec(password);
    
    if(username == use && password == pass)
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

function validate_signup(req,res,next)
{
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var age = req.body.age;
    var name = req.body.name;

    var username_regularExpression = new RegExp("[a-zA-Z0-9]+");
    var password_regularExpression = new RegExp("[a-zA-Z0-9@_]+");
    var email_regularExpression = new RegExp("[a-zA-Z0-9_]+@[a-z]+.[a-z]+");
    var age_regularExpression = new RegExp("[0-9]+");
    var name_regularExpression = new RegExp("[a-zA-Z ]+");

    var Username = username_regularExpression.exec(username);
    var Password = password_regularExpression.exec(password);
    var Email = email_regularExpression.exec(email);
    var Age = age_regularExpression.exec(age);
    var Name = name_regularExpression.exec(name);

    if(username == Username && password == Password && email == Email && age == Age && name == Name)
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

router.post('/signup',validate_signup,UserController.signup);
router.post('/login',validate_login,UserController.login);

module.exports = router;