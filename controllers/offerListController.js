const offerListModel = require('../models/offerListModel');
const config = require('../config');
var random = require('random-string-alphanumeric-generator');

exports.getOfferList = async (req, res) => {
    try {
        let getOfferList = await offerListModel.getOfferList(req.user_id);
        if (getOfferList.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "All offer list",
                data: getOfferList
            })
        } else {
            return res.status(200).send({
                success: false,
                msg: "No Data Found !!"
            })
        }

    } catch (error) {
        console.log('Error', error)
        return res.status(200).send({
            success: false,
            msg: "Internal server error"
        })
    }
};

exports.addOffer = async (req, res) => {
    try {
        let data = req.body;
        let getOfferList = await offerListModel.getOfferListByName(data)
        if (getOfferList.length > 0) {
            return res.status(200).send({
                success: false,
                msg: "Offer Already Added !!"
            })
        } else {
            let imageArr = !req.files ? null : req.files;
            let offerCode = randomString(6, 'abcdefghijklmnopqrstuvwxyz12345678910ABCDEFGHIJKLMNOPQRSTUVWXYZ');

            let newData = {
                userId: req.user_id,
                offerCategoryId: data.offerCategoryId,
                offerName: data.offerName,
                offerDescription: data.offerDescription,
                offerPrice: data.offerPrice,
                offerPercent: data.offerPercent,
                offerCode: offerCode,
                offerType: data.offerType ? data.offerType : '2'
            }

            let insertOfferList = await offerListModel.insertOfferList(newData);
            if (insertOfferList) {
                for (let i = 0; i < imageArr.length; i++) {
                    let newImages = {
                        userId: req.user_id,
                        offerId: insertOfferList.insertId,
                        image: imageArr[i]?.filename
                    }
                    await offerListModel.insertOfferImages(newImages);
                }

                return res.status(200).send({
                    success: true,
                    msg: "Offer Added successfully !!",
                })
            } else {
                return res.status(200).send({
                    success: false,
                    msg: "Insert Failed !!"
                })
            }
        }
    } catch (error) {
        console.log('eeeee', error)
        return res.status(200).send({
            success: false,
            msg: "Internal server error"
        })
    }
};


function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}


exports.getOfferListById = async (req, res) => {
    try {
        let data = req.body;
        var getOfferListData = [];
        getOfferListData = await offerListModel.getOfferListById(req.user_id, data);
        getOfferListData.filter(item => {
            item.otherOffers = JSON.parse(item.otherOffers)
            item.imageArr = JSON.parse(item.imageArr)
            item.otherOffers.filter(offer => {
                offer.imageArray = JSON.parse(offer.imageArray)
            })
        })
        if (getOfferListData.length > 0) {
            let newData = {
                userId: req.user_id,
                offerId: getOfferListData[0].id,
                categoryId: getOfferListData[0].offerCategoryId
            }
            await offerListModel.insertUserTracker(newData);

            let checkPlanSubscription = await offerListModel.checkPlanSubscription(req.user_id);
            if (checkPlanSubscription.length > 0) {
                isPlanSubscribe = 1
            } else {
                isPlanSubscribe = 0
            }

            return res.status(200).send({
                success: true,
                msg: "offer Detail",
                isPlanSubscribe : isPlanSubscribe,
                data: getOfferListData[0]
            })
        } else {
            return res.status(200).send({
                success: false,
                msg: "No data found"
            })
        }

    } catch (error) {
        console.log(error);
        return res.status(200).send({
            success: false,
            msg: "Internal server error"
        })
    }
}


exports.deleteOfferListById = async (req, res) => {
    try {
        let data = req.body;
        let getOfferListData = await offerListModel.getOfferListById(data);
        if (getOfferListData.length > 0) {
            let deleteOffer = await offerListModel.deleteOfferById(req.user_id, data);
            let deleteOfferImage = await offerListModel.deleteOfferImageById(req.user_id, data);

            return res.status(200).send({
                success: true,
                msg: "offer Deleted !!"
            })
        } else {
            return res.status(200).send({
                success: false,
                msg: "No Available Request found"
            })
        }

    } catch (error) {
        console.log(error);
        return res.status(200).send({
            success: false,
            msg: "Internal server error"
        })
    }
}

exports.getCategory = async (req, res) => {
    try {
        let getCategoryList = await offerListModel.getCategory();
        if (getCategoryList.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "All Category list",
                data: getCategoryList
            })
        } else {
            return res.status(200).send({
                success: false,
                msg: "No Data Found !!"
            })
        }

    } catch (error) {
        return res.status(200).send({
            success: false,
            msg: "Internal server error"
        })
    }
};

exports.getOfferListByCategoryId = async (req, res) => {
    try {
        let data = req.body;
        let getOfferListData = await offerListModel.getOfferListByCategoryId(data, req.user_id);

        getOfferListData.filter(item => {
            item.imageArr = JSON.parse(item.imageArr)
        })

        if (getOfferListData.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "offer Detail by category !!",
                data: getOfferListData
            })
        } else {
            return res.status(200).send({
                success: false,
                msg: "No data found"
            })
        }

    } catch (error) {
        console.log(error.message);
        return res.status(200).send({
            success: false,
            msg: "Internal server error"
        })
    }
}

