"use strict"

const { SubCategoryController: Controller } = require("../Controllers");
const UniversalFunctions = require("../Utils/UniversalFunction");
const Joi = require('joi');
const Config = require('../Config');

module.exports = [
    //Add Edit SubCategory
    {
        method: "POST",
        path: "/user/subcategory",
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.addEditSubCategory(request.payload)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e)
                }
            },
            description: "SubCategory API",
            tags: ['api', 'user'],
            validate: {
                payload: Joi.object({
                    name: Joi.string().trim().required(),
                    images: Joi.string().trim().required(),
                    parentCategortId: Joi.array(),
                    categoryId: Joi.string().trim(),
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
    //Remove SubCategory
    {
        method: "POST",
        path: "/user/subcategoryItem",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.removeSubCategory(request.payload)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "delete SubCategory ",
            auth: "UserAuth",
            tags: ['api', 'user'],
            validate: {
                payload: Joi.object({
                    categoryId: Joi.string().trim().required(),
                    parentCategortId: Joi.string().trim().required(),
                }),
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages,
                },
            },
        }
    }
]