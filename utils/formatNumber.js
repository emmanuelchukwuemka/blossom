const libphonenumber = require('libphonenumber-js');

/**
 * @param {string} phoneNumber - The phone number to verify and format.
 * @param {string} [defaultCountryCode] - Optional country code (e.g., 'NG'). Default is undefined.
 * @returns {string} - The formatted phone number in E.164 format.
 */
const formatNumber = (phoneNumber, defaultCountryCode) => {
  if (phoneNumber.startsWith('+')) {
    const parsedNumber = libphonenumber.parsePhoneNumber(phoneNumber);
    if (parsedNumber.isValid()) {
      return phoneNumber;
    } else {
      throw new Error('Invalid phone number format');
    }
  }
  try {
    const parsedNumber = defaultCountryCode
      ? libphonenumber.parsePhoneNumber(phoneNumber, defaultCountryCode) 
      : libphonenumber.parsePhoneNumber(phoneNumber);
    if (parsedNumber.isValid()) {
      return parsedNumber.format('E.164');
    } else {
      throw new Error('Invalid phone number');
    }
  } catch (error) {
    throw new Error('Error formatting phone number');
  }
};

module.exports = formatNumber;