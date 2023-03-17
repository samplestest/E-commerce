"usr strict"

const { ReviewController: Controller } = require("../Controllers");
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const Joi = require("joi");

module.exports = [
    //add Review
    {
        method: "POST",
        path: "/user/review",
        config: {
            handler: async function (request, h) {
                let userData =
                    request.auth &&
                    request.auth.credentials &&
                    request.auth.credentials.userData;
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.addReview(request.payload, userData)
                    )
                } catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e)
                }
            },
            description: "User Review API",
            auth: "UserAuth",
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    productId: Joi.string().trim().required(),
                    review: Joi.string().trim().required(),
                    rating: Joi.number().required()
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
    //Fetch Review
    {
        method: "GET",
        path: "/user/reviewList",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.fetchReview(request.query)
                    )
                } catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e)
                }
            },
            description: "User Review Fetch API",
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
    },
    //Delete Review
    {
        method: "POST",
        path: "/user/review/{reviewId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.deleteReview(request.params)
                    )
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Delete Review API",
            tags: ['api'],
            validate: {
                params: Joi.object({
                    reviewId: Joi.string().trim().required()
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