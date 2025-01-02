const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");

const addCheckingAccount = expressAsyncHandler(async (req, res) => {
  const userId =  req.body.userId || req.user.id;
  const {
    name,
    routingNumber,
    accountNumber,
    confirmAccountNumber,
    issuedIdNumber,
    state,
  } = req.body;

  if (
    !name ||
    !routingNumber ||
    !accountNumber ||
    !confirmAccountNumber ||
    !issuedIdNumber ||
    !state
  ) {
    return res
      .status(400)
      .json({ message: "Please fill in all the required fields." });
  }

  if (accountNumber !== confirmAccountNumber) {
    return res.status(400).json({
      message: "Account number does not match.",
    });
  }

  const SQL =
    "INSERT INTO user_payment_methods (user_id, type, name, routing_number, account_number, issued_id_number, state) VALUES(?,?,?,?,?,?,?)";
  const params = [
    userId,
    "checking",
    name,
    routingNumber,
    accountNumber,
    issuedIdNumber,
    state,
  ];

  db.query(SQL, params, (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Error adding checking account." });
    }
    return res.json({ message: "Checking account added successfully." });
  });
});

module.exports = addCheckingAccount;
