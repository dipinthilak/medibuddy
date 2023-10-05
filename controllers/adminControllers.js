const Admin = require("../models/adminSchema");
const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const path = require('path')


const loadLogin = (req, res) => {
  res.render("adminLogin");
};

const adminSignin = async (req, res) => {
  try {
    const email = req.body.email;
    if (req.body.email != null && req.body.password != null) {
      console.log(req.body.email, req.body.password);
      const adetails = await Admin.findOne({ email: email });
      console.log(adetails);
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        adetails.password
      );
      console.log(passwordMatch);
      if (passwordMatch) {
        req.session.admin = adetails._id;
        res.render("adminDashboard");
      } else {
        res.redirect("/admin/");
      }
    } else {
      res.redirect("/admin/");
    }
  } catch (er) {
    console.log(er);
  }
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
const adminSignout=async (req,res)=>{
 await req.session.destroy((err) => {
    res.redirect('/admin/') 
  })

}
module.exports = {
  loadLogin,
  adminSignin,
  loadUsermanagement,
  userstatusChange,
  userdataUpdate,
  userUpdate,
  adminSignout
};
