var Blog = require('../models/Blog.js');

module.exports = {
    create:function(req,res)
    {
        var post=req.body;
    
        var tagName = post.tag.toLowerCase();

        var obj = new Blog({
            username:post.username,
            title:post.title,
            body:post.body,
            tag:tagName,
            time:post.time
        });
  
        Blog.find({username:post.username,title:post.title},function(err,data){
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
                    message:"Title Already Exists"
                });
            }
        })
    },
    fetchBasedOnTime:function(req,res)
    {
        Blog.find({},function(err,data){
            if(err)
            {
                res.json({
                    status:500,
                    message:"Internal Server Error"
                });
            }
            else
            {
                data.sort((a, b) => (a.time > b.time) ? 1 : -1);

                res.json({
                    status:200,
                    message:"Success",
                    blogs:data
                });
            }
        })
    },
    fetchUser:function(req,res)
    {
        Blog.find({username:req.body.username},function(err,data){
            if(err)
            {
                res.json({
                    status:500,
                    message:"Internal Server Error"
                });
            }
            else
            {
                data.sort((a, b) => (a.time > b.time) ? 1 : -1);

                res.json({
                    status:200,
                    message:"Success",
                    blogs:data
                });
            }
        })
    },
    fetchTag:function(req,res)
    {
        var tagName = req.query.tag.toLowerCase();

        Blog.find({tag:tagName},function(err,data){
            if(err)
            {
                res.json({
                    status:500,
                    message:"Internal Server Error"
                });
            }
            else
            {
                data.sort((a, b) => (a.time > b.time) ? 1 : -1);

                res.json({
                    status:200,
                    message:"Success",
                    blogs:data
                });
            }
        })
    }
}