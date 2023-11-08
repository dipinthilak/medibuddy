const express = require("express");
const admin_routers = express();
const bodyParser = require("body-parser");
const adminauth = require('../authentication/adminAuth');
const path = require("path");
const session = require("express-session");
const adminControllers = require("../controllers/adminControllers");
const categoryControllers = require("../controllers/categoryControllers");
const productControllers = require("../controllers/productController");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");

admin_routers.set("view engine", "ejs");
admin_routers.set("views", "./views/admin");
admin_routers.use(bodyParser.json());
admin_routers.use(bodyParser.urlencoded({ extended: true }));
admin_routers.use(session({
  secret: "secretkey",
  resave: false, 
  saveUninitialized: false, 
}));
//multer cat
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, path.join(__dirname, "../public/admin/category"));
  },
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

//multer product
const prostorage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, path.join(__dirname, "../public/admin/product"));
  },
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const proupload = multer({ storage: prostorage });


// sharp cat
const sharpcrop = async (req, res, next) => {
  const uncroppedimage = `C:/Users/dipin/Documents/VS Code/week11_14/medibuddy/public/admin/category/${req.file.filename}`;
  try {
    const newfilename = "cpd" + req.file.filename;
    await sharp(uncroppedimage)
      .resize(400, 400, "inside")
      .toFormat("png", { quality: 90 })
      .toFile(
        `C:/Users/dipin/Documents/VS Code/week11_14/medibuddy/public/admin/category/${newfilename}`
      );

    //image removal
    fs.unlink(
      `C:/Users/dipin/Documents/VS Code/week11_14/medibuddy/public/admin/category/${req.file.filename}`,
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("initial File deleted successfully");
        }
      }
    );
    next();
  } catch (er) {
    console.error(er);
  }
};
// sharp product
// const productsharpcrop = async (req, res, next) => {
//   const uncroppedimage = `C:/Users/dipin/Documents/VS Code/week11_14/medibuddy/public/admin/product/${req.file.filename}`;
//   try {
//     const newfilename = "cpd" + req.file.filename;
//     await sharp(uncroppedimage)
//       .resize(400, 400, "inside")
//       .toFormat("png", { quality: 90 })
//       .toFile(
//         `C:/Users/dipin/Documents/VS Code/week11_14/medibuddy/public/admin/product/${newfilename}`
//       );

//     //image removal
//     fs.unlink(
//       `C:/Users/dipin/Documents/VS Code/week11_14/medibuddy/public/admin/product/${req.file.filename}`,
//       (err) => {
//         if (err) {
//           console.log(err);
//         } else {
//           console.log("initial File deleted successfully");
//         }
//       }
//     );
//     next();
//   } catch (er) {
//     console.error(er);
//   }
// };





admin_routers.get("/",adminauth.isLogout, adminControllers.loadLogin);
admin_routers.post("/login", adminControllers.adminSignin);
admin_routers.get("/logout",adminauth.isLogin, adminControllers.adminSignout);
admin_routers.get("/adminDashboard",adminauth.isLogin,adminControllers.adminDashboard);
admin_routers.get("/createreport",adminauth.isLogin,adminControllers.createreport);


//User management
admin_routers.get("/adminuserManagement", adminauth.isLogin,adminControllers.loadUsermanagement);
admin_routers.post("/adminuserStatus", adminauth.isLogin,adminControllers.userstatusChange);
admin_routers.get("/AdminuserUpdate", adminauth.isLogin,adminControllers.userdataUpdate);
admin_routers.post("/userdataUpate", adminControllers.userUpdate);


//category management
admin_routers.get("/categorymanagement",adminauth.isLogin,categoryControllers.loadcategoryManagement);
admin_routers.get("/addnewCategories", adminauth.isLogin,categoryControllers.addCategory);
admin_routers.post("/addnewCategories",upload.single("image"),sharpcrop,categoryControllers.addnewCategory);
admin_routers.get("/admincategoriesDelete",adminauth.isLogin,categoryControllers.deleteCategoryitem)
admin_routers.get("/admincategoriesUpdate",adminauth.isLogin,categoryControllers.updateCategoryload)
admin_routers.post("/adminupdateCategories",upload.single("image"),sharpcrop,categoryControllers.updateCategoryitem)


//product management
admin_routers.get("/productmanagement",adminauth.isLogin,productControllers.loadproductManagement);
admin_routers.get("/addnewProducts",adminauth.isLogin,productControllers.addProduct);
admin_routers.post("/addnewProductsdata",proupload.array("image"),productControllers.addProductdata);
admin_routers.get("/productEdit",adminauth.isLogin,productControllers.editProduct);
admin_routers.post("/updateProductdata",productControllers.updateProduct);
admin_routers.get("/productDelete",adminauth.isLogin,productControllers.productDelete);

//Order amanagement
admin_routers.get("/ordermanagement",adminauth.isLogin,adminControllers.ordermanagement);
admin_routers.get("/orderdetails",adminauth.isLogin,adminControllers.orderdetails);
admin_routers.post("/orderstatus",adminauth.isLogin,adminControllers.orderstatus);

admin_routers.use("/*", adminauth.isLogin,(req, res) => {
  res.redirect("/admin");
});

module.exports = admin_routers;
