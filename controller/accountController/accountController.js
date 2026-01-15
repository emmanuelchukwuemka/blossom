const db = require('../../Database/db');
const expressAsyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

// Get all accounts for user
const getAccounts = expressAsyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const accountsQuery = `
    SELECT ua.id, ua.account_type, ua.display_name, ua.email, ua.status, 
           ua.created_at, ua.updated_at
    FROM user_accounts ua
    WHERE ua.main_user_id = ?
    UNION
    SELECT u.id as id, 'main' as account_type, u.name as display_name, 
           u.email, u.status, u.created_at, u.updated_at
    from Users u
    WHERE u.id = ?
  `;

  db.query(accountsQuery, [userId, userId], (err, accounts) => {
    if (err) {
      console.error('Error fetching accounts:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch accounts'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        accounts
      }
    });
  });
});

// Link new account
const linkAccount = expressAsyncHandler(async (req, res) => {
  const mainUserId = req.user.id;
  const { email, account_type, display_name } = req.body;

  // Check if account already linked
  const checkLinkedQuery = `
    SELECT id FROM user_accounts 
    WHERE email = ? AND main_user_id = ?
  `;

  db.query(checkLinkedQuery, [email, mainUserId], (err, result) => {
    if (err) {
      console.error('Error checking linked account:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to link account'
      });
    }

    if (result.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Account already linked to your profile'
      });
    }

    // Create new linked account
    const insertAccountQuery = `
      INSERT INTO user_accounts (
        main_user_id, email, account_type, display_name, 
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'active', NOW(), NOW())
    `;

    db.query(insertAccountQuery, [mainUserId, email, account_type, display_name], (err, result) => {
      if (err) {
        console.error('Error linking account:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to link account'
        });
      }

      res.status(201).json({
        status: 'success',
        message: 'Account linked successfully',
        data: {
          accountId: result.insertId
        }
      });
    });
  });
});

// Unlink account
const unlinkAccount = expressAsyncHandler(async (req, res) => {
  const mainUserId = req.user.id;
  const { id } = req.params;

  // Check if account belongs to user
  const checkOwnershipQuery = `
    SELECT id FROM user_accounts 
    WHERE id = ? AND main_user_id = ?
  `;

  db.query(checkOwnershipQuery, [id, mainUserId], (err, result) => {
    if (err) {
      console.error('Error checking account ownership:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to unlink account'
      });
    }

    if (result.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to unlink this account'
      });
    }

    const deleteAccountQuery = `DELETE FROM user_accounts WHERE id = ?`;

    db.query(deleteAccountQuery, [id], (err, result) => {
      if (err) {
        console.error('Error unlinking account:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to unlink account'
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Account unlinked successfully'
      });
    });
  });
});

// Update account settings
const updateAccount = expressAsyncHandler(async (req, res) => {
  const mainUserId = req.user.id;
  const { id } = req.params;
  const updates = req.body;

  // Check if account belongs to user
  const checkOwnershipQuery = `
    SELECT id FROM user_accounts 
    WHERE id = ? AND main_user_id = ?
  `;

  db.query(checkOwnershipQuery, [id, mainUserId], (err, result) => {
    if (err) {
      console.error('Error checking account ownership:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to update account'
      });
    }

    if (result.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this account'
      });
    }

    // Build dynamic update query
    const allowedFields = ['display_name', 'account_type', 'status'];
    const updateFields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid fields to update'
      });
    }

    values.push(new Date()); // updated_at
    values.push(id); // WHERE clause

    const updateQuery = `UPDATE user_accounts SET ${updateFields.join(', ')}, updated_at = ? WHERE id = ?`;

    db.query(updateQuery, values, (err, result) => {
      if (err) {
        console.error('Error updating account:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to update account'
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Account updated successfully'
      });
    });
  });
});

// Get verification status
const getVerificationStatus = expressAsyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const verificationQuery = `
    SELECT uv.id, uv.user_id, uv.document_type, uv.document_url, 
           uv.status, uv.notes, uv.created_at, uv.updated_at
    FROM user_verification uv
    WHERE uv.user_id = ?
    ORDER BY uv.created_at DESC
  `;

  db.query(verificationQuery, [userId], (err, verifications) => {
    if (err) {
      console.error('Error fetching verification status:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch verification status'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        verifications
      }
    });
  });
});

