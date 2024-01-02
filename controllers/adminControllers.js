const Admin = require("../models/adminSchema");
const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const Order = require("../models/orderSchema");
const path = require("path");
const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const { render } = require("../routers/user_Routers");
const { assert } = require("console");
const PDFDocument = require('pdfkit');
const fs = require('fs');

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

    const mRevenue = monthlyRevenue[0]?.total.toLocaleString("en-IN") || 0;

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

    res.render("adminDashboard", {
      adminData: adminData,
      totalRevenue: totalRevenue,
      orderCount: orderCount,
      productCount: productCount,
      categoryCount: categoryCount,
      monthlyRevenue: mRevenue,
      graphDataSales: graphDataSales,
      categoryNames: categoryNames,
      categoryCounts: categoryCounts,
      userCount: userCount,
    });
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
      res.status(200).json({ blocked: true });
    } else {
      await User.findByIdAndUpdate(userid, { isActive: true });
      res.status(200).json({ unblocked: true });
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
    const PAGE_SIZE = 10; // Adjust the page size as needed
    const pageNumber = parseInt(req.query.pageNumber) ||1;
    console.log(pageNumber);


    const order = await Order.find()
  .sort({ createdAt: -1 })
  .populate('customerId')
  .skip((pageNumber - 1) * PAGE_SIZE)
  .limit(PAGE_SIZE);

  const ordercount=await Order.countDocuments();
  const pagecount =Math.ceil(ordercount/PAGE_SIZE);
    res.render("adminOrderview", { order: order,pagecount:pagecount,pageNumber:pageNumber});
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
    console.log(order);

    if (req.body.status == "DELIVERED") {
      if (order.paymentDetails == "COD") {
        const orderdata = await Order.findByIdAndUpdate(
          { _id: req.query.ordrid },
          { paymentStatus: "RECEIVED", orderStatus: "DELIVERED" }
        );
      } else if (
        order.paymentDetails == "razorpay" &&
        order.paymentStatus == "PENDING"
      ) {
        const orderdata = await Order.findByIdAndUpdate(
          { _id: req.query.ordrid },
          {
            paymentDetails: "COD",
            paymentStatus: "RECEIVED",
            orderStatus: "DELIVERED",
          }
        );
      } else if (
        order.paymentDetails == "razorpay" &&
        order.paymentStatus == "RECEIVED"
      ) {
        const orderdata = await Order.findByIdAndUpdate(
          { _id: req.query.ordrid },
          { orderStatus: "DELIVERED" }
        );
      } else if (
        order.paymentDetails == "WALLET" &&
        order.paymentStatus == "RECEIVED"
      ) {
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
      } else if (order.paymentDetails == "WALLET") {
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
  console.log("print pdf");
  let report;
  let selectedPeriod=req.session.period;
  console.log(selectedPeriod);
  if (selectedPeriod === "") {
    report = await Order.find().limit(15);
  } else if (selectedPeriod === "day") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    const query = {
      createdAt: {
        $gte: today,
        $lt: endOfDay,
      },
      paymentStatus: 'RECEIVED'
    };
    report = await Order.find(query);
  
    const numberOfDocuments = await Order.countDocuments(query);
    console.log("      ------------->>>" + numberOfDocuments);
  
  } else if (selectedPeriod === "week") {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    const query = {
      createdAt: {
        $gte: sevenDaysAgo,
        $lt: endOfDay,
      },
    };
  
    report = await Order.find(query);
    const numberOfDocuments = await Order.countDocuments(query);
    console.log("      ------------->>>" + numberOfDocuments);
  
  } else if (selectedPeriod === "month") {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const query = {
        createdAt: {
            $gte: thirtyDaysAgo,
            $lt: today,
        },
    };
  
    report = await Order.find(query);
    const numberOfDocuments = await Order.countDocuments(query);
    console.log("      ------------->>>" + numberOfDocuments);
  
  } else if (selectedPeriod === "3 month") {
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    threeMonthsAgo.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    const query = {
      createdAt: {
        $gte: threeMonthsAgo,
        $lt: endOfDay,
      },
      paymentStatus: 'RECEIVED'
    };
  
    report = await Order.find(query);
    const numberOfDocuments = await Order.countDocuments(query);
    console.log("      ------------->>>" + numberOfDocuments);
  }
  
  console.log(`order created within the period: ${selectedPeriod}`);

  
  // Generate PDF
  const pdfDoc = new PDFDocument({ size: "letter", margin: 50 });
  pdfDoc.pipe(res);
  pdfDoc.fontSize(20).text("Sales Report", { align: "center" });
  console.log("pdf creating");
  if(selectedPeriod==''){
    pdfDoc.text(`order created within the period: last 15 orders`);
  }
  else if(selectedPeriod=='today'){
    pdfDoc.text(`order created within the period: today`);
  }
  else if(selectedPeriod=='week'){
    pdfDoc.text(`order created within the period: one week`);
  }
  else if(selectedPeriod=='month'){
    pdfDoc.text(`order created within the period:  months`);
  }  
  else if(selectedPeriod=='3 month'){
    pdfDoc.text(`order created within the period: three months`);
  }
  pdfDoc.moveDown();

  const headers = [
    "Index",
    "Order Id",
    "Payment_mode",
    "Total",
    "Discount",
  ];
  const colWidths = [35, 160, 90, 100, 100];
  let x = 50;
  let y = pdfDoc.y;
    headers.forEach((header, index) => {
      pdfDoc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(header, x, y, { width: colWidths[index], align: "center" });
      x += colWidths[index];
    });
    let currentPageY = y;
    report.forEach((order, index) => {
      const total = order.totalAmount;
      const discount = order.discount;
      const Payment_mode=order.paymentDetails;
      const orderId = "#ord-" + String(order._id).slice(4, 12);
      const rowData = [
        index + 1,
        orderId,
        Payment_mode,
        total, // Format total price
        discount, // Format discount
      ];

      x = 50;
      currentPageY += 20;

      if (currentPageY + 20 > pdfDoc.page.height - 50) {
        pdfDoc.addPage(); // Create a new page
        currentPageY = 50; // Reset the current Y position
      }

      //draw row data

      rowData.forEach((value, index) => {
        pdfDoc
          .font("Helvetica")
          .fontSize(12)
          .text(value.toString(), x, currentPageY, {
            width: colWidths[index],
            align: "center",
          });
          x += colWidths[index];

    });
  });


  pdfDoc.end();
  
  // Assuming `client` refers to your MongoDB client, close the connection if needed.
  // client.close();
  

} catch (error) {
  
}
};

