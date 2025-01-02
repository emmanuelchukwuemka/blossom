const express = require('express');
const { logMessage } = require('../../middleware/messagesMiddleware');
const { 
  getAllMessages, getChatMessages, getSelfMessages, 
  clearAllMessages, clearSelfMessages, clearChatMessages, 
  deleteMessage, editChatMessage 
} = require('../../controller/messagesController/allMessages');
const { isAuthenticated } = require('../../middleware/authmiddleware');

const router = express.Router();

// logMessage MIDDLEWARE USAGE, implemented in appPreference, coinRoutes, helpfulRoutes, notificationRoutes, wishlistRoutes, userRoutes AND SHOULD BE USED ONLY IF USER IS AUTHENTICATED
// router.patch('/notifications/promotion', isAuthenticated, logMessage("Promotion notification updated"), controller);

// Message routes
router.get('/messages', isAuthenticated, getAllMessages);
router.get('/messages/chat', isAuthenticated, getChatMessages);
router.get('/messages/self/:userId', isAuthenticated, getSelfMessages);
router.delete('/messages', isAuthenticated, clearAllMessages);
router.delete('/messages/chat', isAuthenticated, clearChatMessages);
router.delete('/messages/self/:userId', isAuthenticated, clearSelfMessages);
router.delete('/messages/:messageId', isAuthenticated, deleteMessage);
router.patch('/messages/:messageId', isAuthenticated, editChatMessage);

module.exports = router;
