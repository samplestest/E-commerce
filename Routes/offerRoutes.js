"use strict"

const { OfferController: Controller } = require("../Controllers");
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const Joi = require("joi")

module.exports = [
    //add Edit Offer
    {
        method: "POST",
        path: "/admin/offer",
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.addEditOffer(request.payload)
                    )
                } catch (err) {
                    console.log(err);
                    return UniversalFunctions.sendError(err)
                }
            },
            description: "Add Edit Offer",
            auth: "AdminAuth",
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    name: Joi.string().required(),
                    discountType: Joi.string().valid("PERCENTAGE", "AMOUNT").required(),
                    discountCodeMethod: Joi.string().valid("CODE", "AUTOMATIC").required(),
                    discoutnCode: Joi.string().required(),
                    minimumPurchaseAmount: Joi.number().required(),
                    discountValue: Joi.number().required(),
                    numberofPurchase: Joi.number(),
                    limitofPurchaseUser: Joi.number(),
                    startDate: Joi.date().iso(),
                    endDate: Joi.date().iso(),
                    offerId: Joi.string()
                }),
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    //Fetch Offer
    {
        method: "GET",
        path: "/admin/offer",
        config: {
            handler: async function (request, h) {
                try {
                    const userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.fetchOffer(request.query, userData)
                    )
                } catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e);
                }
            },
            description: "Fetch Offer List",
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
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    }
]