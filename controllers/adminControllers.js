const Admin = require("../models/adminSchema");
const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const Order = require("../models/orderSchema");
const path = require("path");
const Product=require("../models/productSchema")
const Category=require("../models/categorySchema")
const { render } = require("../routers/user_Routers");

const loadLogin = (req, res) => {
  if (req.query.credential) {
    const crerror = true;
    res.render("adminLogin", { crerror });
  }
  const crerror = false;
  res.render("adminLogin", { crerror });
};

const adminSignin = async (req, res) => {
  try {
    const email = req.body.email;
    if (req.body.email != null && req.body.password != null) {
      const adetails = await Admin.findOne({ email: email });
      if (adetails) {
        const passwordMatch = await bcrypt.compare(
          req.body.password,
          adetails.password
        );
        if (passwordMatch) {
          req.session.admin = adetails._id;
          res.redirect("/admin/adminDashboard");
        } else {
          res.redirect("/admin/?credential=wrong");
        }
      } else {
        res.redirect("/admin/?credential='wrong'");
      }
    } else {
      res.redirect("/admin/?credential='wrong'");
    }
  } catch (er) {
    console.log(er);
  }
};

const adminDashboard = async (req, res) => {
  try {
    console.log("Dashboard");
    const adminData = await Admin.find();

    const revenue = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);
    const totalRevenue = revenue[0].totalAmount.toLocaleString("en-IN");
    // counts for display
    const orderCount = await Order.count();
    const productCount = await Product.count();
    const categoryCount = await Category.count();
    const userCount = await User.count();
  
  
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            $lt: new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              1
            ),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);
  
  
    
    const mRevenue = monthlyRevenue[0]?.total.toLocaleString("en-IN") || 0 ;
  
  
    const monthlySales = await Order.aggregate([
      {
        $project: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);
  
    const graphDataSales = [];
  
    // Loop through the 12 months (1 to 12)
    for (let month = 1; month <= 12; month++) {
      const resultForMonth = monthlySales.find(
        (result) => result._id.month === month
      );
      if (resultForMonth) {
        graphDataSales.push(resultForMonth.totalOrders);
      } else {
        graphDataSales.push(0);
      }
    }
  
  
    const productCountData = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }, // Count the documents in each category
        },
      },
    ]);
  
    
  
      // console.log(productCountData);
      const categoryNames = productCountData.map((item) => item._id);
      const categoryCounts = productCountData.map((item) => item.count);
  
  
  
  
  
    res.render("adminDashboard",{  adminData: adminData,
        totalRevenue: totalRevenue,
        orderCount: orderCount,
        productCount: productCount,
        categoryCount: categoryCount,
        monthlyRevenue: mRevenue,
        graphDataSales: graphDataSales,
        categoryNames: categoryNames,
        categoryCounts: categoryCounts,
        userCount: userCount,});

  } catch (error) {
    console.log(error);
  }

};

const loadUsermanagement = async (req, res) => {
  const users = await User.find();
  // console.log(users);
  res.render("adminUseredit", { users: users });
};

