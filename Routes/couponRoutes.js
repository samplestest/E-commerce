"use strict"

const { CouponController: Controller } = require("../Controllers");
const Config = require("../Config");
const UniversalFunctions = require("../Utils/UniversalFunction");
const Joi = require('joi')

module.exports = [
    //Add Edit coupon
    {
        method: "POST",
        path: "/admin/createcoupon",
        config: {
            handler: async function (request, h) {
                let userData =
                    request.auth &&
                    request.auth.credentials &&
                    request.auth.credentials.userData;
                try {
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.addEditCoupon(request.payload, userData)
                    )
                } catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e);
                }
            },
            description: "Add Edit Coupon API",
            auth: "AdminAuth",
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    discountCode: Joi.string().trim().required(),
                    discountValue: Joi.number().required(),
                    limitofPurchaseUser: Joi.number().required(),
                    couponId: Joi.string().trim()
                }),
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-sawgger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    //Fetch coupon
    {
        method: "GET",
        path: "/admin/fetchcoupon",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.fetchcoupon(request.query)
                    )
                } catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e);
                }
            },
            description: "Fetch Coupon API",
            auth: "AdminAuth",
            tags: ['api'],
            validate: {
                query: Joi.object({
                    skip: Joi.number(),
                    limit: Joi.number(),
                    page: Joi.number()
                }),
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-sawgger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    }
]