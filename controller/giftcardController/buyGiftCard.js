const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");
const { generateGiftCardCode } = require("../../utils/giftcardUtils");
const { uploadToCloudinaryWithId } = require("../../utils/cloudinary/uploader");

const buyGiftCardNow = expressAsyncHandler(async (req, res) => {
  const userId = req.body.user_id || req.user.id;

  const {
    giftcard_id,
    amount,
    delivery, // delivery: "email", "text_message"
    to,
    from,
    message,
    quantity,
    date_to_be_sent, // date_to_be_sent: NULL, "now", "12-10-2024"
  } = req.body;

  if (!amount || !delivery || !to || !from || !quantity) {
    return res.status(400).json({ message: "Fill all required fields" });
  }

  const sendDate =
    date_to_be_sent == "now" || !date_to_be_sent
      ? null
      : new Date(date_to_be_sent);

  const SQL =
    "INSERT INTO giftcard_orders(user_id, giftcard_id, amount, quantity, delivery_method, send_date, send_to, sent_from, message, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(
    SQL,
    [
      userId,
      giftcard_id,
      amount,
      quantity,
      delivery,
      sendDate,
      to,
      from,
      message,
      "unpaid",
    ],
    (err, results) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ message: "Error inserting into giftcard_orders" });
      }

      return res.status(200).json({ message: "Saved Successfully" });
    }
  );
});

const addGiftCardToCart = expressAsyncHandler(async (req, res) => {
  const userId = req.body.user_id || req.user.id;

  const {
    giftcard_id,
    amount,
    delivery, // delivery: "email", "text_message"
    to,
    from,
    message,
    quantity,
    date_to_be_sent, // date_to_be_sent: NULL, "now", "12-10-2024"
  } = req.body;

  if (!amount || !delivery || !to || !from || !quantity) {
    return res.status(400).json({ message: "Fill all required fields" });
  }

  const sendDate =
    date_to_be_sent == "now" || !date_to_be_sent
      ? null
      : new Date(date_to_be_sent);

  const SQL =
    "INSERT INTO giftcard_orders(user_id, giftcard_id, amount, quantity, delivery_method, send_date, send_to, sent_from, message, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(
    SQL,
    [
      userId,
      giftcard_id,
      amount,
      quantity,
      delivery,
      sendDate,
      to,
      from,
      message,
      "unpaid",
    ],
    (err, results) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ message: "Error inserting into giftcard_orders" });
      }

      return res.status(200).json({ message: "Added To Cart Successfully" });
    }
  );
});

const createPersonaliseGiftcard = expressAsyncHandler(async (req, res) => {
  const userId = req.body.user_id || req.user.id;
  const file = req.file;

  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ message: "Fill all required fields" });
  }

  let fileId = null;
  let fileUrl = null;
  if (file) {
    const cldRes = await uploadToCloudinaryWithId(
      file.buffer,
      file.mimetype,
      "personaliseGiftcards"
    );
    fileUrl = cldRes.secure_url;
    fileId = cldRes.public_id;
  }

  // generate giftcard_code
  const giftcardCode = generateGiftCardCode();

  const SQL =
    "INSERT INTO giftcards(card_code, user_id, file_id, file_url, price) VALUES (?, ?, ?, ?, ?)";
  db.query(
    SQL,
    [giftcardCode, userId, fileId, fileUrl, amount],
    (err, results) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ message: "Error inserting into personalise_giftcards" });
      }

      return res.status(200).json({ message: "Saved Successfully" });
    }
  );
});

module.exports = {
  buyGiftCardNow,
  addGiftCardToCart,
  createPersonaliseGiftcard,
};
