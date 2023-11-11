const mongoose = require("mongoose");
const moment = require('moment-timezone');

const addressSchema = new mongoose.Schema({
    name: {
      type: String
    },
    addressLine1: {
      type: String
    },
    addressLine2: {
      type: String
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    pinCode: {
      type: String
    },
    phone: {
      type: String
    },
    email: {
      type: String
    },
    addressType: {
      type: String
    }
  });
  

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isActive:{
        type: Boolean,
        default: true
    },   
    cart : 
    [{ productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product',} ,
       quantity: Number,  
      }],
    wishlist:
    [{productId:{type :mongoose.Schema.Types.ObjectId, ref:'Product',}
      }],
  
   address: [addressSchema],
   wallet: [{
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'order'
    },
    transactionType: String,
    amount: Number,
    remarks: String,
    createdOn: {
      type: Date,
      default: () => moment.tz(Date.now(), "Asia/Kolkata")
    }

 }],

})

    
module.exports = mongoose.model('User',userSchema)