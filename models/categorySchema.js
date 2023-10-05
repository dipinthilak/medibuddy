const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    filename: {
        type: String
    },
    isListed: {
        type: Boolean,
        required: true,
        default: true
    },
    
})

    
module.exports = mongoose.model('Category',categorySchema);