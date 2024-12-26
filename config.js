const dotenv = require("dotenv");
const stage = "production";
const env = dotenv.config({
  path: `${stage}.env`,
});

module.exports = {
  mysqlHost: process.env.MYSQLHOST,
  // mysqlHost: process.env.MYSQLHOSTLOCAL,
  user: "esp",
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  mysqlPort: process.env.MYSQLPORT,
  JWT_SECRET_KEY: process.env.JWTSECRETKEY,
  JWTSECRETKEYUSER: process.env.JWTSECRETKEYUSER,
  JWTSECRETKEYVENDORE: process.env.JWTSECRETKEYVENDORE,
  SESSION_EXPIRES_IN: process.env.SESSIONEXPIRESIN,
  mailUrl: process.env.MAILURL,
  imageUrl :"https://espsofttech.in:8008/api/uplaods/",
  paymentUrl:'https://espsofttech.in/social_system/stripe/stripePayment',
};