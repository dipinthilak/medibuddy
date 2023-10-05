const express = require("express");
const user_routers = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const userauth=require('../authentication/userAuth')
const userController = require("../controllers/userController");
user_routers.use(session({
    secret: "firstprkey",
    resave: false, 
    saveUninitialized: false, 
  }));


  
  user_routers.set('view engine','ejs');
  user_routers.set('views','./views/user')
  user_routers.use(bodyParser.json());
  user_routers.use(bodyParser.urlencoded({extended: true}));


  user_routers.get('/',userController.userhome);

  user_routers.get('/userHome',(req,res)=>{
  res.redirect('/')  
    });
    
  user_routers.get("/userSignin",userController.loadSignin)
  user_routers.get("/userSignup",userController.loadSignup)
  user_routers.get("/userDashboard",userController.loadSignup)

  user_routers.post("/userSignup",userController.newUser)
  user_routers.post("/userSignin",userController.userSignin)
  user_routers.get("/userlogout",userController.userLogout)

    module.exports = user_routers;