// Submit verification documents
const submitVerification = expressAsyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { document_type, document_url, notes } = req.body;

  // Check if already submitted
  const checkExistingQuery = `
    SELECT id FROM user_verification 
    WHERE user_id = ? AND status = 'pending'
  `;

  db.query(checkExistingQuery, [userId], (err, result) => {
    if (err) {
      console.error('Error checking existing verification:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to submit verification'
      });
    }

    if (result.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Verification request already pending'
      });
    }

    const insertVerificationQuery = `
      INSERT INTO user_verification (
        user_id, document_type, document_url, status, notes, 
        created_at, updated_at
      ) VALUES (?, ?, ?, 'pending', ?, NOW(), NOW())
    `;

    db.query(insertVerificationQuery, [userId, document_type, document_url, notes], (err, result) => {
      if (err) {
        console.error('Error submitting verification:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to submit verification'
        });
      }

      res.status(201).json({
        status: 'success',
        message: 'Verification submitted successfully',
        data: {
          verificationId: result.insertId
        }
      });
    });
  });
});

// Get account permissions
const getAccountPermissions = expressAsyncHandler(async (req, res) => {
  const mainUserId = req.user.id;
  const { id } = req.params;

  // Check if account belongs to user
  const checkOwnershipQuery = `
    SELECT id FROM user_accounts 
    WHERE id = ? AND main_user_id = ?
  `;

  db.query(checkOwnershipQuery, [id, mainUserId], (err, result) => {
    if (err) {
      console.error('Error checking account ownership:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch permissions'
      });
    }

    if (result.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view this account'
      });
    }

    const permissionsQuery = `
      SELECT up.permission_name, up.description, up.enabled
      FROM user_permissions up
      WHERE up.account_id = ?
    `;

    db.query(permissionsQuery, [id], (err, permissions) => {
      if (err) {
        console.error('Error fetching permissions:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to fetch permissions'
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          permissions
        }
      });
    });
  });
});

// Update account permissions
const updateAccountPermissions = expressAsyncHandler(async (req, res) => {
  const mainUserId = req.user.id;
  const { id } = req.params;
  const { permissions } = req.body;

  // Check if account belongs to user
  const checkOwnershipQuery = `
    SELECT id FROM user_accounts 
    WHERE id = ? AND main_user_id = ?
  `;

  db.query(checkOwnershipQuery, [id, mainUserId], (err, result) => {
    if (err) {
      console.error('Error checking account ownership:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to update permissions'
      });
    }

    if (result.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this account'
      });
    }

    // Clear existing permissions
    const clearPermissionsQuery = `DELETE FROM user_permissions WHERE account_id = ?`;
    
    db.query(clearPermissionsQuery, [id], (err, result) => {
      if (err) {
        console.error('Error clearing permissions:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to update permissions'
        });
      }

      if (!permissions || permissions.length === 0) {
        return res.status(200).json({
          status: 'success',
          message: 'Permissions updated successfully'
        });
      }

      // Insert new permissions
      const insertPermissionPromises = permissions.map(permission => {
        return new Promise((resolve, reject) => {
          const insertPermissionQuery = `
            INSERT INTO user_permissions (
              account_id, permission_name, description, enabled, 
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, NOW(), NOW())
          `;
          
          db.query(
            insertPermissionQuery, 
            [id, permission.name, permission.description, permission.enabled],
            (err, result) => {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
            }
          );
        });
      });

      Promise.all(insertPermissionPromises)
        .then(() => {
          res.status(200).json({
            status: 'success',
            message: 'Permissions updated successfully'
          });
        })
        .catch(err => {
          console.error('Error inserting permissions:', err);
          res.status(500).json({
            status: 'error',
            message: 'Failed to update permissions'
          });
        });
    });
  });
});

module.exports = {
  getAccounts,
  linkAccount,
  unlinkAccount,
  updateAccount,
  getVerificationStatus,
  submitVerification,
  getAccountPermissions,
  updateAccountPermissions
};