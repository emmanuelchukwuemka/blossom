const db = require('../../Database/db');
const asyncHandler = require('express-async-handler');
const { uploadCloudinaryBase64 } = require("../../utils/cloudinary/uploader");
const { deleteFromCloudinary } = require("../../utils/cloudinary/deleter"); // Adjust path as needed


// GET Controllers
// Get all fan_shop_leagues
const getFanShopLeagues = asyncHandler(async (req, res) => {
    const query = 'SELECT * FROM fan_shop_leagues';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching items", error: err });
        res.status(200).json({ fan_shop_leagues: results });
    });
});


// Note that the fan_shop_followers table carries the teams the user is following
const getFanShopFollowing = asyncHandler(async (req, res) => {
    const user_id = req.params.userId; // Include user_id as a parameter to check following status
    
        if (!user_id) {
            return res.status(400).json({ message: "User ID is required to check following status" });
        }
    
        const query = 'SELECT * FROM fan_shop_followers WHERE user_id = ?';

    db.query(query, [user_id], (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching items", error: err });
        res.status(200).json({ fan_shop_following: results });
    });
});


// Get all fan_shop_apparels including league name
const getFanShopApparels = asyncHandler(async (req, res) => {
    const query = `
        SELECT fan_shop_apparels.*, fan_shop_leagues.name AS league_name
        FROM fan_shop_apparels
        JOIN fan_shop_leagues ON fan_shop_apparels.fan_shop_league_id = fan_shop_leagues.id
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching apparel", error: err });

        const singleApparel = results.map(item => new Promise((resolve, reject) => {
            const league = `SELECT * FROM fan_shop_leagues WHERE id = ?`;
            db.query(league, [item.fan_shop_league_id], (err, leagues) => {
                if (err) return reject(err);
                resolve({   id: item.id, fan_shop_league_name: leagues[0].name , ...item});
            });
            }));
    
            Promise.all(singleApparel)
                .then(results => res.status(200).json({ fan_shop_apparels: results }))
                .catch(error => res.status(500).json({ message: "Error fetching full items data", error }));
    });
});

// Get all fan_shop_teams
const getFanShopTeams = asyncHandler(async (req, res) => {
    const user_id = req.params.userId || req.user; // Include user_id as a parameter to check following status

    if (!user_id) {
        return res.status(400).json({ message: "User ID is required to check following status" });
    }

    const query = `
        SELECT 
            fan_shop_teams.*,
            CASE 
                WHEN fan_shop_followers.user_id IS NOT NULL THEN 1 
                ELSE 0 
            END AS is_following
        FROM fan_shop_teams
        LEFT JOIN fan_shop_followers 
            ON fan_shop_teams.id = fan_shop_followers.fan_shop_team_id 
            AND fan_shop_followers.user_id = ?
    `;

    db.query(query, [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching teams", error: err });
        }

        // Convert is_following from 0/1 to boolean
        const updatedResults = results.map(item => ({
            ...item,
            ... {
                is_following: Boolean(item.is_following),
                following: Boolean(item.following)
            }, // Explicit boolean conversion
        }));

        const singleTeam = updatedResults.map(item => new Promise((resolve, reject) => {
            const league = `SELECT * FROM fan_shop_leagues WHERE id = ?`;
            db.query(league, [item.fan_shop_league_id], (err, leagues) => {
                if (err) return reject(err);
                resolve({ id: item.id, fan_shop_league_name: leagues[0].name, ...item });
            });
        }));

        Promise.all(singleTeam)
            .then(results => res.status(200).json({ fan_shop_teams: results }))
            .catch(error => res.status(500).json({ message: "Error fetching full items data", error }));
    });
});




// Get full fan_shop_league data with related apparel and following
const getAllLeaguesByAdmin = asyncHandler(async (req, res) => {
    const itemsQuery = 'SELECT * FROM fan_shop_leagues';
    db.query(itemsQuery, (err, items) => {
        if (err) return res.status(500).json({ message: "Error fetching items", error: err });

        const itemPromises = items.map(item => new Promise((resolve, reject) => {
            const apparelQuery = 'SELECT * FROM fan_shop_apparels WHERE fan_shop_league_id = ?';
            db.query(apparelQuery, [item.id], (err, apparel) => {
                if (err) return reject(err);
                
                const followingQuery = 'SELECT * FROM fan_shop_teams WHERE fan_shop_league_id = ?';
                db.query(followingQuery, [item.id], (err, following) => {
                    if (err) return reject(err);
                    resolve({ ...item, apparel, following });
                });
            });
        }));

        Promise.all(itemPromises)
            .then(results => res.status(200).json({ fan_shop_leagues: results }))
            .catch(error => res.status(500).json({ message: "Error fetching full items data", error }));
    });
});


const getAllLeaguesByUser = asyncHandler(async (req, res) => {
    const { user_id } = req.body; // Retrieve user_id from query parameters

    if (!user_id) {
        return res.status(400).json({ message: "User ID is required to check following status" });
    }

    const itemsQuery = 'SELECT * FROM fan_shop_leagues';
    db.query(itemsQuery, (err, leagues) => {
        if (err) return res.status(500).json({ message: "Error fetching leagues", error: err });

        const leaguePromises = leagues.map(league => new Promise((resolve, reject) => {
            const apparelQuery = 'SELECT * FROM fan_shop_apparels WHERE fan_shop_league_id = ?';
            db.query(apparelQuery, [league.id], (err, apparel) => {
                if (err) return reject(err);

                const followingQuery = `
                    SELECT 
                        fan_shop_teams.*,
                        CASE WHEN fan_shop_followers.user_id IS NOT NULL THEN true ELSE false END AS is_following
                    FROM fan_shop_teams
                    LEFT JOIN fan_shop_followers 
                        ON fan_shop_teams.id = fan_shop_followers.fan_shop_team_id 
                        AND fan_shop_followers.user_id = ?
                    WHERE fan_shop_teams.fan_shop_league_id = ?
                `;

                db.query(followingQuery, [user_id, league.id], (err, teams) => {
                    if (err) return reject(err);

                    resolve({ ...league, apparel, following: teams });
                });
            });
        }));

        Promise.all(leaguePromises)
            .then(results => res.status(200).json({ fan_shop_leagues: results }))
            .catch(error => res.status(500).json({ message: "Error fetching full leagues data", error }));
    });
});



// POST Controllers
// Create a new fan_shop_league
const createFanShopLeague = asyncHandler(async (req, res) => {
    const { name, logo } = req.body;
  
    if (!name || !logo) {
      return res.status(400).json({ message: "Name and logo are required" });
    }
  
    try {
      const uploadResult = await uploadCloudinaryBase64(logo, "assets");
      const query =
        "INSERT INTO fan_shop_leagues (name, logo, logo_id) VALUES (?, ?, ?)";
      db.query(query, [name, uploadResult.url, uploadResult.public_id], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Error creating league", error: err });
        }
        res.status(201).json({ message: "League created successfully", league_id: result.insertId });
      });
    } catch (error) {
      console.error("Cloudinary error:", error);
      return res.status(500).json({ message: "Error uploading logo", error: error.message });
    }
  });
  
  // Create a new fan_shop_apparels
  const createFanShopApparel = asyncHandler(async (req, res) => {
    const { fan_shop_league_id, name, image, rating, price, discount } = req.body;
  
    if (!fan_shop_league_id || !name || !image) {
      return res.status(400).json({ message: "League ID, name, and image are required" });
    }
  
    try {
      const uploadResult = await uploadCloudinaryBase64(image, "fan_shop_apparels");
      const query =
        "INSERT INTO fan_shop_apparels (fan_shop_league_id, name, image, image_id, rating, price, discount) VALUES (?, ?, ?, ?, ?, ?, ?)";
      db.query(
        query,
        [
          fan_shop_league_id,
          name,
          uploadResult.url,
          uploadResult.public_id,
          rating || null,
          price || 0,
          discount || 0,
        ],
        (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error creating apparel", error: err });
          }
          res.status(201).json({ message: "Apparel created successfully", apparel_id: result.insertId });
        }
      );
    } catch (error) {
      console.error("Cloudinary error:", error);
      return res.status(500).json({ message: "Error uploading image", error: error.message });
    }
  });
  
  // Create a new fan_shop_teams
  const createFanShopTeam = asyncHandler(async (req, res) => {
    const { fan_shop_league_id, name, image } = req.body;
  
    if (!fan_shop_league_id || !name || !image) {
      return res.status(400).json({ message: "League ID, name, and image are required" });
    }
  
    try {
      const uploadResult = await uploadCloudinaryBase64(image, "fan_shop_teams");
      const query =
        "INSERT INTO fan_shop_teams (fan_shop_league_id, name, image, image_id) VALUES (?, ?, ?, ?)";
      db.query(query, [fan_shop_league_id, name, uploadResult.url, uploadResult.public_id], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Error creating team", error: err });
        }
        res.status(201).json({ message: "Team created successfully", team_id: result.insertId });
      });
    } catch (error) {
      console.error("Cloudinary error:", error);
      return res.status(500).json({ message: "Error uploading image", error: error.message });
    }
  });

// PATCH Controllers
// Update fan_shop_league
const updateFanShopLeague = asyncHandler(async (req, res) => {
    const { id, name, logo, logo_id } = req.body;

    if (!id) {
        return res.status(400).json({ message: "League ID is required" });
    }

    // Handle logo update
    let newLogo = null;
    let newLogoId = null;

    if (logo) {
        // Delete the old logo from Cloudinary if logo_id is provided
        if (logo_id) {
            try {
                await deleteFromCloudinary(logo_id);
            } catch (error) {
                return res.status(500).json({ message: "Failed to delete old logo", error: error.message });
            }
        }

        // Upload the new logo to Cloudinary
        try {
            const uploadResult = await uploadCloudinaryBase64(logo, "fan_shop_leagues");
            newLogo = uploadResult.url;
            newLogoId = uploadResult.public_id;
        } catch (error) {
            return res.status(500).json({ message: "Failed to upload new logo", error: error.message });
        }
    }

    // Update the database
    const query = `
        UPDATE fan_shop_leagues 
        SET 
            name = COALESCE(?, name),
            logo = COALESCE(?, logo),
            logo_id = COALESCE(?, logo_id)
        WHERE id = ?
    `;
    db.query(query, [name, newLogo, newLogoId, id], (err) => {
        if (err) {
            return res.status(500).json({ message: "Error updating league", error: err });
        }
        res.status(200).json({ message: "League updated successfully" });
    });
});

// Update fan_shop_apparel
const updateFanShopApparel = asyncHandler(async (req, res) => {
    const { id, name, image, image_id, rating, price, discount } = req.body;

    if (!id) {
        return res.status(400).json({ message: "Apparel ID is required" });
    }

    // Handle image update
    let newImage = null;
    let newImageId = null;

    if (image) {
        // Delete the old image from Cloudinary if image_id is provided
        if (image_id) {
            try {
                await deleteFromCloudinary(image_id);
            } catch (error) {
                return res.status(500).json({ message: "Failed to delete old image", error: error.message });
            }
        }

        // Upload the new image to Cloudinary
        try {
            const uploadResult = await uploadCloudinaryBase64(image, "fan_shop_apparels");
            newImage = uploadResult.url;
            newImageId = uploadResult.public_id;
        } catch (error) {
            return res.status(500).json({ message: "Failed to upload new image", error: error.message });
        }
    }

    // Update the database
    const query = `
        UPDATE fan_shop_apparels
        SET 
            name = COALESCE(?, name),
            image = COALESCE(?, image),
            image_id = COALESCE(?, image_id),
            rating = COALESCE(?, rating),
            price = COALESCE(?, price),
            discount = COALESCE(?, discount)
        WHERE id = ?
    `;
    db.query(query, [name, newImage, newImageId, rating, price, discount, id], (err) => {
        if (err) {
            return res.status(500).json({ message: "Error updating apparel", error: err });
        }
        res.status(200).json({ message: "Apparel updated successfully" });
    });
});


//PATCH CONTROLLERS
// Update fan_shop_team
const updateFanShopTeam = asyncHandler(async (req, res) => {
    const { id, name, image, image_id } = req.body;

    if (!id) {
        return res.status(400).json({ message: "Team ID is required" });
    }

    // Handle image update
    let newImage = null;
    let newImageId = null;

    if (image) {
        // Delete the old image from Cloudinary if image_id is provided
        if (image_id) {
            try {
                await deleteFromCloudinary(image_id);
            } catch (error) {
                return res.status(500).json({ message: "Failed to delete old image", error: error.message });
            }
        }

        // Upload the new image to Cloudinary
        try {
            const uploadResult = await uploadCloudinaryBase64(image, "fan_shop_teams");
            newImage = uploadResult.url;
            newImageId = uploadResult.public_id;
        } catch (error) {
            return res.status(500).json({ message: "Failed to upload new image", error: error.message });
        }
    }

    // Update the database
    const query = `
        UPDATE fan_shop_teams
        SET 
            name = COALESCE(?, name),
            image = COALESCE(?, image),
            image_id = COALESCE(?, image_id)
        WHERE id = ?
    `;
    db.query(query, [name, newImage, newImageId, id], (err) => {
        if (err) {
            return res.status(500).json({ message: "Error updating team", error: err });
        }
        res.status(200).json({ message: "Team updated successfully" });
    });
});

// Record a user following a fan_shop_teams entry
const followFanShopTeam = asyncHandler(async (req, res) => {
    const { user_id, fan_shop_team_id } = req.body;

    if (!user_id || !fan_shop_team_id) {
        return res.status(400).json({ message: "User ID and Team ID are required" });
    }

    // Check if the user exists
    const userCheckQuery = 'SELECT id FROM users WHERE id = ?';
    db.query(userCheckQuery, [user_id], (err, userResults) => {
        if (err) {
            return res.status(500).json({ message: "Error checking user existence", error: err });
        }
        if (userResults.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the team exists
        const teamCheckQuery = 'SELECT id FROM fan_shop_teams WHERE id = ?';
        db.query(teamCheckQuery, [fan_shop_team_id], (err, teamResults) => {
            if (err) {
                return res.status(500).json({ message: "Error checking team existence", error: err });
            }
            if (teamResults.length === 0) {
                return res.status(404).json({ message: "Team not found" });
            }

            // Proceed with follow/unfollow logic
            const checkQuery = 'SELECT * FROM fan_shop_followers WHERE user_id = ? AND fan_shop_team_id = ?';
            db.query(checkQuery, [user_id, fan_shop_team_id], (err, results) => {
                if (err) {
                    return res.status(500).json({ message: "Error checking follow status", error: err });
                }

                if (results.length > 0) {
                    // User is already following, unfollow
                    const unfollowQuery = 'DELETE FROM fan_shop_followers WHERE user_id = ? AND fan_shop_team_id = ?';
                    db.query(unfollowQuery, [user_id, fan_shop_team_id], (err) => {
                        if (err) {
                            return res.status(500).json({ message: "Error unfollowing team", error: err });
                        }
                        return res.status(200).json({ message: "Unfollowed team successfully" });
                    });
                } else {
                    // User is not following, follow
                    const followQuery = 'INSERT INTO fan_shop_followers (user_id, fan_shop_team_id) VALUES (?, ?)';
                    db.query(followQuery, [user_id, fan_shop_team_id], (err) => {
                        if (err) {
                            return res.status(500).json({ message: "Error following team", error: err });
                        }
                        return res.status(201).json({ message: "Followed team successfully" });
                    });
                }
            });
        });
    });
});




// Controller to add an apparel item to the cart
const addApparelToCart = asyncHandler(async (req, res) => {
    const { user_id, apparel_id, quantity, size, colors } = req.body;

    // Validate that essential fields are provided
    if (!user_id || !apparel_id || !quantity) {
        return res.status(400).json({ message: "User ID, apparel ID, and quantity are required" });
    }

    // Query to retrieve the selected apparel item details
    const apparelQuery = 'SELECT * FROM fan_shop_apparels WHERE id = ?';
    db.query(apparelQuery, [apparel_id], (err, apparelResults) => {
        if (err) return res.status(500).json({ message: "Error fetching apparel item", error: err });
        if (apparelResults.length === 0) return res.status(404).json({ message: "Apparel item not found" });

        // Apparel item details
        const apparel = apparelResults[0];
        const { name, image, price, rating } = apparel;

        // Insert query to add the apparel item to the cart
        const insertCartQuery = `
            INSERT INTO cart 
            (user_id, title, images, price, categoryId, rating, quantity, size, colors)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Execute the query to add the item to the cart
        db.query(insertCartQuery, 
            [
                user_id,
                name,
                image,
                price,
                apparel.fan_shop_league_id, // Assuming categoryId refers to league ID
                rating,
                quantity,
                size || null, // Optional size
                colors || null // Optional colors
            ], 
            (err, result) => {
                if (err) return res.status(500).json({ message: "Error adding item to cart", error: err });
                res.status(201).json({ message: "Item added to cart successfully", cart_id: result.insertId });
            }
        );
    });
});





module.exports = {
    getFanShopLeagues,
    getFanShopApparels,
    getFanShopTeams,
    getAllLeaguesByAdmin,
    getAllLeaguesByUser,
    createFanShopLeague,
    createFanShopApparel,
    createFanShopTeam,
    getFanShopFollowing,
    updateFanShopLeague,
    updateFanShopApparel,
    updateFanShopTeam,
    followFanShopTeam,
    addApparelToCart
};
