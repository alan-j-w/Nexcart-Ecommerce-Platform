const Razorpay = require("razorpay");

let instance = null;

const getRazorpayInstance = () => {
  if (!instance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay environment variables (RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET) are missing.");
    }

    instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  return instance;
};

module.exports = getRazorpayInstance;