exports.getHomeOffer = async (req, res) => {
    try {
        if(req.query.user_id == undefined){
            req.query.user_id = 0
        }
        let getOfferList = await offerListModel.getHomeOffer(req.query.user_id);
        let isPlanSubscribe;
        let checkPlanSubscription = await offerListModel.checkPlanSubscription(req.query.user_id, getOfferList.offerId);
        if (checkPlanSubscription.length > 0) {
            isPlanSubscribe = 1
        } else {
            isPlanSubscribe = 0
        }

        getOfferList.filter(item => {
            item.offerArr = JSON.parse(item.offerArr)
            item.offerArr.filter(offer => {
                offer.imageArray = JSON.parse(offer.imageArray)
            })
        })
        let getRecommendedOfferList = await offerListModel.getRecommendedOffer(req.query.user_id);
        let getSpecialOfferListData = await offerListModel.getSpecialOfferList();
        getSpecialOfferListData.filter(item => {
            item.imageArr = JSON.parse(item.imageArr)
        })
        getRecommendedOfferList.filter(item => {
            item.imageArr = JSON.parse(item.imageArr)
        })

        let getRecommendedDefaultOfferList = await offerListModel.getRecommendedDefaultOffer();
        getRecommendedDefaultOfferList.filter(item => {
            item.imageArr = JSON.parse(item.imageArr)
        })
        //recommand offer list

        if (getOfferList.length > 0 || getSpecialOfferListData.length > 0 || getRecommendedOfferList.length > 0 || getRecommendedDefaultOfferList.length > 0) {
            
            return res.status(200).send({
                success: true,
                msg: "All Offer list",
                isPlanSubscribe: isPlanSubscribe,
                data: getOfferList,
                specialOffer: getSpecialOfferListData,
                recommendedOfferList: getRecommendedOfferList.length > 0 ? getRecommendedOfferList : getRecommendedDefaultOfferList
            })
        } else {
            return res.status(200).send({
                success: false,
                msg: "No Data Found !!"
            })
        }

    } catch (error) {
        console.log(error)
        return res.status(200).send({
            success: false,
            msg: "Internal server error"
        })
    }
};

exports.redeemOffer = async (req, res) => {
    try {
        let data = req.body;

        let getOfferCode = await offerListModel.redeemOfferCode(data);
        let getOfferAlready = await offerListModel.redeemOfferAlreday(req.user_id, data);
        if (getOfferAlready.length > 0) {
            return res.status(200).send({
                success: false,
                msg: "Offer Already Redeemed !!"
            })
        }

        if (getOfferCode.length > 0) {
            let newData = {
                userId: req.user_id,
                offerId: data.offerId,
                redeemCode: getOfferCode[0].offerCode,
                uniqueId: data.uniqueId
            }
            let getOfferListData = await offerListModel.insertRedeemOffer(newData);
            if (getOfferListData) {
                return res.status(200).send({
                    success: true,
                    msg: "Redeem offer Successfully !!",
                    data: getOfferCode
                })
            } else {
                return res.status(200).send({
                    success: false,
                    msg: "Insertion Error found"
                })
            }
        } else {
            return res.status(200).send({
                success: false,
                msg: "Redeem Code invalid !!",
            })
        }

    } catch (error) {
        console.log(error);
        return res.status(200).send({
            success: false,
            msg: "Internal server error"
        })
    }
}


exports.redeemOfferCheck = async (req, res) => {
    try {
        let data = req.body;

        let getOfferAlready = await offerListModel.redeemOfferAlreday(req.user_id, data);
        if (getOfferAlready.length > 0) {
            return res.status(200).send({
                success: false,
                msg: "Offer Already Redeemed !!"
            })
        }

        let getOfferCode = await offerListModel.redeemOfferCode(data);

        if (getOfferCode.length > 0) {

            return res.status(200).send({
                success: true,
                msg: "Redeem offer Successfully !!",
                data: random.randomLetters(10, "uppercase")
            })
        } else {
            return res.status(200).send({
                success: false,
                msg: "Redeem Code invalid !!",
            })
        }

    } catch (error) {
        console.log(error);
        return res.status(200).send({
            success: false,
            msg: "Internal server error"
        })
    }
}


exports.searchOffer = async (req, res) => {
    try {
        let data = req.body;

        let where = "where 1 ";
        if (data.search) {
            where = where + ` AND (ol.offerName like   ('%${data.search}%') OR ol.offerDescription like   ('%${data.search}%')) `;
        }
        if(req.body.user_id == undefined){
            req.body.user_id = 0
        }
        let getOfferList = await offerListModel.searchOffer(where, req.body.user_id);
        getOfferList.filter(item => {
            item.imageArr = JSON.parse(item.imageArr)
        })
        if (getOfferList.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "All Offer list",
                data: getOfferList
            })
        } else {
            return res.status(200).send({
                success: false,
                msg: "No Data Found !!"
            })
        }

    } catch (error) {
        console.log(error.message)
        return res.status(200).send({
            success: false,
            msg: "Internal server error"
        })
    }
};

exports.redeemOfferHistory = async (req, res) => {
    try {
        
        let redeemOfferHistory = await offerListModel.redeemOfferHistory(req.user_id);
        if (redeemOfferHistory.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "Redeem offer history!!",
                data: redeemOfferHistory
            })
        } else {
            return res.status(200).send({
                success: false,
                msg: "No data found!!",
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(200).send({
            success: false,
            msg: "Internal server error"
        })
    }
}