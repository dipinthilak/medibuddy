const User = require('../models/userSchema');
const Category=require('../models/categorySchema');
const Product=require("../models/productSchema")
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Order=require('../models/orderSchema');
const Coupon=require('../models/couponSchema');
const dotenv = require('dotenv');
const crypto = require('crypto');
const Razorpay=require('razorpay');
const mongoose = require('mongoose');
const { log } = require('console');
dotenv.config({ path: ".env" });

 
const  instance  = new Razorpay({
    key_id: process.env.rz_key,
    key_secret: process.env.rz_sct,
  });
 
//generate otp
const generateOtp = () => {
    const otp= Math.floor(Math.random() * 900000 + 100000);
    return otp;
    };
 
// send mail
const sendMail = async (name="user", email) => {
    try {
        const otp =generateOtp();
        const rotp=otp;
        console.log(otp);

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        const mailOptions = {
            from: 'medibuddycc@gmail.com',
            to: email,
            subject: 'OTP - Medibuddy',
            text: `Thank you ,${name} for choosing Medibuddy. Use this otp to finish your signup: ${otp}`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email has been sent', info.response);
        console.log(rotp);
        return rotp ;
    }   

    catch (error) {
        console.log(error);
    }
    };
 
const ecryptpassword = async(password)=> {
        try {
            const passwordHash = await bcrypt.hash(password,10);
            return passwordHash
        } catch (error) {
            console.log(error.message);
        }
    };

const  userhome=async (req,res)=>{
    if(req.session.message)
    {
        const message = req.session.message;
    }
    else
    {
        const message="";
    }
    const category =await Category.find();
    const product = await Product.find({
        isListed: true,
        quantity: { $gt: 0 }
      }).limit(8);      
    if(req.session.user_id)
    {
        const user=await User.findById(req.session.user_id);
        res.render('userHome',
            {
            category:category,
            user:user,
            product:product
            }
            )  
    }
    else{
        res.render('userHome',{category:category,product:product,user:null})  
        }
    };

const userContact=async(req,res)=>{
    res.render("contact");
    };

const userAbout=async(req,res)=>{
    res.render("about");
    };


const userDashboard =async (req,res)=>{
    const user = await User.findById(req.session.user_id);
    console.log(user);
    const wallet=await User.findOne({_id:req.session.user_id},{wallet:1});
    const order=await Order.find({customerId:req.session.user_id}).sort({ createdAt: -1 });
    res.render('userDashboard',{user:user,order:order,wallet:wallet})
    };

const addaddressload=async(req,res)=>{
    const user = await User.findById(req.session.user_id)
    res.render("useraddaddress",{user:user});
    };

const addAddress =  async (req,res)=>{
        try {
            const address = {
                name : req.body.name,
                addressLine1 : req.body.addressLine1,
                addressLine2 : req.body.addressLine2,
                city : req.body.city,
                state : req.body.state,
                pinCode : req.body.pinCode,
                phone : req.body.phone,
                email : req.body.email,
                addressType : req.body.addressType,
                            }
            console.log(address);
            const user = await User.findById(req.session.user_id);
            user.address.push(address);
            await user.save();
            res.redirect('/userDashboard');
            }
         catch (error) {
            console.log(error.message);
        }
    };

const updateaddressload=async(req,res)=>{
    try {
        const addressid = req.query.adid;
        console.log(addressid);
        const userData = await User.findById(req.session.user_id);
        const categories = await Category.find();

        const user = await User.findById(req.session.user_id);
        const address = user.address[addressid];
        console.log(address);
        res.render('updateaddress',{
            user:user,
            address: address,
            addressIndex: addressid,
            userData: userData,
            categories: categories
        })
    } catch (error) {
        console.log(error.message);
    }
    };

const updateaddress=async (req,res)=>{
    try {
        console.log(req.body);
        const user = await User.findById(req.session.user_id);
        const addressId = req.body.addressId;
        console.log(addressId);
        const updatedUser = await User.findOneAndUpdate(
          {
            _id: user._id,
            'address._id': addressId
          },
          {
            $set: {
              'address.$.name': req.body.name,
              'address.$.addressLine1': req.body.addressLine1,
              'address.$.addressLine2': req.body.addressLine2,
              'address.$.city': req.body.city,
              'address.$.state': req.body.state,
              'address.$.pinCode': req.body.pinCode,
              'address.$.phone': req.body.phone,
              'address.$.email': req.body.email,
              'address.$.addressType': req.body.addressType
            }
          },
          { new: true } // To return the updated user document
        );
      
        if (updatedUser) {
          console.log('User address updated:', updatedUser);
          res.redirect('/userDashboard');
        } else {
          console.log('Address not updated');
          
        }

      } catch (error) {
        console.log(error.message);
      }
    };

const loadSignin=async(req,res)=>{
    try {
      console.log(req.query.noti);
        if (req.query.noti) 
        {
          const noti=req.query.noti;
          console.log(noti);
          res.render('userSignin',{noti:noti})            
        }
        else
        {
          res.render('userSignin',{noti:''})
        }
        } 
        catch (error)
        {
            console.log(error);
        }
    };

const loadSignup=async(req,res)=>{
  if(req.query.noti)
  {
    console.log("user signbup load");
    res.render('userSignup',{noti:req.query.noti})
    }
    else{
      res.render('userSignup',{noti:''})
    }
    };

const newUser = async(req, res) => {
    try {
      console.log(req.body.email);
      const usere=await User.find({email:req.body.email});
      console.log(usere);
      if(usere.length>0)
      {
        res.redirect('/userSignup?noti=User already exist with this email')
      }
      else
      {
        const user ={
          name : req.body.username,
          email : req.body.email,
          mobile : req.body.number,
          password : req.body.password,
          };     
        const otp= await sendMail(user.name,user.email);
        req.session.otp=otp;
        res.render('usersignupwithOtp',{user,wrongotp:false});
      }
    }
    catch (error) 
    {
        console.log(error.message);
    }
    };

const usersignupOtp=async (req,res)=>{
    try {
            const hashedpassword =await ecryptpassword(req.body.password);
            console.log("-------------------");
            if(req.session.otp==req.body.otp)
            {
             const user = new User({
                    name : req.body.username,
                    email : req.body.email,
                    mobile : req.body.number,
                    password : hashedpassword,
                });
                console.log(user);
            const userData = await user.save();

            console.log(">>>>>>"+userData);
        
            if(userData)
            {
                res.render('userSignin',{message:'',noti:''})
            }
            }
            else
            {
                const user ={
                    name : req.body.username,
                    email : req.body.email,
                    mobile : req.body.number,
                    password : req.body.password,
                 };  
             res.render('usersignupwithOtp',{user,wrongotp:true});
            }


        } catch (error) 
        {
            console.error(error);
        }
    };

const userSignin=async (req,res)=>{
    try{
        const email=req.body.email;
        const udetails=await User.findOne({email:email});

        if ( !udetails.isActive) {
          res.redirect('/userSignin?noti=Conatct admin, Your account is not active!! !');
        }

        const passwordMatch = await bcrypt.compare(req.body.password, udetails.password);
        if(passwordMatch )
        {
            req.session.user_id=udetails._id;
            req.session.user=udetails.name;    
            res.redirect('/');
        }

        else
        {
          res.redirect('/userSignin?noti=Wrong credentials!!');
        }
    }
    catch(er){

    }
    };

const loadForgot=async (req,res)=>{
    try {
        if(!req.query.noti)
        {
          res.render("forgotpassword",{noti:''});
        }
        else{
      const noti =req.query.noti;
      res.render("forgotpassword",{noti:noti});
        }
    } catch (error) {
        
    }
    }; 

const passwordForgot=async(req,res)=>{
    try {
        const email=req.body.email;
        const user=await User.findOne({email:email});
        console.log("-------------------->>>>>>>>>>>>"+user);

        if(!user){
            res.redirect('/forgotpassword?noti=INVALID USER NAME!  ');
        }
        else{
            const rotp=await sendMail('',email);
            req.session.rotp=rotp;
            console.log(rotp);
            const forgotdata=
            {
                email:req.body.email,
                password:req.body.password,
            }
            res.render('forgotpasswordotp',{forgotdata});

        }
    } catch (error) {
        
    }

    };

const updatepw=async (req,res)=>{
        try {
            console.log(req.body);
            if(req.body.npassword == req.body.cpassword)
            {
                const hpassowd=await ecryptpassword(req.body.npassword);
                console.log("123123123"+hpassowd);
                console.log(req.session.user_id);
                const pwupdate= await User.findByIdAndUpdate({_id:req.session.user_id},{password:hpassowd});
                if(pwupdate)
                {
                    res.redirect("/userDashboard");
                }

            }
            
        } catch (error) {
            
        }

    };

const passwordForgototp=async(req,res)=>{
    try {
        console.log(req.body);
        if(req.body.otp== req.session.rotp)
        {
            const hpassowd =await ecryptpassword(req.body.password);
            console.log("hashed "+hpassowd);
            const pwupdate=await  User.findOneAndUpdate({email:req.body.email},{password:hpassowd});
            if(pwupdate){
                console.log(pwupdate?._id);
                req.session.user_id=pwupdate?._id;
                res.redirect("/userSignin");
            }
        }
    } catch (error) {
        console.log(error);
    }

    };
    

const userLogout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
    };

    
