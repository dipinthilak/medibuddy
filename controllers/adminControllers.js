const Admin = require("../models/adminSchema");
const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const Order=require("../models/orderSchema");
const path = require("path");
const { render } = require("../routers/user_Routers");

const loadLogin = (req, res) => {
  if (req.query.credential) {
    const crerror = true;
    res.render("adminLogin", { crerror });
  }
  const crerror = false;
  res.render("adminLogin", { crerror });
};

const adminSignin = async (req, res) => 
{
  try 
  {
    const email = req.body.email;
    if (req.body.email != null && req.body.password != null) 
        {
          const adetails = await Admin.findOne({ email: email });
          if(adetails)
          {
            const passwordMatch = await bcrypt.compare(
            req.body.password,
            adetails.password
          );
          if (passwordMatch) 
          {
            req.session.admin = adetails._id;
            res.render("adminDashboard");
          } 
          else
          {
            res.redirect("/admin/?credential=wrong");
          }
          }
          else
          {
            res.redirect("/admin/?credential='wrong'");
          }
        } 
    else 
    {
      res.redirect("/admin/?credential='wrong'");
    }
  } 
  catch (er) 
  {
    console.log(er);
  }
};

const adminDashboard = async (req, res) => {
  res.render("adminDashboard");
};

const loadUsermanagement = async (req, res) => {
  const users = await User.find();
  // console.log(users);
  res.render("adminUseredit", { users: users });
};

const userstatusChange = async (req, res) => {
  try {
    const userid = req.query.userId;
    const user = await User.findById({ _id: userid });
    if (user.isActive) {
      await User.findByIdAndUpdate(userid, { isActive: false });
    } else {
      await User.findByIdAndUpdate(userid, { isActive: true });
    }
    res.redirect("/admin/adminuserManagement");
  } catch (errordata) {
    console.log(errordata);
  }
};

const userdataUpdate = async (req, res) => {
  try {
    const userid = req.query.userId;
    const userdata = await User.findById({ _id: userid });
    res.render("adminUserupdate.ejs", { userdata });
  } catch (er) {
    console.error(er);
  }
};

const userUpdate = async (req, res) => {
  try {
    const userid = req.query.userId;
    let userdetails = {
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
    };
    const userdata = await User.findByIdAndUpdate({ _id: userid }, userdetails);
    if (userdata) {
      res.redirect("/admin/adminuserManagement");
    }
  } catch (er) {
    console.error(er);
  }
};

const adminSignout = async (req, res) => {
  await req.session.destroy((err) => {
    res.redirect("/admin/");
  });
};

const ordermanagement=async (req,res)=>{
  try {
    const order= await Order.find().populate('customerId')
    res.render("adminOrderview",{order:order});
  } catch (error) {
    console.log(error);
  }

};

const orderdetails=async (req,res)=>{
    try {
        const orderId = req.query.ordrid;
        const order = await Order.findById(orderId).populate('customerId');
        const product = await Order.findById(orderId).populate('products.productId');

        res.render('adminOrderdetails',{order: order, product: product})
    } catch (error) {
        console.log(error.message);
    }
};
module.exports = {
  loadLogin,
  adminSignin,
  loadUsermanagement,
  userstatusChange,
  userdataUpdate,
  userUpdate,
  adminSignout,
  adminDashboard,
  ordermanagement,
  orderdetails
};
