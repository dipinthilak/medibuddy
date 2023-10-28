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
  user_routers.set('views','./views/user');
  user_routers.use(bodyParser.json());
  user_routers.use(bodyParser.urlencoded({extended: true}));


  user_routers.get('/',userController.userhome);
  user_routers.get('/userHome',(req,res)=>{   res.redirect('/');  });
  user_routers.get("/userShopproduct",userController.productShop);
  user_routers.get("/userCategoryproduct",userController.categoryShop);
  user_routers.get("/searchproduct",userController.searchResult);


  user_routers.get("/userCart",userauth.isLogin,userController.userCart);
  user_routers.post("/addtocart",userController.addtoCart);
  user_routers.post("/removecartitem",userController.removecartitem);
  user_routers.post("/changequantity",userController.updatequantity);
  user_routers.get('/checkoutitems',userauth.isLogin,userController.checkoutCart);
  user_routers.post('/codcheckout',userController.codcheckout);
  user_routers.get('/orderdetails',userauth.isLogin,userController.orderdetails);
  user_routers.get('/ordersuccess',userController.ordersuccess);
  user_routers.post('/verifypayment',userController.verifypayment);


  user_routers.post("/addtowishlist",userController.addtoWishlist);
  user_routers.get("/userWishlist",userauth.isLogin,userController.userWishlist);
  user_routers.post("/removewishitem",userController.removeWishitem);



  user_routers.get("/addaddress",userController.addaddressload);
  user_routers.post("/addaddress",userController.addAddress);
  user_routers.get("/updateaddressload",userController.updateaddressload);
  user_routers.post("/updateaddress",userController.updateaddress);

  
  user_routers.get("/about",userController.userAbout);
  user_routers.get("/contact",userController.userContact);

    
  user_routers.get("/userSignin",userauth.isLogout,userController.loadSignin);
  user_routers.get("/userSignup",userauth.isLogout,userController.loadSignup);
  user_routers.post("/userSignup",userController.newUser);
  user_routers.post("/usersignupOtp",userController.usersignupOtp);
  user_routers.post("/userSignin",userController.userSignin);


  user_routers.get("/userDashboard",userauth.isLogin,userController.userDashboard);
  user_routers.get("/userlogout",userauth.isLogin,userController.userLogout);

  module.exports = user_routers;