const productShop=async (req,res)=>{
try {
    const id=req.query.pid;
    const category =await Category.find();
    const user = await User.findById(req.session.user_id);
    const product=await Product.findById(id);
    res.render("userProduct",{product,user,category});
} catch (error) {
    console.log(error);
    res.status(404).render('error',{message:"product not found"});   
}
    };

const categoryShop=async (req,res)=>{
    const cid=req.query.cid;
    const category =await Category.find();
    const categoryname =await Category.findOne({_id:cid},{name:1});
    console.log(categoryname.name);
    const user = await User.findById(req.session.user_id);
    const product=await Product.find({category:categoryname.name});
    console.log("--------------------------------------------------------------------");
    console.log(product);
    res.render("userCategoryproducts",{product,user,category});
    };

const searchResult=async (req,res)=>{
try {
    const searchq=req.query.searchquery;
    console.log(searchq);
    const category =await Category.find();
    const product=await Product.find({isListed:true,productName: { $regex: new RegExp(searchq, 'i') }});
    // console.log(product);
    if(req.session.user_id)
    {
        const user=await User.findById(req.session.user_id);
        res.render('userSearchitems',{category:category,
            user:user,product:product,search:searchq})  
    }
    else{
        res.render('userSearchitems',{category:category,product:product,user:null,search:searchq})  
        }
    
} catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
}
    };  

