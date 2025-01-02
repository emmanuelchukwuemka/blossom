const db = require('../../Database/db');
const asyncHandler = require("express-async-handler");

// POST request to get total votes for a specific article
const getArticleVotes = asyncHandler(async (req, res) => {
    const { article_name } = req.body;

    if (!article_name) {
        return res.status(400).json({ message: "article_name is required" });
    }

    const query = 'SELECT helpful_yes, helpful_no FROM articles WHERE article_name = ?';
    db.query(query, [article_name], (error, result) => {
        if (error) {
            console.error("Error fetching article votes:", error);
            return res.status(500).json({ message: "Database error" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Article not found" });
        }
        res.status(200).json({ article_name, votes: result[0] });
    });
});

// POST request to get a user's vote on an article
const getUserVote = asyncHandler(async (req, res) => {
    const { user_id, article_name } = req.body;

    if (!user_id || !article_name) {
        return res.status(400).json({ message: "user_id and article_name are required" });
    }

    const query = 'SELECT vote FROM user_votes WHERE user_id = ? AND article_name = ?';
    db.query(query, [user_id, article_name], (error, result) => {
        if (error) {
            console.error("Error fetching user vote:", error);
            return res.status(500).json({ message: "Database error" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "User has not voted on this article" });
        }
        res.status(200).json({ user_id, article_name, vote: result[0].vote });
    });
});

// POST request to submit or change a vote for an article
const submitVote = asyncHandler(async (req, res) => {
    const { user_id, article_name, vote } = req.body;

    // Validate request data
    if (!user_id || !article_name || !['yes', 'no'].includes(vote.toLowerCase())) {
        return res.status(400).json({ message: "Valid user_id, article_name, and vote (yes or no) are required" });
    }

    // Check if the user exists in the users table
    const checkUserQuery = 'SELECT id FROM users WHERE id = ?';
    db.query(checkUserQuery, [user_id], (err, userResult) => {
        if (err) {
            console.error("Database error checking user:", err);
            return res.status(500).json({ message: "Database error while checking user" });
        }

        if (userResult.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }


        const getRelevantText = (articleName) => {
            const articleMappings = {
              is_privacy_notice_helpful: "Privacy Notice",
              is_legal_policy_helpful: "Legal Policy",
              is_condition_of_use_helpful: "Conditions of Use",
              is_additional_state_helpful: "Additional State Info",
              is_gift_card_electronic_message_helpful: "Gift Card Message",
              is_trademark_usage_helpful: "Trademark Usage",
              is_non_exhaustive_list_helpful: "Non-Exhaustive List",
              is_add_cash_helpful: "Add Cash",
              is_reload_balance_helpful: "Reload Balance",
              is_print_bloomzon_gift_card_helpful: "Print Gift Card",
              is_keep_gift_card_helpful: "Keep Gift Card",
              is_load_anytime_helpful: "Load Anytime",
              is_gift_card_redemption_helpful: "Gift Card Redemption",
              is_buying_gift_card_at_store_helpful: "Buying Gift Card",
              is_order_gift_card_helpful: "Order Gift Card",
              is_reload_and_process_delay_helpful: "Reload Processing Delay",
              is_add_custom_image_video_to_card_helpful: "Custom Card Image/Video",
              is_record_a_digital_card_helpful: "Record Digital Card",
              is_manage_your_card_and_message_helpful: "Manage Card & Message",
              is_corporate_gift_card_helpful: "Corporate Gift Card",
              is_about_card_instruction_helpful: "Card Restrictions",
              is_card_terms_and_conditions_helpful: "Card Terms & Conditions",
              is_email_service_terms_of_use_helpful: "Email Service Terms",
              is_content_submission_helpful: "Content Submission",
            };
          
            return articleMappings[articleName] || "Unknown Article";
          };
          
          

        // Check if the article exists
        const checkArticleQuery = 'SELECT article_name FROM articles WHERE article_name = ?';
        db.query(checkArticleQuery, [article_name], (err, articleResult) => {
            if (err) {
                console.error("Error checking article:", err);
                return res.status(500).json({ message: "Error checking article" });
            }

            if (articleResult.length === 0) {
                return res.status(404).json({ message: "Article not found" });
            }

            // Proceed with voting logic if the article exists
            const checkVoteQuery = 'SELECT vote FROM user_votes WHERE user_id = ? AND article_name = ?';
            db.query(checkVoteQuery, [user_id, article_name], (err, voteResult) => {
                if (err) {
                    console.error("Error checking vote:", err);
                    return res.status(500).json({ message: "Database error" });
                }

                const currentVote = voteResult[0]?.vote;

                // If no vote exists, insert the new vote
                if (!currentVote) {
                    const insertVoteQuery = 'INSERT INTO user_votes (user_id, article_name, vote) VALUES (?, ?, ?)';
                    db.query(insertVoteQuery, [user_id, article_name, vote], (err) => {
                        if (err) {
                            console.error("Error recording vote:", err);
                            return res.status(500).json({ message: "Error recording vote" });
                        }

                        // Update the vote count in the articles table
                        const updateArticleQuery = vote === 'yes'
                            ? 'UPDATE articles SET helpful_yes = helpful_yes + 1 WHERE article_name = ?'
                            : 'UPDATE articles SET helpful_no = helpful_no + 1 WHERE article_name = ?';

                        db.query(updateArticleQuery, [article_name], (err) => {
                            if (err) {
                                console.error("Error updating article votes:", err);
                                return res.status(500).json({ message: "Error updating article votes" });
                            }
                            res.status(200).json({ message: `Vote ${vote.toUpperCase()} recorded successfully for ${getRelevantText(article_name)}` });
                        });
                    });

                } else if (currentVote !== vote) {
                    // If the user wants to switch votes
                    const updateVoteQuery = 'UPDATE user_votes SET vote = ? WHERE user_id = ? AND article_name = ?';
                    db.query(updateVoteQuery, [vote, user_id, article_name], (err) => {
                        if (err) {
                            console.error("Error updating vote:", err);
                            return res.status(500).json({ message: "Error updating vote" });
                        }

                        // Update the vote counts based on the switch
                        const updateCountsQuery = vote === 'yes'
                            ? 'UPDATE articles SET helpful_yes = helpful_yes + 1, helpful_no = helpful_no - 1 WHERE article_name = ?'
                            : 'UPDATE articles SET helpful_yes = helpful_yes - 1, helpful_no = helpful_no + 1 WHERE article_name = ?';

                        db.query(updateCountsQuery, [article_name], (err) => {
                            if (err) {
                                console.error("Error updating vote counts:", err);
                                return res.status(500).json({ message: "Error updating vote counts" });
                            }
                            res.status(200).json({ message: `Vote switched to ${vote.toUpperCase()} for ${getRelevantText(article_name)}` });
                        });
                    });

                } else {
                    res.status(201).json({ message: "You have already voted the same option" });
                }
            });
        });
    });
});


// GET request to get all votes for all articles
const getAllVotes = asyncHandler(async (req, res) => {
    const query = 'SELECT article_name, helpful_yes, helpful_no FROM articles';
    db.query(query, [], (error, result) => {
        if (error) {
            console.error("Error fetching all votes:", error);
            return res.status(500).json({ message: "Database error" });
        }
        res.status(200).json({ articles: result });
    });
});

module.exports = {
    getArticleVotes,
    getUserVote,
    submitVote,
    getAllVotes
};
