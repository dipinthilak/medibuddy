const mongoose = require('mongoose');
const moment = require('moment-timezone');


const orderSchema = new mongoose.Schema({
    
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'

    },
    products: [{
        productId: {
            type : mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: Number,
        price: Number,
    }],

    paymentMethod :{
        type: String
                    },
    paymentStatus: {
        type : String,
        default: "PENDING"
    },
    paymentDetails:{
        type: Object,
        default : 'COD'
    },
    shippingMethod: {
        type : String,
        default: "Post Mail Courier"
    },
    shippingCost: {
        type : Number,
        default: 0
    },
    totalItems : Number,
    totalAmount : Number,   

    discount: {
		type: Number,
		default: 0,
	},

    coupon: {
        type: String,
        default: 'no coupon'
    },
    
    shippingAddress : {},

    orderStatus: {
        type : String,
        default: "PENDING"
    },
    createdAt: {
        type: Date,
        default: () => moment.tz(Date.now(), "Asia/Kolkata")
    },
    updatedAt:{
        type: Date,
        default: () => moment.tz(Date.now(), "Asia/Kolkata")
    },
    deliveredOn:{
        type: Date
    },
    returnReason:{
        type: String
    }


});

module.exports = mongoose.model('Order',orderSchema);