const cartOpen=async (req,res)=>{
    try {
        console.log(req.session.user_id);
        if(req.session.user_id){
            res.status(200).json({userlogin:true});  
        }
        else 
        {
            res.status(200).json({notlogin:true});
        }

        
    } catch (error) {
        console.log(error);
    }

    };

const userCart=async (req,res)=>{
try {
    const category =await Category.find();
    const product=await Product.find(); 

    if(req.session.user_id)
    {
        const userCart = await User.findOne({_id: req.session.user_id}).populate('cart.productId');
        const user=await User.findById(req.session.user_id);
        const userWish = await User.findOne({_id: req.session.user_id}).populate('wishlist.productId');
        let cartAmount=0;
        for(let i =0;i<userCart.cart.length;i++){
            cartAmount= cartAmount + parseInt(userCart.cart[i].productId?.salePrice)* parseInt(userCart.cart[i]?.quantity)
        }
        console.log("5555555555555555555"+userCart);
        console.log(cartAmount);
        console.log("852852"+userWish.wishlist.length);

        res.render('userCart',{category:category,user:user,product:product,userCart:userCart,cartAmount:cartAmount,userWish:userWish})  
    }
    else

    {    
    res.redirect("userSignin");
    }
} catch (error) {
    console.error(error);
}
    };

const addtoCart=async (req,res)=>{
    try {
      let cartimax=false;
        const productId =req.body.productid ;
        console.log("FGGHFGHFGHFGHFGHFGHFGHFGHFGFGH"+productId);
        const prdct=await Product.findById(productId);
        console.log(prdct);
        if (!req.session.user_id) 
        {
            res.status(200).json({notlogin:true});
        }
        const user = await User.findById(req.session.user_id);
        console.log(user);
        const quantity=1;
        if(user)
        {
        const existingitem = user.cart.find((item)=>
                item.productId.equals(productId)
            );

        if(existingitem){
            console.log("existingitem>>>>>>>>>");
            console.log(existingitem);
            existingitem.quantity++;
            if(existingitem.quantity>prdct.quantity)
            {
              existingitem.quantity=prdct.quantity;
              cartimax=true;
            }
            await user.save();
            res.status(200).json({toCart:true});
        }else{
            const cartItem=await User.findByIdAndUpdate({_id:req.session.user_id    },{$push:{cart:{productId:productId,quantity:quantity}}});
            if (cartItem) {
        const usercl = await User.findById(req.session.user_id);
                    const cartcount=usercl.cart.length;
                    console.log(cartcount);
                    console.log(cartimax);
              if(cartimax){
                res.status(200).json({toCart:true,cartcount:cartcount,cartimax:true});
              }
                res.status(200).json({toCart:true,cartcount:cartcount,cartimax:false});
              } else {
                res.status(200).json({toCart:false,cartimax:false});
              }
        }
    }

    } 
    catch (error) {
        
    }
    };

const removecartitem=async (req,res)=>{
        try {
            console.log("remove item router");
            const user_id=req.session.user_id;
            const cart_item_id=req.body.productId;
            const user=await User.findById(user_id);
            const cart=user.cart;
            console.log("cart filtering");
            const newcart=cart.filter((cartitem)=>{
                if(cartitem.productId!=cart_item_id){
                return cartitem}
            });
            console.log(cart);
            console.log(newcart);
            user.cart=newcart;
            const usersave=user.save();
            if(usersave){
                res.status(200).json({itemRemoved:true});  
            }
            else{
                res.status(200).json({itemnotRemoved:true});  
            }
        } 
        catch (error) 
        {
            console.log(error);
        }

    };

// const checkoutCart=async(req,res)=>{
//     try {
//      const user = await User.findById(req.session.user_id);
//      const userData = await User.findById(req.session.user_id);
//      const userCart = await User.findOne({_id: req.session.user_id}).populate('cart.productId')
//      const categories = await Category.find();
//     //  console.log(user);
//      console.log(userCart);
//      res.render('checkoutcart',{
//        user: user,
//        userCart: userCart,
//        userData: userData,
//        categories: categories
//      })
    
//    } catch (error) {
//      console.log(error.message);  
//     }

