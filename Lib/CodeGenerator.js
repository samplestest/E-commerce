"use strict";

const Service = require('../Services');
const async = require('async');
let randomstring = require("randomstring");


exports.generateCode = async function (digits, charset = 'alphanumeric') {
    return randomstring.generate({
        length: digits,
        charset: charset
    }).toUpperCase();

}

