const CONFIG = require("../Config/appConstants");
const randomString = require("randomstring");
const fs = require('fs');
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const UploadMultipart = require("../Lib/UploadMultipart");
const saltRounds = 10;

const sendSuccess = function (successMsg, data) {
    successMsg =
        successMsg || CONFIG.DEFAULT;
    if (
        typeof successMsg === "object" &&
        successMsg.hasOwnProperty("statusCode") &&
        successMsg.hasOwnProperty("customMessage")
    ) {
        return {
            statusCode: successMsg.statusCode,
            message: successMsg.customMessage,
            data: data || null,
        };
    } else {
        return {
            statusCode: 200,
            message: successMsg,
            data: data || null,
        };
    }
};

const sendError = function (data) {
    try {
        if (
            typeof data === "object" &&
            data.hasOwnProperty("statusCode") &&
            data.hasOwnProperty("customMessage")
        ) {
            let errorToSend = Boom.create(data.statusCode, data.customMessage);
            errorToSend.output.payload.responseType = data.type;
            return errorToSend;
        } else {
            let errorToSend = "";
            if (typeof data === "object") {
                if (data.name === "MongoError") {
                    errorToSend +=
                        CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DB_ERROR.customMessage;
                    if (data.code === 11000) {
                        let duplicateValue =
                            data.errmsg &&
                            data.errmsg.substr(data.errmsg.lastIndexOf('{ : "') + 5);
                        duplicateValue = duplicateValue.replace("}", "");
                        errorToSend +=
                            CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage +
                            " : " +
                            duplicateValue;
                        //console.log("==================errorToSend==================",data.message)
                        if (data.message.indexOf("email_1") > -1) {
                            errorToSend =
                                CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE_EMAIL
                                    .customMessage;
                        }
                    }
                } else if (data.name === "ApplicationError") {
                    errorToSend +=
                        CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.APP_ERROR.customMessage +
                        " : ";
                } else if (data.name === "ValidationError") {
                    errorToSend +=
                        CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.APP_ERROR.customMessage +
                        data.message;
                } else if (data.name === "CastError") {
                    errorToSend +=
                        CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DB_ERROR.customMessage +
                        CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID.customMessage +
                        data.value;
                }
            } else {
                errorToSend = data;
            }
            let customErrorMessage = errorToSend;
            if (typeof customErrorMessage === "string") {
                if (errorToSend.indexOf("[") > -1) {
                    customErrorMessage = errorToSend.substr(errorToSend.indexOf("["));
                }
                customErrorMessage =
                    customErrorMessage && customErrorMessage.replace(/"/g, "");
                customErrorMessage =
                    customErrorMessage && customErrorMessage.replace("[", "");
                customErrorMessage =
                    customErrorMessage && customErrorMessage.replace("]", "");
            }
            return Boom.create(400, customErrorMessage);
        }
    } catch (e) { }
};

async function CryptData(stringToCrypt) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(stringToCrypt, saltRounds, function (err, hash) {
            if (err) reject(err);
            else resolve(hash);
        });
    });
}

async function comparePassword(data, hash) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(data, hash, function (err, res) {
            if (err) reject(err);
            else resolve(res);
        });
    });
}

const generateMd5Password = function () {
    return randomString.generate(5);
};

const generateCode = function () {
    return randomString.generate(10);
};

const authorizationHeaderObj = Joi.object({
    authorization: Joi.string().required(),
}).unknown();

const failActionFunction = function (request, h, error) {
    console.log(
        ".............fail action.................",
        error.output.payload.message
    );
    let customErrorMessage = "";
    if (error.output.payload.message.indexOf("[") > -1) {
        customErrorMessage = error.output.payload.message.substr(
            error.output.payload.message.indexOf("[")
        );
    } else {
        customErrorMessage = error.output.payload.message;
    }
    customErrorMessage = customErrorMessage.replace(/"/g, "");
    customErrorMessage = customErrorMessage.replace("[", "");
    customErrorMessage = customErrorMessage.replace("]", "");
    error.output.payload.message = customErrorMessage;
    delete error.output.payload.validation;
    return error;
};

async function uploadImage(image) {
    console.log('---------- inside upload image ---------------')
    if (Array.isArray(image)) {
        return new Promise((resolve, reject) => {
            let imageData = [], len = image.length, count = 0;
            image.map((obj) => {
                UploadMultipart.S3Upload(obj, (err, result) => {
                    count++;
                    imageData.push(result);
                    if (count === len)
                        resolve(imageData)
                })
            })
        });
    } else {
        return new Promise((resolve, reject) => {
            UploadMultipart.S3Upload(image, (err, result) => {
                if (err) reject(err);
                else resolve(result)
            })
        });
    }
}

//upload file in s3
// let Path = require("path");
// const AWS = require('aws-sdk');
// AWS.config.update({
//     accessKeyId: 'AKIAWN3UIYHICHPAUDFU',
//     secretAccessKey: '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',
//     //  region:' '
// });
// var s3 = new AWS.S3();
// async function uploadImage(req, fileName, key) {
//     // let response = s3.upload({
//     //     Bucket: 'surbhi-infotech',
//     //     Key: fileName,
//     //     // Body: req.files[key].data,
//     //     // ContentType: req.files[key].mimetype,
//     //     ACL: 'public-read'
//     // }).promise()
//     // return response.then(data => {
//     //     return { status: true, data }
//     // }).catch(err => {
//     //     return { status: false, err }
//     // })
// }


module.exports = {
    sendSuccess: sendSuccess,
    generateMd5Password: generateMd5Password,
    failActionFunction: failActionFunction,
    sendError: sendError,
    uploadImage: uploadImage,
    generateCode: generateCode,
    CryptData: CryptData,
    comparePassword: comparePassword
}
