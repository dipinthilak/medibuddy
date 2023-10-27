const User = require('../models/userSchema');
const Category=require('../models/categorySchema');
const Product=require("../models/productSchema")
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Order=require('../models/orderSchema');
const dotenv = require('dotenv');
const Razorpay=require('razorpay')
dotenv.config({ path: ".env" });


const razorpay = new Razorpay({
    key_id: "rzp_test_RYYLyYcGwveVst",
    key_secret: "m2uATo0jzjf681FDD9nl8B16",
  });


//generate otp
const generateOtp = () => {
    return Math.floor(Math.random() * 90000 + 10000);
    };

//send mail
const sendMail = async (name, email) => {
    try {
        const otp = generateOtp();
        console.log(otp +"<< Otp");
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        const mailOptions = {
            from: 'medibuddycc@gmail.com',
            to: email,
            subject: 'OTP - Medibuddy',
            text: `Thank you ,${name} for choosing Medibuddy. Use this otp to finish your signup: ${otp}`,
        };

       await transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email has been sent', info.response);
            }
        });

        return otp;
    } catch (error) {
        console.log(error.message);
        throw error;
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
    const order=await Order.find({customerId:req.session.user_id});
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
        // const hashedpassword =await ecryptpassword(req.body.password);
        const user ={
            name : req.body.username,
            email : req.body.email,
            mobile : req.body.number,
            password : req.body.password,
         };     
         console.log(user.email);
         const otp=sendMail(user.name,user.email);
         req.session.otp=otp;
         console.log(otp);

        //  const user = new User({
        //     name : req.body.username,
        //     email : req.body.email,
        //     mobile : req.body.number,
        //     password : req.body.password,
        //  });

        // const userData = await user.save();
        // console.log(userData);
         res.render('usersignupwithOtp',{user,wrongotp:false});
        }
    catch (error) 
    {
        console.log(error.message);
    }
    };

const usersignupOtp=async (req,res)=>{
        const hashedpassword =await ecryptpassword(req.body.password);
        try {
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
            const order=await Order.find({customerId:req.session.user_id});
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
    };

const userCart=async (req,res)=>{
try {
    const category =await Category.find();
    const product=await Product.find(); 

    if(req.session.user_id)
    {
        const user=await User.findById(req.session.user_id);
        const userCart = await User.findOne({_id: req.session.user_id}).populate('cart.productId');
        let cartAmount=0;
        for(let i =0;i<userCart.cart.length;i++){
            cartAmount= cartAmount + parseInt(userCart.cart[i].productId?.salePrice)* parseInt(userCart.cart[i]?.quantity)
        }
        console.log("5555555555555555555"+userCart);
        console.log(cartAmount);
        res.render('userCart',{category:category,user:user,product:product,userCart:userCart,cartAmount:cartAmount})  
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
                res.status(200).json({toCart:true});
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
          console.log(req.body);
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
          const orderId = order._id;
          if (orderSuccess) {
            for (const cartItem of user.cart) {
              const product = await Product.findById(cartItem.productId);
              if (product) {
                product.quantity -= cartItem.quantity;
                await product.save();
                console.log('quantity decreased');
              }
            }
            // Make the cart empty
            await User.updateOne({ _id: userId }, { $unset: { cart: 1 } });
            res.redirect('/userHome');
            }
          }
        catch (error) {
          console.error(error.message);
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
                res.status(200).json({towishlist:true});
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
                removeWishitem                
            };
