const express = require("express");

const getAllUsers = require('../controller/UserController/GetAllUser.js');
const deleteUser = require('../controller/UserController/DeleteUser.js');
const loginUser = require('../controller/Login.js');
const getUser = require('../controller/UserController/getUser.js');
const logOut = require('../controller/UserController/LogOut.js');
const loginStatus = require('../controller/loginStatus.js');
// const upgradeUser = require("../controller/upGradeUser.js");
// const sendLoginCode = require("../controller/SendLoginCode.js");
const register = require("../controller/UserController/Register.js");
const { updateUser, editProfile, updatePassword, updateZipCode } = require("../controller/UserController/updateUser.js");
const VerifyUser = require("../controller/verifyUser")
const { isAuthenticated, protect, adminOnly, riderOnly, verifiedOnly, authorOnly, vendorOnly } = require("../middleware/authmiddleware")
const { logMessage } = require('../middleware/messagesMiddleware');


const router = express.Router();

router.post("/auth/register", register);
router.delete("/user/delete-user/:id", deleteUser);
router.post("/auth/login", loginUser);
router.get("/auth/logout", logOut);
router.post("/auth/verify-user", VerifyUser);
router.get("/user/get-user/:id", getUser);
router.patch("/user/update-profile", isAuthenticated, logMessage("updated profile detail"), updateUser);
router.patch("/user/edit-profile", isAuthenticated, logMessage("edited profile detail"), editProfile);
router.patch("/user/edit-password", isAuthenticated, logMessage("updated account password"), updatePassword);
router.patch("/user/update-zipcode", isAuthenticated, logMessage("updated zip code"), updateZipCode);
router.get("/user/get-all-users", getAllUsers);


module.exports = router;