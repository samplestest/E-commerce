"use strict"

const { SpecificCategoryController: Controller } = require("../Controllers");
const UniversalFunctions = require("../Utils/UniversalFunction");
const Joi = require('joi');
const Config = require("../Config");

module.exports = [
    //Add Edit Specific Category 
    {
        method: "POST",
        path: "/user/specificcategory",
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.addEditSpecificCategory(request.payload)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e)
                }
            },
            description: "Specific Category API",
            tags: ['api', 'user'],
            validate: {
                payload: Joi.object({
                    name: Joi.string().trim().required(),
                    parentCategortId: Joi.array(),
                    childCategoryId: Joi.array(),
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
    }
]