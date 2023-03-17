"use strict"

const Service = require("../Services").queries;
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const TokenManager = require("../Lib/TokenManager");
const mongoose = require("mongoose");
const Model = require("../Models");
const CodeGenerator = require("../Lib/CodeGenerator");
const emailFunction = require("../Lib/email");

//Create admin
async function createAdmin(payloadData) {
    try {
        let data = {
            fullName: payloadData.name,
            email: payloadData.email,
            role: payloadData.role,
            // deviceToken: payloadData.deviceToken
        }
        data.role = "ADMIN"
        data.password = await UniversalFunctions.CryptData(payloadData.password)
        let exit = await Service.findOne(Model.Admin, { email: payloadData.email, mobile: payloadData.mobile });
        if (exit) {
            let update = await Service.findAndUpdate(Model.Admin, { _id: exit._id }, data);
            let tokenData = await TokenManager.setToken({
                _id: update._id,
                type: Config.APP_CONSTANTS.DATABASE.USER_TYPE.ADMIN
            });
            update.accessToken = tokenData.accessToken;
            return update;
        } else {
            let user = await Service.saveData(Model.Admin, data);
            let tokenData = await TokenManager.setToken({
                _id: user._id,
                type: Config.APP_CONSTANTS.DATABASE.USER_TYPE.ADMIN
            });
            user.accessToken = tokenData.accessToken;
            console.log("User:" + user);
            return user;
        }
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}


//login admin
async function adminLogin(payloadData) {
    try {
        let admin = await Service.findOne(Model.Admin, { email: payloadData.email });
        if (!admin) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.ADMIN_NOT_FOUND);
        }
        if (!(await UniversalFunctions.comparePassword(payloadData.password.toString(), admin.password))) {
            return Promise.reject(
                // UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR
                //     .INVALID_PASSWORD
                Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_PASSWORD
            );
        }
        else {
            let tokenData = await TokenManager.setToken(
                {
                    _id: admin._id,
                    type: Config.APP_CONSTANTS.DATABASE.USER_TYPE.ADMIN,
                },
            );
            admin.accessToken = tokenData.accessToken;
            admin = JSON.parse(JSON.stringify(admin));
            delete admin.password
            return admin;
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
        let admin = await Service.findOne(Model.Admin, criteria, {}, { lean: true });
        if (!admin)
            return Promise.reject(
                Config.APP_CONSTANTS.STATUS_MSG.ERROR.ADMIN_NOT_FOUND
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
            emailFunction.sendEmail(
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
        const { code, email } = payloadData;
        const data = await Service.findOne(Model.Otp, {
            email: email,
            code: code,
            type: Config.APP_CONSTANTS.DATABASE.OTP_TYPE.FORGOT_PASSWORD,
        });
        if (!data) return { valid: false };
        return { valid: true };
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//change password
async function changePassword(payloadData) {
    try {
        const {
            // STATUS_MSG: {
            //     SUCCESS: { UPDATED },
            //     ERROR: { IMP_ERROR, INVALID_OTP },
            // },
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
//file upload
async function fileUpload(payloadData) {
    try {
        let file = await UniversalFunctions.uploadImage(
            payloadData.file
        );
        return file
    }
    catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}


//Add Edit SubAdmin
async function addEditSubAdmin(payloadData, userData) {
    try {
        payloadData.addedBy = userData._id;
        payloadData.role = "SUBADMIN";

        if (payloadData.subadminId) {
            let subAdmin = await Service.findAndUpdate(Model.Admin, { _id: payloadData.subadminId }, payloadData, { new: true, lean: true })

            if (subAdmin !== null)
                return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED;
            else
                return Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST;
        } else {

            payloadData.password = await UniversalFunctions.CryptData(payloadData.password);
            let subAdmin = await Service.saveData(Model.Admin, payloadData, { new: true, lean: true })
            if (subAdmin !== null)
                return subAdmin
            else
                return Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR
        }
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}

//Fetch Sub Admin
async function fetchSubAdmin(queryData) {
    try {
        const { skip = 1, limit = 1, page = 1 } = queryData;
        let query = { isDeleted: false }
        let projection = { isDelete: 0, accessToken: 0 }
        let option = { sort: { _id: -1 } }
        let find = await Service.getData(Model.Admin, query, projection, option)
        return find
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}

//Blocked Sub Admin Stutas 
async function blockSubAdminStutas(paramsData) {
    try {
        let find = await Service.findOne(Model.Admin, { _id: paramsData.subadminId }, { new: true, lean: true })
        if (!find)
            return Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST
        let isBlocked
        if (find.isBlocked)
            isBlocked = false
        else
            isBlocked = true

        let data = await Service.findAndUpdate(Model.Admin, { _id: paramsData.subadminId }, { isBlocked: isBlocked }, { new: true, lean: true })
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
        if (isBlocked)
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.SUBADMIN_BLOCKED
        else
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.SUBADMIN_UNBLOCKED
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}

module.exports = {
    createAdmin,
    adminLogin,
    forgotPassword,
    verifyOTP,
    changePassword,
    fileUpload,
    addEditSubAdmin,
    fetchSubAdmin,
    blockSubAdminStutas
}