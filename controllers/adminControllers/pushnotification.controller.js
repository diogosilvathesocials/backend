let FCM = require('fcm-node');
let serverKey = 'AAAAvuR6yKI:APA91bFlvNZAsjMGylsTFlKQjb5uNblNhO2I37Iex9OuQBcLX_emtp7JzYAkBnH4suvaENUlFasZg8qayJ1zQ2oPtB_PXP9-sTp3kaAEX_xMRnRaAFmSRpay_CTURjCxKle9NgZKudl9'; //put your server key here
let fcm = new FCM(serverKey);
const adminModel = require('../../models/adminModels/adminModels');

exports.sendNotification = async function (title, msg, route = 0) {
    let getFCMToken = await adminModel.getFCMToken();
    if (getFCMToken) {
        let message = {
            to: getFCMToken.FCM_token,
            notification: {
                title: title,
                body: msg
            },
            data : {
                route : route
            }
        };

        fcm.send(message, function (err, response) {
            if (err) {
                console.log("Something has gone wrong!", err);
            } else {
                console.log("Successfully sent with response: ", response);
            }
        });
    }
}