const userstatusChange = async (req, res) => {
  try {
    const userid = req.body.userid;
    console.log(userid);
    const user = await User.findById({ _id: userid });
    if (user.isActive) {
      await User.findByIdAndUpdate(userid, { isActive: false });
      res.status(200).json({blocked:true});
    } else {
      await User.findByIdAndUpdate(userid, { isActive: true });
      res.status(200).json({unblocked:true});
    }
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

const ordermanagement = async (req, res) => {
  try {
    const order = await Order.find().sort({createdAt:1}).populate("customerId");
    res.render("adminOrderview", { order: order });
  } catch (error) {
    console.log(error);
  }
};

const orderdetails = async (req, res) => {
  try {
    const orderId = req.query.ordrid;
    const order = await Order.findById(orderId).populate("customerId");
    const product = await Order.findById(orderId).populate(
      "products.productId"
    );

    res.render("adminOrderdetails", { order: order, product: product });
  } catch (error) {
    console.log(error.message);
  }
};

const orderstatus = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.query.ordrid);
    const order = await Order.findById(req.query.ordrid);

    if (req.body.status == "DELIVERED") {
      if (order.paymentDetails == "COD") {
        const orderdata = await Order.findByIdAndUpdate(
          { _id: req.query.ordrid },
          { paymentStatus: "RECEIVED", orderStatus: "DELIVERED" }
        );
      } else if (order.paymentDetails == "razorpay" && order.paymentStatus == 'PENDING') {
        const orderdata = await Order.findByIdAndUpdate(
          { _id: req.query.ordrid },
          {paymentDetails:'COD', paymentStatus:'RECEIVED' ,orderStatus: "DELIVERED" }
        );
      }
      else if (order.paymentDetails == "razorpay" && order.paymentStatus == 'RECEIVED') {
        const orderdata = await Order.findByIdAndUpdate(
          { _id: req.query.ordrid },
          { orderStatus: "DELIVERED" }
        );
      }
    } else if (req.body.status == "PLACED") {
      if (order.paymentDetails == "COD") {
        const orderdata = await Order.findByIdAndUpdate(
          { _id: req.query.ordrid },
          { orderStatus: "PLACED" }
        );
      } else if (order.paymentDetails == "razorpay") {
        const orderdata = await Order.findByIdAndUpdate(
          { _id: req.query.ordrid },
          { orderStatus: "PLACED" }
        );
      }
    }
    res.redirect("/admin/ordermanagement");
  } catch (error) {
    console.log(error);
  }
};

const createreport = async (req, res) => {
  try {
    console.log("report processing");
    let orders = await Order.find().populate("products.productId");

    const PDFDocument = require("pdfkit");

    // Create a document with custom page size and margins
    const doc = new PDFDocument({ size: "letter", margin: 50 });

    // Pipe its output somewhere, like to a file or HTTP response
    // See below for browser usage
    doc.pipe(res);

    // Title
    doc.fontSize(20).text("Sales Report", { align: "center" });
    doc.moveDown(); // Move down to create space below the title

    // Define table headers
    const headers = [
      "Index",
      "Date",
      "Order Id",
      "Qnty",
      "Total",
      "Discount",
      "Final Price",
    ];
    // Calculate column widths
    const colWidths = [35, 90, 140, 50, 70, 70, 70];

    // Set initial position for drawing
    let x = 50;
    let y = doc.y;

    // Draw table headers
    headers.forEach((header, index) => {
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(header, x, y, { width: colWidths[index], align: "center" });
      x += colWidths[index];
    });

    // Draw table rows
    let currentPageY = y;
    orders.forEach((order, index) => {
      const total = order.totalAmount;
      const discount = order.discount;
      const orderId = "Odr-" + String(order._id).slice(4, 12);
      const date = String(order.createdAt).slice(4, 16);

      order.products.forEach((product) => {
        const quantity = product.quantity;
        const finalPrice = total - discount;
      // Create an array of row data with the Indian Rupee symbol and formatted prices
        const rowData = [
          index + 1,
          date,
          orderId,
          quantity,
          total, // Format total price
          discount, // Format discount
          finalPrice, // Format final price
        ];

        x = 50;
        currentPageY += 20;

        // Check if the current row will fit on the current page, if not, create a new page
        if (currentPageY + 20 > doc.page.height - 50) {
          doc.addPage(); // Create a new page
          currentPageY = 50; // Reset the current Y position
        }

        // Draw row data
        rowData.forEach((value, index) => {
          doc
            .font("Helvetica")
            .fontSize(12)
            .text(value.toString(), x, currentPageY, {
              width: colWidths[index],
              align: "center",
            });
          x += colWidths[index];
        });
      });
    });

    // Finalize PDF file
    doc.end();
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
  orderdetails,
  createreport,
  orderstatus,
};
