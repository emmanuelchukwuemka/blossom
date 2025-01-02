const asyncHandler = require("express-async-handler");
const db = require('../../Database/db');

// Get all messages
const getAllMessages = asyncHandler(async (req, res) => {
  const SQL = 'SELECT * FROM messages';
  db.query(SQL, (err, results) => {
    if (err) {
      console.error("Error fetching all messages:", err);
      return res.status(500).json({ message: "Error fetching messages" });
    }
    res.status(200).json({ messages: results });
  });
});

// Get chat messages
const getChatMessages = asyncHandler(async (req, res) => {
  const SQL = `
    SELECT * FROM messages 
    WHERE sender_id != receiver_id OR sender_id != creator_id OR receiver_id != creator_id
  `;
  db.query(SQL, (err, results) => {
    if (err) {
      console.error("Error fetching chat messages:", err);
      return res.status(500).json({ message: "Error fetching chat messages" });
    }
    res.status(200).json({ messages: results });
  });
});

// Get self messages
const getSelfMessages = asyncHandler(async (req, res) => {
    const userId = req.params.userId || req.user.id; // Get user ID from `isAuthenticated`
  
    const SQL = `
      SELECT * FROM messages 
      WHERE sender_id = ? AND receiver_id = ? AND creator_id = ?
    `;
    const values = [userId, userId, userId];
  
    db.query(SQL, values, (err, results) => {
      if (err) {
        console.error("Error fetching self messages:", err);
        return res.status(500).json({ message: "Error fetching self messages" });
      }
      res.status(200).json({ messages: results });
    });
  });
  
// Clear all messages
const clearAllMessages = asyncHandler(async (req, res) => {
  const SQL = 'DELETE FROM messages';
  db.query(SQL, (err, result) => {
    if (err) {
      console.error("Error clearing all messages:", err);
      return res.status(500).json({ message: "Error clearing messages" });
    }
    res.status(200).json({ message: "All messages cleared successfully" });
  });
});

// Clear self messages
const clearSelfMessages = asyncHandler(async (req, res) => {
    const userId = req.params.userId || req.user.id; // Get user ID from `isAuthenticated`
  
    const SQL = `
      DELETE FROM messages 
      WHERE sender_id = ? AND receiver_id = ? AND creator_id = ?
    `;
    const values = [userId, userId, userId];
  
    db.query(SQL, values, (err, result) => {
      if (err) {
        console.error("Error clearing self messages:", err);
        return res.status(500).json({ message: "Error clearing self messages" });
      }
      res.status(200).json({ message: "Self messages cleared successfully" });
    });
  });
  

// Clear chat messages
const clearChatMessages = asyncHandler(async (req, res) => {
  const SQL = `
    DELETE FROM messages 
    WHERE sender_id != receiver_id OR sender_id != creator_id OR receiver_id != creator_id
  `;
  db.query(SQL, (err, result) => {
    if (err) {
      console.error("Error clearing chat messages:", err);
      return res.status(500).json({ message: "Error clearing chat messages" });
    }
    res.status(200).json({ message: "Chat messages cleared successfully" });
  });
});

// Delete a message by ID
const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const SQL = 'DELETE FROM messages WHERE id = ?';
  db.query(SQL, [messageId], (err, result) => {
    if (err) {
      console.error("Error deleting message:", err);
      return res.status(500).json({ message: "Error deleting message" });
    }
    res.status(200).json({ message: "Message deleted successfully" });
  });
});

// Edit a chat message (sender only)
const editChatMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { newMessage } = req.body;
  const { id: userId } = req.user;

  const SQL = `
    UPDATE messages 
    SET message = ? 
    WHERE id = ? AND sender_id = ?
  `;
  const values = [newMessage, messageId, userId];

  db.query(SQL, values, (err, result) => {
    if (err) {
      console.error("Error editing chat message:", err);
      return res.status(500).json({ message: "Error editing chat message" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Message not found or not authorized to edit" });
    }
    res.status(200).json({ message: "Chat message updated successfully" });
  });
});

module.exports = {
  getAllMessages,
  getChatMessages,
  getSelfMessages,
  clearAllMessages,
  clearSelfMessages,
  clearChatMessages,
  deleteMessage,
  editChatMessage,
};
