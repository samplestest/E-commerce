"use strict"

const Service = require("../Services").queries;
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const { required } = require("joi");
const Model = require("../Models");
const { payload } = require("@hapi/hapi/lib/validation");
const TokenManager = require("../Lib/TokenManager");
const EmailFunction = require("../Lib/email");

//vendor Register
async function vendorRegister(payloadData) {
    try {
        if (await Service.findOne(Model.User, { email: payloadData.email })) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_ALREADY_EXIT);
        }
        // if (await Service.findOne(Model.User, { mobile: payloadData.mobile })) {
        //     return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.PHONE_ALREADY_EXIT);
        // }
        if (await Service.findOne(Model.Vendor, { email: payloadData.email })) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_ALREADY_EXIT);
        }
        if (await Service.findOne(Model.Vendor, { mobile: payloadData.mobile })) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.PHONE_ALREADY_EXIT);
        }
        if (await Service.findOne(Model.Admin, { email: payloadData.email })) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_ALREADY_EXIT);
        }
        const password = await UniversalFunctions.CryptData(payloadData.password)
        payloadData.password = password;
        let vendor = await Service.saveData(Model.Vendor, payloadData)
        if (!vendor) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
        }
        vendor = JSON.parse(JSON.stringify(vendor));
        delete vendor.password
        return vendor
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}

//vendor Login
async function vendorLogin(payloadData) {
    try {
        let vendor = await Service.findOne(Model.Vendor, { email: payloadData.email })
        if (!vendor) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.VENDOR_NOT_EXIT);
        }
        if (!(await UniversalFunctions.comparePassword(payloadData.password.toString(), vendor.password))) {
            return Promise.reject(
                Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_PASSWORD
            );
        }
        else {
            let tokenData = await TokenManager.setToken(
                {
                    _id: vendor._id,
                    type: Config.APP_CONSTANTS.DATABASE.USER_TYPE.VENDOR,
                },
            );
            vendor.accessToken = tokenData.accessToken;
            vendor = JSON.parse(JSON.stringify(vendor));
            delete vendor.password
            return vendor;
        }
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//Forgot Password
async function forgotPassword(payloadData) {
    try {
        let criteria = false
        if (payloadData.email) {
            criteria = { email: payloadData.email };
        }
        let vendor = await Service.findOne(Model.Vendor, criteria, {}, { lean: true });
        if (!vendor)
            return Promise.reject(
                Config.APP_CONSTANTS.STATUS_MSG.ERROR.VENDOR_NOT_EXIT
            );
        const verificationCode = await CodeGenerator.generateCode(6, "numeric");
        console.log("VerificationCode:" + verificationCode);
        let otpData = {
            code: verificationCode,
            type: Config.APP_CONSTANTS.DATABASE.OTP_TYPE.FORGOT_PASSWORD,
        };
        console.log("otpData:" + otpData.code);
        console.log("optData:" + otpData.type);
        if (payloadData.email) {
            otpData.email = payloadData.email;
            const body = Config.APP_CONSTANTS.SERVER.otpEmail.body.replace(
                "{otp}",
                verificationCode
            );
            EmailFunction.sendEmail(
                payloadData.email,
                Config.APP_CONSTANTS.SERVER.otpEmail.subject,
                body,
                []
            );
        }
        let exit = await Service.findOne(Model.Otp, { email: payloadData.email });
        if (!exit)
            await Service.saveData(Model.Otp, otpData);
        else
            await Service.findAndUpdate(Model.Otp, { email: payloadData.email }, { code: verificationCode });
        return {
            statusCode: 200,
            customMessage: "OTP Sent on Email",
            type: "OTP_SENT_ON_EMAIL",
        };
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//verify Otp
async function verifyOTP(payloadData) {
    try {
        const { email, code } = payloadData;
        const data = await Service.findOne(Model.Otp, {
            email: email,
            code: code,
            type: Config.APP_CONSTANTS.DATABASE.OTP_TYPE.FORGOT_PASSWORD,
        });
        if (!data)
            return { valid: false };
        return { valid: true }

    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//change password
async function changePassword(payloadData) {
    try {
        const {
            DATABASE: {
                USER_TYPE: { ADMIN },
                OTP_TYPE: { FORGOT_PASSWORD },
            },
        } = Config.APP_CONSTANTS;
        const { email, code, password } = payloadData;
        let otpObj = await Service.findAndUpdate(
            Model.Otp,
            { email: email, code: code, type: FORGOT_PASSWORD },
            { lean: true }
        );
        if (!otpObj) return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_OTP);
        const admin = await Service.findAndUpdate(
            Model.Admin,
            { email: email },
            {
                $set: {
                    password: await UniversalFunctions.CryptData(password),
                },
            },
            { lean: true, new: true }
        );
        if (admin) {
            const tokenData = await TokenManager.setToken({
                _id: admin._id,
                type: ADMIN,
            });
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED;
        }
    }
    catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//Fetch Vendor
async function fetchVendor(queryData, userData) {
    try {
        const { skip = 1, limit = 1, page = 1 } = queryData;
        let query = { isDeleted: false }
        let options = { sort: { createdAt: -1 } };
        if (typeof skip !== "undefined" && typeof limit !== "undefined") {
            // aggregate.push({ $skip: skip }, { $limit: limit });
            options = { skip: ((page - 1) * limit), limit: limit * 1 };
        }

        let data = await Service.getData(Model.Vendor, { query }, {}, {})
        let total = await Service.count(Model.Vendor, query)
        return {
            vendorData: data,
            total: total
        }
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}

//Vendor Change Status
async function changeStatus(paramsData) {
    try {
        let find = await Service.findOne(Model.Vendor, { _id: paramsData.vendorId })
        if (!find)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST)
        let isPublished
        if (find.isPublished)
            isPublished = false
        else
            isPublished = true
        let data = await Service.findAndUpdate(Model.Vendor, { _id: paramsData.vendorId }, { isPublished: isPublished, isReject: false }, { new: true, lean: true })
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
        if (isPublished)
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.PUBLISHED
        else
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UNPUBLISHED

    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}

//Vendor Change Status Block
async function blockchangeStatus(paramsData) {
    try {
        let data = await Service.findAndUpdate(Model.Vendor, { _id: paramsData.vendorId }, { isBlocked: true }, { lean: true, new: true })
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
        return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.VENDOR_BLOCK
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}

//vendoe Reject
async function rejectVendor(payloadData) {
    try {
        let vendor = await Service.findAndUpdate(Model.Vendor, { _id: payloadData.vendorId, isDeleted: false }, {
            isReject: true,
            isPublished: true
        },
            {
                new: true
            })
        const body = Config.APP_CONSTANTS.SERVER.RejectEmail.body.replace(
            "{reason}",
            payloadData.reason
        );
        let email = EmailFunction.sendMail(
            vendor.email,
            Config.APP_CONSTANTS.SERVER.RejectEmail.subject,
            body,
            []
        );
        console.log("Email:" + email);
        return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}

module.exports = {
    vendorRegister,
    vendorLogin,
    forgotPassword,
    verifyOTP,
    changePassword,
    fetchVendor,
    changeStatus,
    blockchangeStatus,
    rejectVendor
}