const express = require('express');
const router = express.Router();
const userModel = require('../model/user');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// User registration
router.post('/register', async (req, res) => {
try {
const { username,password,username_en,id_user ,image_url} = req.body;
const hashedPassword = await bcrypt.hash(password, 10);
const user = new userModel({ username, password: hashedPassword,username_en,id_user,image_url });
await user.save();
res.status(201).json({ message: 'User registered successfully' });
} catch (error) {
res.status(500).json({ error: 'Registration failed' });
}
});

// User login
router.post('/login', async (req, res) => {
try {
const { username, password } = req.body;
const user = await userModel.findOne({ username });
if (!user) {
    return res.status(401).json({ error: 'Authentication failed' });
}
const passwordMatch = await bcrypt.compare(password, user.password);
if (!passwordMatch) {
    return res.status(401).json({ error: 'Authentication failed' });
}
const token = jwt.sign({ userId: user._id }, 'your-secret-key', {
    expiresIn: '1h',
});
    res.status(200).json({status:true,message:"login successfully",token: token,});
} catch (error) {
    res.status(500).json({ error: 'Login failed' });
}
});


// User registration
router.get('/list', async (req, res) => {
    try {
        userModel.find({})
        .sort({ createdAt: -1 }) // Sort by createdAt in descending order
        .limit(40) // Limit the results to 15 records
        .exec(function (err, data) {
          if (err) {
            console.log(err);
            res.status(500).send({ "status": false, "message": "An error occurred" });
          } else {
            if (data == null || data.length == 0) {
              res.send({ "status": false, "message": "find list user fail", "totalResult": null, "data": data });
            } else {
              res.send({ "status": true, "message": "find list user success", "totalResult": data.length, "data": data });
            }
          }
        });
    // res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
    }
    });
 
// User registration with pagination
router.get('/list/paging', async (req, res) => {
  const { start = 0, limit = 10 } = req.query;

  try {
      userModel.find({})
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .skip(parseInt(start))    // Skip records based on the 'start' parameter
      .limit(parseInt(limit))   // Limit the results to the 'limit' parameter
      .exec(function (err, data) {
        if (err) {
          console.log(err);
          res.status(500).send({ "status": false, "message": "An error occurred" });
        } else {
          if (data == null || data.length == 0) {
            res.send(data );
          } else {
            res.send(data);
          }
        }
      });
  // res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
  res.status(500).json({ error: 'Registration failed' });
  }
  });   
    
    
    //UPDATE user by _id
    router.put('/update/:id', async (req, res) => {
        try {
          const userId = req.params.id;
          const { username, password, username_en, id_user,image_url } = req.body;
      
          // Check if the user exists
          const existingUser = await userModel.findById(userId);
          if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
          }
      
          // Update user fields
          existingUser.username = username || existingUser.username;
          existingUser.username_en = username_en || existingUser.username_en;
          existingUser.id_user = id_user || existingUser.id_user;
          existingUser.image_url = image_url || existingUser.image_url;
      
          // Update password if provided
          if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            existingUser.password = hashedPassword;
          }
      
          // Save the updated user
          await existingUser.save();
      
          res.status(200).json({ status: true, message: 'User updated successfully' });
        } catch (error) {
          res.status(500).json({ error: 'Update failed' });
        }
});



// User delete by _id
router.delete('/delete/:id', async (req, res) => {
    try {
      const userId = req.params.id;
  
      // Check if the user exists
      const existingUser = await userModel.findById(userId);
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Delete the user
      await existingUser.remove();
  
      res.status(200).json({ status: true, message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Delete failed' });
    }
});

module.exports = router;