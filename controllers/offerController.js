const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");

const loadOffermanagement=async (req,res)=>{
    res.render("offerManagement");
    };

    const loadpaddOffer=async (req,res)=>{
    try {
        console.log(req.query.pid);
        const pid=req.query.pid;
        res.render("addpOffer",{pid:pid});        
    } catch (error) {
        console.log(error);        
    }
    };

    const paddOffer= async (req,res)=>{
        try 
        {
        console.log(req.body);
        const pdetails=await Product.findById(req.body.product_id);
        const offerPrice=pdetails.regularPrice-(pdetails.regularPrice/100)*req.body.discount;
        console.log(pdetails.regularPrice+"<><><>"+offerPrice);
        const po=await Product.findByIdAndUpdate({_id:req.body.product_id},{$set:{offerType:'prod',offerPerc:req.body.discount,offerPrice:offerPrice}})
            if(po)
            {
                res.redirect('/admin/productmanagement');
            }
            else{
                res.redirect('/admin/productOffer',{pid:req.body.product_id});
            }
        } catch (error) {
        console.log(error);                    
        }
    }

    const deleteOffer=async (req,res)=>{
        try {
        console.log(req.query);
        const offerdele= await Product.findByIdAndUpdate({_id:req.query.pid},{$set:{offerType:"",offerPerc:"",offerPrice:""}});
        if(offerdele)
        {
            res.redirect('/admin/productmanagement');
        }
        else{            
            res.redirect('/admin/productmanagement');

        }                      
            
        } catch (error) {
            console.log(error);
        }
    };

    const loadcatOffer=async (req,res)=>{
        try {        
            console.log(req.query.cid);
            const cid=req.query.cid;
            res.render("addOffer",{cid:cid}); 
        } catch (error) {
            console.log(error);
        }
    };


    
    const caddOffer= async (req,res)=>{
        try 
        {
        console.log(req.body);
        const discount = parseFloat(req.body.discount);
        const category=await Category.findById(req.body.cat_id);
        console.log(category.name);  
       const co =await Product.updateMany(
            {category:category.name},
            [
              {
                $set: {
                offerType:'cat',
                offerPerc:discount,
                offerPrice: {
                    $multiply: [
                      '$regularPrice',
                      { $subtract: [1, { $divide: [discount, 100] }] },
                    ],
                  },
                },
              },
            ]);
            if(co)
            {
                res.redirect("/admin/categorymanagement");
            }
            else{
                res.redirect('/admin/catOffer',{cid:req.body.cat_id});
            }
        } catch (error) {
        console.log(error);                    
        }
    }


module.exports={
    loadOffermanagement,
    loadpaddOffer,
    paddOffer,
    deleteOffer,
    loadcatOffer,
    caddOffer
}