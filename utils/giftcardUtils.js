// function to generate giftcard code
const generateGiftCardCode = () => {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 20; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

module.exports = { generateGiftCardCode };