const reportview = async (req, res) => {
  try {
    console.log("report");
    const selectedPeriod = req.query.period || "";
    console.log(selectedPeriod);
    req.session.period=selectedPeriod;
    let report = [];
    if (selectedPeriod === "") {
      report = await Order.find().limit(15);
      console.log(report);

    } else if (selectedPeriod === "day") {

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      const query = {
        createdAt: {
          $gte: today,
          $lt: endOfDay,
        },
        paymentStatus: 'RECEIVED'
      };
      report = await Order.find(query);
      console.log(report);
      
      const numberOfDocuments = await Order.countDocuments(query);
      console.log("      ------------->>>"  + numberOfDocuments);


    } else if (selectedPeriod === "week") {

      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      const query = {
        createdAt: {
          $gte: sevenDaysAgo,
          $lt: endOfDay,
        },
      };


      report = await Order.find(query);
      console.log(report);
      const numberOfDocuments = await Order.countDocuments(query);
      console.log("      ------------->>>"  + numberOfDocuments);


    } else if (selectedPeriod === "month") {


      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const query = {
          createdAt: {
              $gte: thirtyDaysAgo,
              $lt: today,
          },
      };


      report = await Order.find(query);
      console.log(report);
      const numberOfDocuments = await Order.countDocuments(query);
      console.log("      ------------->>>"  + numberOfDocuments);


    } else if (selectedPeriod === "3 month") {


      const today = new Date();
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      threeMonthsAgo.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      const query = {
        createdAt: {
          $gte: threeMonthsAgo,
          $lt: endOfDay,
        },
        paymentStatus: 'RECEIVED'
      };
      
      report = await Order.find(query);
      console.log(report);
      const numberOfDocuments = await Order.countDocuments(query);
      console.log("      ------------->>>"  + numberOfDocuments);

    }

    res.render("adminReport.ejs",{report});
  } catch (error) {
    console.log(error);
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
  orderstatus,
  createreport,
  reportview,
};
