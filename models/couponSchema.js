const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({

    couponName: {
        type: String,
        required: true
    },
    discount: {
        type: String,
        required: true
    },
    isListed: {
        type: String,
        required: true
    },
    minAmt: {
        type: String,
        required: true
    },
    maxDiscount: {
        type: String,
        required: true
    },
    users: {
        type: Array
    }
})

module.exports = mongoose.model('Coupon',couponSchema)