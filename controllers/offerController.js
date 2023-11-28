const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");

const loadOffermanagement=async (req,res)=>{
    res.render("offerManagement");
    };

    const loadaddOffer=async (req,res)=>{
    res.render("addOffer");
    };



module.exports={
    loadOffermanagement,
    loadaddOffer
}