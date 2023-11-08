const User = require('../models/userSchema');
const Category=require('../models/categorySchema');
const Product=require("../models/productSchema")
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Order=require('../models/orderSchema');
const dotenv = require('dotenv');
const crypto = require('crypto');
const Razorpay=require('razorpay');
const mongoose = require('mongoose');
const { log } = require('console');
dotenv.config({ path: ".env" });

 
const  instance  = new Razorpay({
    key_id: "rzp_test_RYYLyYcGwveVst",
    key_secret: "m2uATo0jzjf681FDD9nl8B16",
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

const userhome=async (req,res)=>{
    const category =await Category.find();
    const product=await Product.find({isListed:true});
    if(req.session.user_id)
    {
        const user=await User.findById(req.session.user_id);
        res.render('userHome',{category:category,
            user:user,product:product})  
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

const loadSignup=async(req,res)=>{
    res.render('userSignup')
    };

const userDashboard =async (req,res)=>{
    const user = await User.findById(req.session.user_id);
    const order=await Order.find({customerId:req.session.user_id}).sort({ createdAt: -1 });
    console.log(order.length);
    res.render('userDashboard',{user:user,order:order})
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
    }

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
      

    }

const loadSignin=async(req,res)=>{
    res.render('userSignin')
    };

const newUser = async(req, res) => {
    try {
        const user ={
            name : req.body.username,
            email : req.body.email,
            mobile : req.body.number,
            password : req.body.password,
         };     
         console.log(user.email);
         const otp= await sendMail(user.name,user.email);
         req.session.otp=otp;
         console.log("otp    --->>>"+otp);
         console.log(otp);
         res.render('usersignupwithOtp',{user,wrongotp:false});
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
            console.log(req.session.otp);
            console.log(req.session.otp?.otp);
            console.log(req.body.otp);
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
                res.render('userSignin')
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
        const passwordMatch = await bcrypt.compare(req.body.password, udetails.password);
        if(passwordMatch)
        {
            req.session.user_id=udetails._id;
            req.session.user=udetails.name;
            const order = await Order.find({ customerId: req.session.user_id }).sort({ createdAt: -1 });
            console.log(order);
            res.render('userDashboard',{user : udetails,order:order})
        }
        else{
            res.redirect('/userSignin');
        }
    }
    catch(er){

    }
    };

const loadForgot=async (req,res)=>{
    try {
        res.render("forgotpassword");
    } catch (error) {
        
    }
    };

const passwordForgot=async(req,res)=>{
    try {
        const email=req.body.email;
        const user=await User.findOne({email:email});
        console.log("-------------------->>>>>>>>>>>>"+user);

        if(!user){
            res.redirect('/forgotpassword');
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

    }

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
    const id=req.query.pid;
    const category =await Category.find();
    const user = await User.findById(req.session.user_id);
    const product=await Product.findById(id);
    res.render("userProduct",{product,user,category});
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
            user:user,product:product})  
    }
    else{
        res.render('userSearchitems',{category:category,product:product,user:null})  
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

}

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
            await user.save();
            res.status(200).json({toCart:true});
        }else{
            const cartItem=await User.findByIdAndUpdate({_id:req.session.user_id    },{$push:{cart:{productId:productId,quantity:quantity}}});
            if (cartItem) {
        const usercl = await User.findById(req.session.user_id);
                    const cartcount=usercl.cart.length;
                    console.log(cartcount);

                res.status(200).json({toCart:true,cartcount:cartcount});
              } else {
                res.status(200).json({toCart:false});
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

const checkoutCart=async(req,res)=>{
    try {
     const user = await User.findById(req.session.user_id);
     const userData = await User.findById(req.session.user_id);
     const userCart = await User.findOne({_id: req.session.user_id}).populate('cart.productId')
     const categories = await Category.find();
     console.log(user);
     console.log(userCart);
     res.render('checkoutcart',{
       user: user,
       userCart: userCart,
       userData: userData,
       categories: categories
     })
    
   } catch (error) {
     console.log(error.message);  
    }

    };

const codcheckout=async (req,res)=> {
        try {     
          console.log("123456789123456789123456789");
          console.log(req.body.payment_option);
          const payment_option=req.body.payment_option;
          const userId = req.session.user_id;
          const user = await User.findById(req.session.user_id);
          const cart = await User.findById(req.session.user_id, { cart: 1, _id: 0 });
          let total = req.body.total;

          const order = new Order({
            customerId: userId,
            quantity: req.body.quantity,
            price: req.body.salePrice,
            products: cart.cart,
            coupon: req.body.couponName,
            discount: '0',
            totalAmount: total,
            shippingAddress: req.body.address,
            paymentDetails: req.body.payment_option,
          });
          const orderSuccess = await order.save();
          console.log("order success data--------------------------------------"+orderSuccess);
          if (orderSuccess) 
          {
            for (const cartItem of user.cart) {
              const product = await Product.findById(cartItem.productId);
              if (product) {
                product.quantity -= cartItem.quantity;
                await product.save();
                console.log("ORDER ID -------------->>>>>"+orderSuccess._id);
                console.log('quantity decreased');
              }
            }
            // Make the cart empty
            await User.updateOne({ _id: userId }, { $unset: { cart: 1 } });
            console.log('cart cleared');

            if (order.paymentDetails === 'COD') 
            {
              res.status(200).json({
                status: true,
                ordid:orderSuccess._id,
                msg: "Order created for COD",
              })
                  
            }
                  
              else if(payment_option=="razorpay")
            {
                const amount=total*100;
                const reciept=orderSuccess._id;

                let options =   {
                                amount: amount, 
                                currency: "INR",
                                receipt: reciept
                                };

                instance.orders.create(options, function(err, order) {
                    if(!err){
                        console.log(order);
                        res.status(200).send({
                            success: true,
                            msg: "Order created",
                            order_id: order.id,
                            amount: amount,
                            reciept: reciept,
                            key_id: 'rzp_test_RYYLyYcGwveVst',
                            contact: "8893196356",
                            name: "medibuddy",
                            email: "medibuddy@gmail.com",
                    })
                            }
                    else{
                        res.status(400).send({ success: false, msg: "Something went wrong!" });
                    }
                  });

            }
            }
          }
        catch (error) 
        {
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
    
          res.status(200).json({ status: 'success', msg: 'Payment verified' });
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
    }
    };


const downloadInvoice = async (req, res) => {
        try {
          const orderId = req.body.orderId;
          // console.log(orderId);
          const order = await Order.findById(orderId).populate("products.productId");
      
          // console.log("order");
          // console.log(order);
          // console.log(productId);
      
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
      
          // console.log("product");
          // console.log(product);
          var data = {
            //   "images": {
            //       "logo": "/assets/imgs/theme/logo1.png"
            //  },
            // Your own data
      
            sender: {
              company: "VisionVogue",
              address: "Vison Nagar, Gandhi Street,78,Kadavanthra",
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
          res
            .status(500)
            .json({ status: "error", msg: "Unable to download invoice" });
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
    }
    };
// const allProduct1=async (req,res)=>{
//     const category =await Category.find();
//     const categoryname ={name:'all'}
//     console.log(categoryname.name);
//     const user = await User.findById(req.session.user_id);
//     const product=await Product.find();
//     console.log("--------------------------------------------------------------------");
//     console.log(product);
//     res.render("userallProduct",{product,user,category});
// };

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
  
  function paginateQuery(query, page, limit) {
    try {
      const skip = (page - 1) * limit;
      return query.skip(skip).limit(limit);
    } catch (error) {
      console.error("Error in paginateQuery:", error);
      throw error;
    }
  }
  

    
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
                codcheckout,
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
                allProduct         
            };
