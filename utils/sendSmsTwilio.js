require('dotenv').config();
const twilio = require('twilio');
const formatNumber = require('../utils/formatNumber');


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);


const sendMessage = async (to, body) => {
	const formattedPhoneNumber = formatNumber(to, 'NG')
  try {
    const message = await client.messages.create({
      body: body,
      from: twilioPhoneNumber,
      to: formattedPhoneNumber,
    });

    console.log(`Message sent: ${message.sid}`);
  } catch (error) {
    console.error('Error sending message:', error);   
  }
};


module.exports = sendMessage;