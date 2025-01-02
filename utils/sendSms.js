require('dotenv').config();
const AfricasTalking = require('africastalking');
const formatNumber = require('../utils/formatNumber');


const africastalking = AfricasTalking({
  apiKey: process.env.AFRICATALKING_KEY, 
  username: 'swifdrop_messenger'
});

const sendMessage = async (to, body) => {
	const formattedPhoneNumber = formatNumber(to, 'NG');
  

  try {
    const result=await africastalking.SMS.send({
      to: formattedPhoneNumber, 
      message: body,
      from: 'Swifdrop App'
    });
    // Log the full result
    // console.log(JSON.stringify(result, null, 2));
  } catch(ex) {
    console.error(ex);
  } 
};


module.exports = sendMessage;