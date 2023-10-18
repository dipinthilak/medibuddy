const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");

const loadproductManagement = async (req, res) => {
    const productOut = await Product.find();
    res.render("adminProductmanagement", { products: productOut });
  };

const addProduct=async (req,res)=>{
    try{
    const categorydata=await Category.find({},{name:1});
    for (var i = 0; i < categorydata.length; i++) { 
       console.log(categorydata[i].name);
  }
    res.render("adminProductadd",{categorydata:categorydata})
  }
  catch(er)
  {
    console.error(er);
  }
  };

const addProductdata=async(req,res)=>{
      try {
          const fileNames = req.files.map(file => file.filename);    
          let product = new Product({
              productName : req.body.productname,
              brandName : req.body.productbrand,
              category: req.body.productcategory,
              description: req.body.description,
              regularPrice: req.body.productprice,
              salePrice: req.body.saleprice,
              quantity: req.body.productquantity,
              image: fileNames
              })
              console.log(product);
              productres = await product.save();
              if(productres){
                res.redirect('/admin/productmanagement')
              }
              res.redirect('/admin/productmanagement',{}) 
      } catch (error) {
          console.log(error.message);
      }
  };

const editProduct=async(req,res)=>
  { const productId =req.query.pid;
    // console.log(productId);
    try{
      const categorydata=await Category.find({},{name:1});
      const productdata=await Product.find({_id:productId});
      console.log(productdata);
      res.render("adminProductedit",{productdata:productdata,categorydata:categorydata});

    }
    catch(er)
    {
      console.error(er);
    }

  };

const productDelete=async(req,res)=>
  { const productId =req.query.pid;
    console.log(productId);
    try{
      const productdata=await Product.findByIdAndUpdate({_id:productId},{isListed:false});
      res.redirect('/admin/productmanagement');

    }
    catch(er)
    {
      console.error(er);
    }

  };

const updateProduct=async(req,res)=>{
    try {
      const productId =req.query.pid;
      let newproductdata = {
        productName : req.body.productname,
        brandName : req.body.productbrand,
        category: req.body.productcategory,
        description: req.body.description,
        regularPrice: req.body.productprice,
        salePrice: req.body.saleprice,
        quantity: req.body.productquantity
          }
          // console.log(pres);9
          const productUpdateres=await Product.findOneAndUpdate({_id:productId},newproductdata);

          if(productUpdateres){
            console.log("product updated");
            res.redirect('/admin/productmanagement')

          }
          else{
            console.log("product not updated");
            res.redirect('/admin/productmanagement',{})
          }

      
  } catch (error) {
      console.log(error.message);
  }    
  };
  module.exports={
    loadproductManagement,
    addProduct,
    addProductdata,
    editProduct,
    updateProduct,
    productDelete,
  }