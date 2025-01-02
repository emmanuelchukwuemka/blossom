const express = require('express');
const router = express.Router();

const {
    createAccountDataRequest,
    deleteAccountDataRequest,
    deleteAllAccountDataRequestsByUser,
    getAllAccountDataRequests,
    getAllAccountDataRequestsByUser
} = require('../../controller/requestsController/dataRequest');

const {
    createCloseAccountRequest,
    deleteCloseAccountRequest,
    deleteAllCloseAccountRequestsByUser,
    getAllCloseAccountRequests,
    getAllCloseAccountRequestsByUser
} = require('../../controller/requestsController/closeAccountRequest');
const { isAuthenticated } = require('../../middleware/authmiddleware');








// Account Data Requests Routes
router.post('/account-data-requests', isAuthenticated, createAccountDataRequest);
router.delete('/account-data-requests/:id', isAuthenticated, deleteAccountDataRequest);
router.delete('/account-data-requests/user/:user_id', isAuthenticated, deleteAllAccountDataRequestsByUser);
router.get('/account-data-requests', isAuthenticated, getAllAccountDataRequests);
router.get('/account-data-requests/user/:user_id', isAuthenticated, getAllAccountDataRequestsByUser);

// Close Account Requests Routes
router.post('/close-account-requests', isAuthenticated, createCloseAccountRequest);
router.delete('/close-account-requests/:id', isAuthenticated, deleteCloseAccountRequest);
router.delete('/close-account-requests/user/:user_id', isAuthenticated, deleteAllCloseAccountRequestsByUser);
router.get('/close-account-requests', isAuthenticated, getAllCloseAccountRequests);
router.get('/close-account-requests/user/:user_id', isAuthenticated, getAllCloseAccountRequestsByUser);




module.exports = router;
