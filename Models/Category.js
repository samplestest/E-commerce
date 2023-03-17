const { array } = require("joi");
let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let Categorys = new Schema({
    name: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    images: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    parentCategortId: {
        type: Array,
        default: null
    },
    childCategoryId: {
        type: Array,
        default: null
    }
}, {
    timestamps: true
});
module.exports = mongoose.model('categroys', Categorys);