//     };

const checkoutCart = async (req, res) => {
    try {
      const userData = await User.findById(req.session.user_id);
      const userCart = await User.findOne({ _id: req.session.user_id }).populate(
        "cart.productId"
      );
      const categories = await Category.find();
  
      // Use async/await to calculate wallet balance
      const walletResult = await User.aggregate([
        {
          $match: { _id: userData._id }, // Match the user by _id
        },
        {
          $unwind: "$wallet", // Unwind the 'wallet' array to work with individual transactions
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$wallet.amount" }, // Calculate the sum of 'amount' values
          },
        },
      ]).exec();
    
  
      let walletBalance;
  
      if (walletResult && walletResult.length > 0) {
        walletBalance = walletResult[0].totalAmount.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR", // You can change 'USD' to 'INR' for Indian Rupees
        });
        console.log("Total Amount in Wallet:", walletBalance);
      } else {
        console.log("No wallet transactions found.");
      }
  
      console.log("walletout", walletBalance);
  
      res.render("checkoutcart", {
        user: userData,
        userCart: userCart,
        userData: userData,
        categories: categories,
        walletBalance: walletBalance,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  
  //apply coupon
  
  const applyCoupon = async (req, res) => {
    try {
      const name = req.body.coupon;
      const total = req.body.total;
      console.log(req.body);
      const userData = await User.findById(req.session.user_id);
      const coupon = await Coupon.findOne({
        $and: [{ couponName: name }, { users: { $nin: [req.session.user_id] } }],
      });
      console.log(coupon);
      if (coupon) {
        console.log(coupon.minAmt < total);
        if (parseInt(coupon.minAmt) <= parseInt(total)) {
          console.log("if");
          const discountedAmt = (total * coupon.discount) / 100;
          console.log("discountedAmt");
          console.log(discountedAmt);
          console.log(discountedAmt < coupon.maxDiscount);
          if (discountedAmt < coupon.maxDiscount) {
            var discount = discountedAmt;
          } else {
            var discount = coupon.maxDiscount;
          }
          console.log("discount");
          console.log(discount);
          var newTotal = total - discount;
  
          console.log("newTotal");
          console.log(newTotal);
  
          await Coupon.updateOne(
            { couponName: name },
            { $push: { users: userData._id } }
          );
          res.status(200).json({
            success: true,
            coupon: coupon,
            newTotal: newTotal,
            discount: discount,
          });
        } else {
          console.log("big else");
          res.status(200).json({
            success: false,
            message: "coupon cannot be used",
          });
        }
      } else {
        console.log("coupon already used by the user");
        res.status(200).json({
          success: false,
          message: "coupon already used by the user",
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };



// const checkout=async (req,res)=> {
//         try {     
//           console.log(req.body.payment_option);
//           const payment_option=req.body.payment_option;
//           const userId = req.session.user_id;
//           const user = await User.findById(req.session.user_id);
//           const cart = await User.findById(req.session.user_id, { cart: 1, _id: 0 });
//           let total = req.body.total;


//             //order structure
//           const order = new Order({
//             customerId: userId,
//             quantity: req.body.quantity,
//             price: req.body.salePrice,
//             products: cart.cart,
//             coupon: req.body.couponName,
//             discount: '0',
//             totalAmount: total,
//             shippingAddress: req.body.address,
//             paymentDetails: req.body.payment_option,
//           });
          
//             if (order.paymentDetails === 'COD') 
//             {
//                 //order saving
//                 const orderSuccess = await order.save();
//                 console.log("order success data-----------------"+orderSuccess);
//                 if (orderSuccess) 
//                 {
//                   for (const cartItem of user.cart) 
//                   {
//                     const product = await Product.findById(cartItem.productId);
//                     if (product) {
//                       product.quantity -= cartItem.quantity;
//                       await product.save();
//                       console.log("ORDER ID -------------->>>>>"+orderSuccess._id);
//                       console.log('quantity decreased');
//                     }
//                   }
//                   // Make the cart empty
//                   await User.updateOne({ _id: userId }, { $unset: { cart: 1 } });
//                   console.log('cart cleared');
      
//                 };

//                 res.status(200).json({
//                 status: true,
//                 ordid:orderSuccess._id,
//                 msg: "Order created for COD",
//             })
                  
//             }
//             else if (order.paymentDetails === 'WALLET') 
//             {
//                                 //order saving
//                                 const orderSuccess = await order.save();
//                                 console.log("order success data-----------------"+orderSuccess);
//                                 if (orderSuccess) 
//                                 {
//                                   for (const cartItem of user.cart) 
//                                   {
//                                     const product = await Product.findById(cartItem.productId);
//                                     if (product) {
//                                       product.quantity -= cartItem.quantity;
//                                       await product.save();
//                                       console.log("ORDER ID -------------->>>>>"+orderSuccess._id);
//                                       console.log('quantity decreased');
//                                     }
//                                   }
//                                   // Make the cart empty
//                                   await User.updateOne({ _id: userId }, { $unset: { cart: 1 } });
//                                   console.log('cart cleared');
                      
//                                 };

//                 //WALLET AMOUNT DEDUCTION 
//                     res.status(200).json({
//                     status: true,
//                     ordid:orderSuccess._id,
//                     msg: "Order created for Wallet",
//             })
//             }
                  
//               else if(payment_option=="razorpay")
//             {

//                 //order saving
//                 const orderSuccess = await order.save();
//                 console.log("order success data-----------------"+orderSuccess);

//                 const amount=total*100;
//                 const reciept=orderSuccess._id;

//                 let options =   {
//                                 amount: amount, 
//                                 currency: "INR",
//                                 receipt: reciept
//                                 };

//                 instance.orders.create(options, function(err, order) 
//                 {
//                     if(!err)
//                     {

//                         console.log(""+order);
//                         res.status(200).send({
//                             success: true,
//                             msg: "Order created",
//                             order_id: order.id,
//                             amount: amount,
//                             reciept: reciept,
//                             key_id: process.env.rz_key,
//                             contact: "8093296456",
//                             name: "medibuddy",
//                             email: "medibuddy@gmail.com",
//                     })
                            
//                     }
//                     else{
//                         const orderremove =async ()=>
//                         {
//                         await order.deleteOne({_id:orderSuccess._id});
//                         }
//                         orderremove();
//                         res.status(400).send({ success: false, msg: "Something went wrong!" });
//                     }
//                 });

//             }
//             //order creation


//               const orderSuccess = await order.save();
//               console.log("order success data-----------------"+orderSuccess);
//               if (orderSuccess) 
//               {
//                 for (const cartItem of user.cart) 
//                 {
//                   const product = await Product.findById(cartItem.productId);
//                   if (product) {
//                     product.quantity -= cartItem.quantity;
//                     await product.save();
//                     console.log("ORDER ID -------------->>>>>"+orderSuccess._id);
//                     console.log('quantity decreased');
//                   }
//                 }
//                 // Make the cart empty
//                 await User.updateOne({ _id: userId }, { $unset: { cart: 1 } });
//                 console.log('cart cleared');
    
//             }
//           }
//         catch (error) 
//         {
//             console.error(error.message);
//             res.status(500).send("Internal Server Error");
//         }
//     };


const checkout = async (req, res) => {
  try {
    console.log(req.body);
    const userId = req.session.user_id;
    const user = await User.findById(req.session.user_id);
    const cart = await User.findById(req.session.user_id, { cart: 1, _id: 0 });
    const coupon = await Coupon.findOne({
      $and: [
        { couponName: req.body.couponName },
        { users: { $nin: [req.session.user_id] } },
      ],
    });
    const walletResult = await User.aggregate([
      {
        $match: { _id: user._id }, // Match the user by _id
      },
      {
        $unwind: "$wallet", // Unwind the 'wallet' array to work with individual transactions
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$wallet.amount" }, // Calculate the sum of 'amount' values
        },
      },
    ]).exec();

    let walletBalance;

    if (walletResult && walletResult.length > 0) {
      walletBalance = walletResult[0].totalAmount.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR", // You can change 'USD' to 'INR' for Indian Rupees
      });
      console.log("Total Amount in Wallet:", walletBalance);
    } else {
      console.log("No wallet transactions found.");
    }

    req.session.returnTo1 = "/checkout";

    console.log("walletout", walletBalance);

    let discount = 0;
    let newTotal = req.body.total;
    let total = 0;

    if (req.body.couponName) {
      console.log("coupon present");
      console.log(coupon);
      if (parseInt(coupon.minAmt) <= parseInt(req.body.total)) {
        console.log("if");
        const discountedAmt = (req.body.total * coupon.discount) / 100;
        console.log("discountedAmt");
        console.log(discountedAmt);
        console.log(discountedAmt < coupon.maxDiscount);
        if (discountedAmt < coupon.maxDiscount) {
          discount = discountedAmt;
        } else {
          discount = coupon.maxDiscount;
        }
        console.log("coupon.minAmt<total");
        console.log(discount);
        newTotal = req.body.total - discount;

        console.log("newTotal");
        console.log(newTotal);
      }
    } else if (!req.body.couponName) {
      console.log("no coupon used");
    }

    if (newTotal) {
      console.log("total if");
      total = newTotal;
    } else {
      console.log("total else");

      total = req.body.total;
    }
    // console.log(cart.cart);
    console.log(req.body);
    const order = new Order({
      customerId: userId,
      quantity: req.body.quantity,
      price: req.body.salePrice,
      products: cart.cart,
      coupon: req.body.couponName,
      discount: discount,
      totalAmount: total,
      shippingAddress: JSON.parse(req.body.address),
      paymentDetails: req.body.payment_option,
    });
    const orderSuccess = await order.save();
    // console.log('order==',order);
    // console.log('order');
    // console.log(order._id);
    const orderId = order._id;
    // console.log(orderSuccess);
    console.log(orderId);

    if (orderSuccess) {
      // Make the cart empty
      await User.updateOne({ _id: userId }, { $unset: { cart: 1 } });

      if (order.paymentDetails === "COD") {
        await Order.updateOne(
          { _id: new mongoose.Types.ObjectId(orderId) },
          { $set: { orderStatus: "PLACED" } }
        );
        for (const cartItem of user.cart) {
          const product = await Product.findById(cartItem.productId);
  
          if (product) {
            product.quantity -= cartItem.quantity;
            await product.save();
            console.log("quantity decreased");
          }
        }
  
        res.status(200).json({
          status: true,
          msg: "Order created for COD",
          orderId: orderId
        });
      } else if (req.body.payment_option === "razorpay") {
        console.log("razorpay");

        const amount = total * 100;
        const options = {
          amount: amount,
          currency: "INR",
          receipt: String(orderId),
        };

        for (const cartItem of user.cart) {
          const product = await Product.findById(cartItem.productId);
  
          if (product) {
            product.quantity -= cartItem.quantity;
            await product.save();
            console.log("quantity decreased");
          }
        }

        // Create a Razorpay order
        instance.orders.create(options, (err, order) => {
          if (!err) {
            console.log("Razorpay order created");
            console.log(orderId);
            

            // Send Razorpay response to the client
            res.status(200).send({
              success: true,
              msg: "Order created",
              order_id: order.id,
              amount: amount,
              reciept: orderId,
              key_id: process.env.rz_key,
              contact: "8093296456",
              name: "medibuddy",
              email: "medibuddy@gmail.com",
              orderId: orderId
            });
          } else {
            console.error("Razorpay order creation failed:", err);
            res
              .status(400)
              .send({ success: false, msg: "Something went wrong!" });
          }
        });
      }else if(req.body.payment_option === "WALLET"){
        console.log(walletResult[0].totalAmount);
        console.log(order.totalAmount);
        if(walletResult[0].totalAmount<order.totalAmount){
          console.log('if');
          res.status(200).json({
            lowWalletBalance: true,
            message: 'bill amount exceed wallet balance'
          })
        }else{
          console.log('else');
          let transaction = {
            orderId: orderId,
            amount: -order.totalAmount,
            transactionType: "DEBIT",
            remarks: "CHECKOUT",
          };
      
          user.wallet.push(transaction);
          await user.save();
          
          await Order.updateOne(
            { _id: new mongoose.Types.ObjectId(orderId) },
            { $set: {
              orderStatus: "PLACED",
              paymentStatus: "RECIEVED" } }
          );
          for (const cartItem of user.cart) {
            const product = await Product.findById(cartItem.productId);
    
            if (product) {
              product.quantity -= cartItem.quantity;
              await product.save();
              console.log("quantity decreased");
            }
          }

          res.status(200).json({
            status: true,
            msg: 'order created using wallet',
            orderId: orderId
          })

        }
      }
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};











const verifypayment=async(req,res)=>{ 
    try {
        console.log('this is id:',req.body.orderId);
        const orddtl = await Order.find({_id :req.body.orderId});
        if(orddtl){
          console.log(orddtl);
          console.log(req.body.orderId);
        }
        let hmac = crypto.createHmac('sha256', 'rzp_test_RYYLyYcGwveVst');
                  
                console.log("payp ret"+req.body.payment.razorpay_payment_id);
                console.log("payo ret"+req.body.payment.razorpay_order_id);
        hmac.update(req.body.payment.razorpay_order_id + '|' + req.body.payment.razorpay_payment_id);
        hmac = hmac.digest('hex');
        console.log(hmac);
        console.log(req.body.payment.razorpay_signature);
    
        console.log("comparison------------->>>>>>1>>>");
        // if (hmac == req.body.payment.razorpay_signature) {
            if(hmac){
        console.log("comparison----SUCCESS");

          await Order.updateOne({_id : new mongoose.Types.ObjectId(req.body.orderId)},{$set : { paymentStatus : 'RECEIVED', orderStatus :"PLACED"}});
    
          res.status(200).json({ status: 'success',
          msg: 'Payment verified',
          orderId:req.body.orderId

         });
        } else {
    
          res.status(400).json({ status: 'error', msg: 'Payment verification failed' });
        }
      } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', msg: 'Internal server error' });
      }
    };

const ordersuccess=async (req,res)=>{
    try {
        const orderid=req.query.ordid;
        console.log(orderid);
        
        res.render('orderplaced',{ordid:orderid});
    } catch (error) {
        console.log(error);
    }
    };
    
const orderdetails=async (req,res)=>{
    try {
    const user_id=req.session.user_id;
    const user=await User.findById(user_id);
    const orderid=req.query.ordid;
    const order = await Order.findOne({_id: orderid}).populate('products.productId');
    res.render('userorderdetails',{order:order,user:user})
    } catch (error) {
        console.error(error);
        res.status(404).render('error',{message:"product not found"});   

    }
    };

const downloadInvoice = async (req, res) => {
        try {
          const orderId = req.body.orderId;
          const order = await Order.findById(orderId).populate("products.productId");
          const product = order.products.map((item, i) => {
            return {
              quantity: parseInt(item.quantity),
              discount: parseInt(order.couponDiscount),
              total: parseInt(order.paidAmount),
              description: item.productId.name,
              price: parseInt(item.productId.price),
              "tax-rate": 0,
            };
          });
          var data = {
            //   "images": {
            //       "logo": "/assets/imgs/theme/logo1.png"
            //  },
            // Your own data
      
            sender: {
              company: "Medibuddy",
              address: "M R Nagar, Vikas Street,56,Kadavanthra",
              zip: "688535",
              city: "Ernakulam",
              state: "Kerala",
              country: "India",
            },
            // Your recipient
            client: {
              company: order.shippingAddress.customerName,
              address: order.shippingAddress.addressLine1,
              zip: order.shippingAddress.zipcode,
              city: order.shippingAddress.city,
              state: order.shippingAddress.state,
              country: "INDIA",
            },
      
            information: {
              // Invoice number
              number: order.orderId,
              // Invoice data
              date: String(order.createdAt).slice(4, 16),
              // Invoice due date
              "due-date": String(order.createdAt).slice(4, 16),
            },
            // The products you would like to see on your invoice
            // Total values are being calculated automatically
            products: product,
            // The message you would like to display on the bottom of your invoice
            "bottom-notice": "Kindly keep your invoice till warranty period.",
            // Settings to customize your invoice
            settings: {
              currency: "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
              // "locale": "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')
              // "margin-top": 25, // Defaults to '25'
              // "margin-right": 25, // Defaults to '25'
              // "margin-left": 25, // Defaults to '25'
              // "margin-bottom": 25, // Defaults to '25'
              // "format": "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
              // "height": "1000px", // allowed units: mm, cm, in, px
              // "width": "500px", // allowed units: mm, cm, in, px
              // "orientation": "landscape", // portrait or landscape, defaults to portrait
            },
          };
      
          console.log("data");
          console.log(data);
          res.json(data);
        } catch (error) {
          console.error(error.message);
          res.status(404).render('error',{message:"product not found"});   

        }
    };

const updatequantity = async (req,res) => {
        try {
            console.log(req.body)
            req.body.count = parseInt(req.body.count)
            const updatedata = await User.updateOne({_id: req.session.user_id,'cart.productId': req.body.productId,},{$inc:{'cart.$.quantity': req.body.count,}},{new:true});
            if(updatedata)
            {
                res.status(200).json({quantityupdated:true})
            }

        } catch (error) {
            console.log(error.message);
          res.status(404).render('error',{message:"product not found"});   

        }
    };

const userWishlist=async (req,res)=>{
    try {
        const category =await Category.find();
        const product=await Product.find(); 
    
        if(req.session.user_id)
        {
            const user=await User.findById(req.session.user_id);
            const userwishlist = await User.findOne({_id: req.session.user_id}).populate('wishlist.productId');
            res.render('userWishlist',{category:category,user:user,product:product,userwishlist:userwishlist})  
        }
        else
    
        {    
        res.redirect("userSignin");
        }
    } catch (error) {
        console.error(error);
        res.status(404).render('error',{message:"product not found"});   

    }
    };

    const wsOpen=async (req,res)=>{
      try {
          console.log(req.session.user_id);
          if(req.session.user_id){
              res.status(200).json({userlogin:true});  
          }
          else 
          {
              res.status(200).json({notlogin:true});
          }
  
          
      } catch (error) {
          console.log(error);
      }
  
      };




const addtoWishlist=async(req,res)=>{
    try {
        const productId =req.body.productid ;
        const prdct=await Product.findById(productId);
        if (!req.session.user_id) 
        {
            res.status(200).json({notlogin:true});
        }
        const user = await User.findById(req.session.user_id);
        console.log(user);
        if(user)
        {
        const existingitem = user.wishlist.find((item)=>
                item.productId.equals(productId)
            );

        if(existingitem){
            console.log("existingitem>>>>>>>>>");
            console.log(existingitem);
            res.status(200).json({exsting:true});
        }else{
            const wishlistItem=await User.findByIdAndUpdate({_id:req.session.user_id},{$push:{wishlist:{productId:productId}}});
            if (wishlistItem) {
                const wlsize=wishlistItem.wishlist.length;
                res.status(200).json({towishlist:true,wlsize:wlsize});
              } else {
                res.status(200).json({towishlist:false});
              }
        }
    }

    }  catch (error) {
        console.log(error);
        res.status(404).render('error',{message:"product not found"});   

    }
    };

const removeWishitem=async (req,res)=>{
    try {
        console.log("remove item router");
        const user_id=req.session.user_id;
        const wish_item_id=req.body.productId;
        const user=await User.findById(user_id);
        const wishlist=user.wishlist;
        console.log("wishlist filtering");
        const newwishlist=wishlist.filter((wish_item)=>{
            if(wish_item.productId!=wish_item_id){
            return wish_item}
        });
        console.log(wishlist);
        console.log(newwishlist);
        user.wishlist=newwishlist;
        const usersave=user.save();
        console.log("deleted at db");
        if(usersave){
            res.status(200).json({itemRemoved:true});  
        }
        else{
            res.status(200).json({itemnotRemoved:true});  
        }
    } 
    catch (error) 
    {
        console.log(error);
        res.status(404).render('error',{message:"product not found"});   

    }
    };

const allProduct = async (req, res) => {
    try {
      req.session.originalURL = '/allProducts';
      console.log(req.query.page);  
      var page = 1;
      if (req.query.page) {
        page = req.query.page;
      }
  
      const limit = 3;
      const productsQuery = Product.find();
      console.log(productsQuery);
  
      const products = await paginateQuery(productsQuery, page, limit).exec();
      console.log("products:", products); // Log products to check if they are retrieved correctly.
  
      const count = await Product.find().populate("category").countDocuments();
      console.log("count is " + count);
  
      const category = await Category.find({ isListed: true });
      const user = await User.findById(req.session.user_id);
      const secret = true;
  
      res.render("userallProduct", {
        product: products,
        category: category,
        user: user,
        pathurl: '/allProducts',
        totalPages: Math.ceil(count / limit),
        count: count,
        page: page,
        search: undefined,
        secret: secret,
      });
    } catch (error) {
      console.log("Error in allProduct:", error);
      // Handle the error, you can send an error response to the client if needed.
      res.status(500).json({ error: "Internal Server Error" });
    }
    };

const cancelOrder = async (req,res) => {
        try {
            console.log(req.query.oid);
          const id = req.query.oid;
          const update = {
            orderStatus: "CANCELLED",
          };
          const order = await Order.findById(id);
          const orderUpdate = await Order.findByIdAndUpdate(id, update);
          const user = await User.findById(req.session.user_id);
      
          if (order) {
            for (const orderItem of order.products) {
              const product = await Product.findById(orderItem.productId);
      
              if (product) {
                product.quantity += orderItem.quantity;
                await product.save();
                console.log("quantity increased");
              }
            }

            let wupdate = {
                orderId: order._id,
                amount: order.totalAmount,
                transactionType: "CREDIT",
                remarks: "CANCELLED",
              };
          
              console.log(user.wallet);
              user.wallet.push(wupdate);
              await user.save();
          }
          console.log(user.wallet);      
          res.redirect("/userDashboard");
        } catch (error) {
          console.log(error.message);        
          res.status(404).render('error',{message:"product not found"});   

        }
    };
      
const returnOrder = async (req,res) => {
    try {
        // const reason = req.body.reason;
        const id = req.query.oid;
        const order = await Order.findById({
          _id: new mongoose.Types.ObjectId(id),
        });
        // await Order.findByIdAndUpdate({ _id: new mongoose.Types.ObjectId(id) },
        //   { $set: { returnReason: reason, orderStatus: "RETURNED" } }
        // ).lean();

        await Order.findByIdAndUpdate({ _id: new mongoose.Types.ObjectId(id) },
        { $set: {orderStatus: "RETURNED" } }
      ).lean();

        const user = await User.findById(req.session.user_id)
    
        if (order) {
          for (const orderItem of order.products) {
            const product = await Product.findById(orderItem.productId);
    
            if (product) {
              product.quantity += orderItem.quantity;
              await product.save();
              console.log("quantity increased");
            }
          }
          
          let wtransact = {
            orderId: order._id,
            amount: order.totalAmount,
            transactionType: "CREDIT",
            remarks: "RETURNED",
          };
      
          user.wallet.push(wtransact);
          await user.save();
    
        }
        res.redirect("/userDashboard")
      } catch (error) {
        console.log(error.message);          
        res.status(404).render('error',{message:"product not found"});   

      }
    };
  
function paginateQuery(query, page, limit) {
    try {
      const skip = (page - 1) * limit;
      return query.skip(skip).limit(limit);
    } catch (error) {
      console.error("Error in paginateQuery:", error);
      throw error;
    }
    };

module.exports = {
                userhome,
                userAbout,
                userContact,
                loadSignup,
                loadSignin,
                newUser,
                userSignin,
                userDashboard,
                addaddressload,
                addAddress,
                updateaddressload,
                updateaddress,
                userLogout,
                productShop,
                categoryShop,
                cartOpen,
                userCart,
                addtoCart, 
                checkoutCart,
                applyCoupon,
                checkout,
                orderdetails,
                removecartitem,
                updatequantity,
                usersignupOtp,
                searchResult,
                userWishlist,
                addtoWishlist,
                removeWishitem,
                ordersuccess,
                verifypayment,
                loadForgot,
                passwordForgot,
                passwordForgototp,  
                updatepw,
                downloadInvoice,
                allProduct,
                returnOrder,
                cancelOrder,
                wsOpen         
            };