const checksum = require('../lib/checksum');
const config = require('../config');
require('dotenv/config');

const initPayment = function(amount,Customer_Id,CreateBusiness,Order_Id) {
  return new Promise((resolve, reject) => {
	  var paymentObj;
	  
	  if(CreateBusiness==1)
	  {
		paymentObj = {
		  ORDER_ID: Order_Id,
		  CUST_ID: Customer_Id,
		  INDUSTRY_TYPE_ID: process.env.INDUSTRY_TYPE_ID,
		  CHANNEL_ID: process.env.CHANNEL_ID,
		  TXN_AMOUNT: amount.toString(),
		  MID: process.env.MID,
		  WEBSITE: process.env.WEBSITE,
		  CALLBACK_URL: process.env.CALLBACK_URL_CREATE
		 };
	  }
	  else
	  {
		  paymentObj = {
		  ORDER_ID: Order_Id,
		  CUST_ID: Customer_Id,
		  INDUSTRY_TYPE_ID: process.env.INDUSTRY_TYPE_ID,
		  CHANNEL_ID: process.env.CHANNEL_ID,
		  TXN_AMOUNT: amount.toString(),
		  MID: process.env.MID,
		  WEBSITE: process.env.WEBSITE,
		  CALLBACK_URL: process.env.CALLBACK_URL
		};
	  }
    
    checksum.genchecksum(
      paymentObj,
      process.env.PAYTM_MERCHANT_KEY,
      (err, result) => {
        if (err) {
          return reject('Error while generating checksum');
        } else {
          paymentObj.CHECKSUMHASH = result;
          return resolve(paymentObj);
        }
      }
    );
  });
};

const responsePayment = function(paymentObject) {
  return new Promise((resolve, reject) => {
    if (
      checksum.verifychecksum(
        paymentObject,
        process.env.PAYTM_MERCHANT_KEY,
        paymentObject.CHECKSUMHASH
      )
    ) {
      resolve(paymentObject);
    } else {
      return reject('Error while verifying checksum');
    }
  });
};

module.exports = {
  initPayment: initPayment,
  responsePayment: responsePayment
};
