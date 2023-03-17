"use strict"

const Service = require("../Services").queries;
const { promises } = require("fs-extra");
const Config = require("../Config");
const Model = require("../Models");
const moment = require("moment");


//Fetch Dashboard
async function fetchcount() {
    try {
        const totalUser = await Service.count(Model.User);
        const totalProduct = await Service.count(Model.Product);
        const totalOrder = await Service.count(Model.Order);

        return {
            totalUser: totalUser,
            totalProduct: totalProduct,
            totalOrder: totalOrder
        }
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}


//Fetch Total Sales
async function fetchTotalSales(queryData) {
    try {
        let { startDate, endDate, monthWise, yearWise, year } = queryData;
        if (!monthWise && !yearWise) {
            let a = moment(startDate);
            let b = moment(endDate);
            const Days = b.diff(a, "days") + 1;
            const OneDay = 1000 * 60 * 60 * 24,
                now = new Date(startDate),
                Today = now - (now % OneDay);
            endDate = moment(Today).add(Days, "days");
            let store = {};
            var thisDay = new Date(Today);
            while (thisDay < endDate) {
                store[new Date(thisDay)] = 0;
                thisDay = new Date(thisDay.valueOf() + OneDay);
            }
            let query = [
                {
                    $match: {
                        createdAt: { $gte: new Date(now), $lte: new Date(endDate) },
                    },
                },
                {
                    $group: {
                        _id: {
                            $add: [
                                {
                                    $subtract: [
                                        { $subtract: ["$createdAt", new Date(0)] },
                                        {
                                            $mod: [
                                                { $subtract: ["$createdAt", new Date(0)] },
                                                1000 * 60 * 60 * 24,
                                            ],
                                        },
                                    ],
                                },
                                new Date(0),
                            ],
                        },
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ];
            let data = await Model.Orders.aggregate(query);
            let totalOrders = 0;
            data.forEach(function (result) {
                totalOrders += result.count;
                store[new Date(result._id).toString()] = result.count;
            });
            return { orderAnalytics: store, totalOrders: totalOrders };
        } else {
            let date = new Date();
            if (yearWise) {
                date = new Date(year, 1, 1);
            }
            const yearStart = moment(date).startOf('year').toISOString();
            const yearEnd = moment(date).endOf('year').toISOString();

            let query = [
                {
                    $match: {
                        createdAt: { $gte: new Date(yearStart), $lte: new Date(yearEnd) }
                    },
                },
                {
                    $addFields: {
                        month: { $month: { date: "$createdAt", timezone: "Asia/Kolkata" } },
                        year: { $year: { date: "$createdAt", timezone: "Asia/Kolkata" } },
                    }
                },
                {
                    $group: {
                        _id: { month: "$month", year: "$year" },
                        orders: { $sum: 1 }
                    }
                },
                {
                    $addFields: {
                        month: "$_id.month",
                        year: "$_id.year"
                    }
                },
                {
                    $addFields: {
                        monthInWords: {
                            $let: {
                                vars: {
                                    monthsInString: [null, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                                },
                                in: {
                                    $arrayElemAt: ['$$monthsInString', '$month']
                                }
                            }
                        }
                    }
                },
                {
                    $sort: {
                        month: 1,
                        year: 1
                    }
                },
                {
                    "$group": {
                        "_id": null,
                        "array": {
                            "$push": {
                                "k": "$monthInWords",
                                "v": "$orders"
                            }
                        },
                        total: { $sum: "$orders" }
                    }
                },
                {
                    "$replaceRoot": {
                        "newRoot": { orderAnalytics: { "$arrayToObject": "$array" }, totalOrders: "$total" }
                    }
                },
            ];
            const data = await Model.Orders.aggregate(query);
            return data && data.length ? data[0] : { userAnalytics: {}, totalOrders: 0 };
        }
    } catch (err) {
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

module.exports = {
    fetchcount,
    fetchTotalSales
}