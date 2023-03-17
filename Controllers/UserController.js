"use strict"

const Service = require("../Services").queries;
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const TokenManager = require("../Lib/TokenManager");
const mongoose = require("mongoose");
const Model = require("../Models");
const CodeGenerator = require("../Lib/CodeGenerator");
const emailFunction = require("../Lib/email");
const { payload } = require("@hapi/hapi/lib/validation");
const reader = require("xlsx");
const generator = require("generate-password");
//craete User
async function craeteUser(payloadData) {
    try {
        let data = {
            first_name: payloadData.first_name,
            last_name: payloadData.last_name,
            email: payloadData.email,
            image: payloadData.image
        }
        data.password = await UniversalFunctions.CryptData(payloadData.password)
        let exit = await Service.findOne(Model.User, { email: payloadData.email });
        if (exit) {
            let update = await Service.findAndUpdate(Model.User, { _id: exit._id }, data);
            let tokenData = await TokenManager.setToken({
                _id: update._id,
                type: Config.APP_CONSTANTS.DATABASE.USER_TYPE.USER
            });
            update.accessToken = tokenData.accessToken;
            console.log("Update:" + update);
            return update;
        } else {
            let user = await Service.saveData(Model.User, data);
            let tokenData = await TokenManager.setToken({
                _id: user._id,
                type: Config.APP_CONSTANTS.DATABASE.USER_TYPE.USER
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

//User Login
async function userLogin(payloadData) {
    try {
        let user = await Service.findOne(Model.User, { email: payloadData.email });
        if (!user) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND);
        }
        if (!(await UniversalFunctions.comparePassword(payloadData.password.toString(), user.password))) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_PASSWORD
                // UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR
                //     .INVALID_PASSWORD
            );
        }
        else {
            let tokenData = await TokenManager.setToken(
                {
                    _id: user._id,
                    type: Config.APP_CONSTANTS.DATABASE.USER_TYPE.USER,
                },
            );
            user.accessToken = tokenData.accessToken;
            user = JSON.parse(JSON.stringify(user));
            delete user.password
            return user;
        }

    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//Forgot Password
async function forgotPassword(payloadData, userData) {
    try {
        let criteria = false;
        if (payloadData.email) {
            criteria = { email: payloadData.email };
        }
        let user = await Service.findOne(Model.User, criteria, {}, { lean: true });
        if (!user)
            return Promise.reject(
                Config.APP_CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND
            );
        const verificationCode = await CodeGenerator.generateCode(6, "numeric");
        console.log("Code:" + verificationCode);
        let otpData = {
            code: verificationCode,
            type: Config.APP_CONSTANTS.DATABASE.OTP_TYPE.FORGOT_PASSWORD,
            addedBy: user._id
        };
        if (payloadData.email) {
            otpData.email = payloadData.email;
            const body = Config.APP_CONSTANTS.SERVER.otpEmail.body.replace(
                "{otp}",
                verificationCode
            );
            // emailFunction.sendMail();
            emailFunction.sendMail(
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
    }
    catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//verify otp
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
    }
    catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//Change Password
async function changePassword(payloadData) {
    try {
        const { email, password, code } = payloadData;
        let otpObj = await Service.findAndUpdate(Model.Otp,
            { email: email, password: password, code: code },
            { lean: true }
        );
        if (!otpObj) return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_OTP);
        const user = await Service.findAndUpdate(
            Model.User,
            { email: email },
            {
                $set: {
                    password: await UniversalFunctions.CryptData(password),
                },
            },
            { lean: true, new: true }
        );
        if (user) {
            const tokenData = await TokenManager.setToken({
                _id: user._id,
                type: Config.APP_CONSTANTS.DATABASE.USER_TYPE.USER
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

//Fetch  User
async function fetchUser(queryData, userData) {
    try {
        const { skip = 1, limit = 1, page = 1 } = queryData;
        let query = { isDeleted: false };
        let projection = { isDeleted: 0, accessToken: 0 };
        let options = { sort: { _id: -1 } };
        if (typeof skip !== "undefined" && typeof limit !== "undefined") {
            options = { skip: ((page - 1) * limit), limit: limit * 1 };
        }
        let data = await Service.getData(Model.User, query, projection, options)
        let total = await Service.count(Model.User, query)
        return {
            userData: data,
            total: total
        }

    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}
//import Xlxl
async function importXlxl(payloadData) {
    try {
        const file = reader.readFile(payloadData.file.path)
        console.log("fileData:", file);
        let data = []
        const sheets = file.SheetNames
        for (let i = 0; i < sheets.length; i++) {
            const temp = reader.utils.sheet_to_json(
                file.Sheets[file.SheetNames[i]])
            temp.forEach((res) => {
                data.push(res)
            })
        }
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            // if (await Service.findOne(Model.User, { email: element.email })) {
            //     return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_ALREADY_EXIT);
            // }
            // if (await Service.findOne(Model.User, { mobile: element.mobile })) {
            //     return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.PHONE_ALREADY_EXIT);
            // }
            let password = await generatePassword()
            element.password = await UniversalFunctions.CryptData(password)
            const user = await Service.saveData(Model.User, element)
            if (user) {
                const body = `<b>Welcome, ${element.firstName + element.lastName}</b><p>Here's your login information:  </p>
            <p><b>email: </b>${element.email}</p>
            <p><b>password: </b>${password}</p>`
                emailFunction.sendMail(
                    element.email,
                    Config.APP_CONSTANTS.SERVER.Login.subject,
                    body,
                    []
                );
            }
        }
        return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED;
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}

//generate Password
async function generatePassword() {
    let password = generator.generate({
        length: 8,
        numbers: true
    });
    return password
}

//Export X1xl
async function getX1xlExport() {
    try {
        let query = { isDeleted: false };
        let projection = { _id: 0, email: 1, password: 1, role: 1 };
        let options = { sort: { _id: -1 } }
        const user = await Service.getData(Model.User, query, projection, options)
        return user
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}

module.exports = {
    craeteUser,
    userLogin,
    forgotPassword,
    verifyOTP,
    changePassword,
    fileUpload,
    fetchUser,
    importXlxl,
    getX1xlExport
}