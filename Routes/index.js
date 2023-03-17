"use strict";

const userRoutes = require("./userRoutes");
const categoryRoutes = require("./categoryRoutes");
const productRoutes = require("./productRoutes");
const addressRoutes = require("./addressRoutes");
const orderRoutes = require("./orderRoutes");
const cartRoutes = require("./cartRoutes");
const subcategoryRoutes = require("./subcategoryRoutes");
const specificcategoryRoutes = require("./specificcategoryRoutes");
const wishlistRoutes = require("./wishlistRoutes");
const adminRoutes = require("./adminRoutes");
const vendorRoutes = require("./vendorRoutes");
const brandRoutes = require("./brandRoutes");
const offerRoutes = require("./offerRoutes");
const couponRoutes = require("./couponRoutes");
const reviewRoutes = require("./reviewRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const subadminRoutes = require('./subadmin');

const all = [].concat(userRoutes, categoryRoutes, productRoutes, addressRoutes, orderRoutes, cartRoutes, subcategoryRoutes, specificcategoryRoutes, wishlistRoutes, adminRoutes, vendorRoutes, brandRoutes, offerRoutes, couponRoutes, reviewRoutes, dashboardRoutes, subadminRoutes);

module.exports = all;
