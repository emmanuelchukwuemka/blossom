const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");
const { getOrCreateWallet } = require("../../utils/defaultTables");

const generateVerificationCode = () => {
  const code = Math.floor(100000 + Math.random() * 900000);
  return code;
};

const verifyWallet = expressAsyncHandler(async (req, res) => {
  const userId = req.body.userId || req.user.id;
  const { phone_number } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!phone_number) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  const ensureUserHasWallet = await getOrCreateWallet(userId);

  if (ensureUserHasWallet && ensureUserHasWallet.is_verified) {
    return res
      .status(400)
      .json({ message: "Wallet has already been verified" });
  }

  // generate verification code, save it and send it to user phone number
  const verificationCode = generateVerificationCode();

  const UPDATESQL =
    "UPDATE wallet SET verification_code = ?, verification_phone_no = ? WHERE user_id = ?";
  db.query(
    UPDATESQL,
    [verificationCode, phone_number, userId],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error updating wallet" });
      }
    }
  );

  // TODO: send verification code to user phone number

  return res
    .status(200)
    .json({ message: "Verification code sent successfully" });
});

const verifyWalletOtp = expressAsyncHandler(async (req, res) => {
  const userId = req.body.userId || req.user.id;
  const { otp } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!otp) {
    return res.status(400).json({ message: "OTP is required" });
  }

  const SQL = "SELECT * FROM wallet WHERE user_id = ?";
  db.query(SQL, [userId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error fetching wallet" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    if (result[0].verification_code !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    const UPDATESQL = "UPDATE wallet SET is_verified = true WHERE user_id = ?";
    db.query(UPDATESQL, [userId], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error updating wallet" });
      }
    });
    return res.status(200).json({ wallet: result[0] });
  });
});

module.exports = { verifyWallet, verifyWalletOtp };
