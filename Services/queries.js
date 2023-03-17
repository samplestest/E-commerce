'use strict';

const { resolve } = require("path");

//saveData
let saveData = function (model, data) {
    return new Promise((resolve, reject) => {
        new model(data).save((err, result) => {
            if (err) reject(err);
            else resolve(result)
        })
    })
};

//get Data
let getData = function (model, query, projection, options) {
    return new Promise((resolve, reject) => {
        model.find(query, projection, options, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    })
};

//FindOne
let findOne = function (model, query, projection, options) {
    return new Promise((resolve, reject) => {
        model.findOne(query, projection, options, function (err, data) {
            if (err) reject(err);
            resolve(data);
        });
    })
};

//Find And Update
let findAndUpdate = function (model, conditions, update, options) {
    return new Promise((resolve, reject) => {
        model.findOneAndUpdate(conditions, update, options, function (error, result) {
            if (error) reject(error);
            else resolve(result)
        })
    });
};


//remove
let remove = function (model, condition) {
    return new Promise((resolve, reject) => {
        model.deleteOne(condition, function (err, result) {
            if (err) reject(err);
            else resolve(result)
        });
    })
};

//Find With populate
let populateData = function (model, query, projection, options, collectionOptions) {
    return new Promise((resolve, reject) => {
        model.find(query, projection, options).populate(collectionOptions).exec(function (err, result) {
            if (err) reject(err);
            else resolve(result)
        })
    });
}


//Find One With Reference
let findOnePopulateData = function (model, query, projection, options, collectionOptions) {
    return new Promise((resolve, reject) => {
        model.findOne(query, projection, options).populate(collectionOptions).exec(function (err, result) {
            if (err) reject(err);
            else resolve(result)
        });
    });
};

//Count
let count = function (model, condition) {
    return new Promise((resolve, reject) => {
        model.countDocuments(condition, function (err, result) {
            if (err) reject(err);
            else resolve(result)
        })
    })
};
module.exports = {
    saveData: saveData,
    findOne: findOne,
    findAndUpdate: findAndUpdate,
    populateData: populateData,
    findOnePopulateData: findOnePopulateData,
    remove: remove,
    count: count,
    getData: getData
}