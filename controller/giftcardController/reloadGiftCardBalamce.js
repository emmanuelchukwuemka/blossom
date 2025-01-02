const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");
const { getOrCreateWallet } = require("../../utils/defaultTables");


const reloadGiftCardBalamce = expressAsyncHandler(async (req, res) => {
  const userId = req.body.user_id || req.user.id;
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ message: "Fill all required fields" });
  }

  try {
    // Ensure user has a wallet
    await getOrCreateWallet(userId);

    // Fetch user's wallet balance and gift card balance
    const walletQuery = `SELECT balance, giftcard_balance FROM wallet WHERE user_id = ?`;
    db.query(walletQuery, [userId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching wallet balance" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      const { balance, giftcard_balance } = result[0];

      // Check if wallet has sufficient balance for the reload
      if (balance < amount) {
        return res.status(201).json({
          message: "Insufficient wallet balance to reload gift card",
        });
      }

      // Calculate updated balances
      const updatedWalletBalance = balance - amount;
      const updatedGiftCardBalance = parseInt(giftcard_balance) + amount * 10;

      // Update wallet table with new balances
      const updateWalletQuery = `
        UPDATE wallet 
        SET 
          balance = ?, 
          giftcard_balance = ? 
        WHERE 
          user_id = ?
      `;
      db.query(
        updateWalletQuery,
        [updatedWalletBalance, updatedGiftCardBalance, userId],
        (updateErr) => {
          if (updateErr) {
            console.error(updateErr);
            return res.status(500).json({ message: "Error updating wallet balances" });
          }

          // Reflect changes in the response
          return res.json({
            message: "Gift card balance reloaded successfully",
            updated_wallet_balance: updatedWalletBalance,
            updated_giftcard_balance: updatedGiftCardBalance,
          });
        }
      );
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});




module.exports = reloadGiftCardBalamce;
