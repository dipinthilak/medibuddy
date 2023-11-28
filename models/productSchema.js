const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

    productName: {
        type: String,
        required: true
    },
    brandName: {
        type: String
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    regularPrice: {
        type: Number,
        required: true
    },
    salePrice: {
        type: Number,
        required: true
    },
    offerName:{
        type:String,
        default:""
    },
    offerType:{
        type:String,
        default:""
    },
    offerPerc:{
        type:Number
    },
    offerPrice:{
        type:Number,
        default:Infinity 
    },
    quantity:{
        type: Number
    },
    isListed: {
        type: Boolean,
        required: true,
        default: true
    },
    image: {
        type: Array
    }
    
})

    
module.exports = mongoose.model('Product',productSchema)