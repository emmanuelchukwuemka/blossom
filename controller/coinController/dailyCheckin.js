const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");
const { getOrCreateWallet } = require("../../utils/defaultTables");

const getAllCheckinRewards = expressAsyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user.id;

  const rewardsSQL =
    "SELECT id, type, day,reward_date, amount, name, description, created_at, updated_at FROM rewards WHERE type = ? ORDER BY day";

  db.query(rewardsSQL, ["checkin"], (err, rewards) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Error fetching checkin rewards" });
    }

    // get the user last claimed checkin reward
    const claimedCheckinSQL =
      "SELECT reward_id, claimed_at FROM coin_histories WHERE user_id = ? AND type = ? ORDER BY claimed_at DESC LIMIT 1";

    db.query(claimedCheckinSQL, [userId, "checkin"], (err, lastClaimed) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ message: "Error fetching claimed checkin rewards" });
      }

      let currentDay = 1;
      let resetRequired = false;

      // check if the user needs to reset claiming streak
      if (lastClaimed.length > 0) {
        const lastReward = lastClaimed[0];
        const lastClaimedDate = new Date(lastReward.claimed_at);
        const now = new Date();

        // check if the time > 24 hours
        const timeDifference = Math.abs(now - lastClaimedDate);
        const hoursSinceLastClaim = timeDifference / (1000 * 60 * 60);

        if (hoursSinceLastClaim >= 24) {
          resetRequired = true;
        } else {
          const lastClaimedReward = rewards.find(
            (r) => r.id === lastReward.reward_id
          );
          if (lastClaimedReward) {
            currentDay = lastClaimedReward.day + 1;
          }
        }
      }

      if (currentDay > rewards.length) {
        currentDay = 1;
        resetRequired = true;
      }

      const checkinRewards = rewards.map((reward) => {
        const isClaimed = resetRequired ? false : reward.day < currentDay;
        return { ...reward, isClaimed };
      });

      return res.json({
        checkinRewards,
      });
    });
  });
});

const checkinClaimReward = expressAsyncHandler(async (req, res) => {
  const userId = req.body.user_id || req.user.id;
  const currentDate = new Date();

  await getOrCreateWallet(userId);

  const lastClaimedSQL =
    "SELECT reward_id, claimed_at FROM coin_histories WHERE user_id = ? AND type = ? ORDER BY claimed_at DESC LIMIT 1";

  db.query(lastClaimedSQL, [userId, "checkin"], (err, lastClaimed) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Error fetching claimed rewards" });
    }

    // check if the user has already claimed
    if (lastClaimed.length > 0) {
      const lastClaimedDate = new Date(lastClaimed[0].claimed_at);

      const timeDifference = Math.abs(currentDate - lastClaimedDate);
      const hoursSinceLastClaim = timeDifference / (1000 * 60 * 60); // Convert to hours

      if (hoursSinceLastClaim < 24) {
        return res.status(201).json({ message: "Reward already claimed" });
      }
    }
    

    // get the current day reward
    const rewardsSQL =
      "SELECT id, amount, type FROM rewards WHERE type = ? AND day = (SELECT IFNULL(MAX(day), 0) + 1 FROM coin_histories WHERE user_id = ?)";

    db.query(rewardsSQL, ["checkin", userId], (err, reward) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ message: "Error fetching today's reward" });
      }

      if (reward.length === 0) {
        return res
          .status(400)
          .json({ message: "No available reward for today." });
      }

      const claimRewardSQL =
        "INSERT INTO coin_histories (user_id, type, amount, description, reward_id, claimed_at) VALUES (?, ?, ?, ?, ?, ?)";

      db.query(
        claimRewardSQL,
        [
          userId,
          "checkin",
          reward[0].amount,
          "Daily Checkin",
          reward[0].id,
          currentDate,
        ],
        (err) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error claiming reward" });
          }

          // add to user wallet
          const updateWalletSQL =
            "UPDATE wallet SET coin_balance = coin_balance + ? WHERE user_id = ?";

          db.query(updateWalletSQL, [reward[0].amount, userId], (err) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ message: "Error updating wallet" });
            }

            return res.status(200).json({ message: "Reward claimed" });
          });
        }
      );
    });
  });
});

const checkinHistory = expressAsyncHandler(async (req, res) => {
  const userId = req.body.user_id || req.user.id;
  const type = req.body.reward_type; // "checkin", "postpurchase", "redeemed", "expired"

  const historySQL =
    "SELECT description, type, amount, claimed_at, expired_at, created_at FROM coin_histories WHERE user_id = ? AND type = ? ORDER BY created_at DESC";

  db.query(historySQL, [userId, type], (err, history) => {
    if (err) {
      console.log(err);
    }

    formattedHistories = history.map((h) => {
      const hasExpired = h.expired_at ? true : false;
      const isClaimed = h.claimed_at ? true : false;
      return { ...h, hasExpired, isClaimed };
    });

    return res.json(formattedHistories);
  });
});

module.exports = {
  getAllCheckinRewards,
  checkinClaimReward,
  checkinHistory,
};
