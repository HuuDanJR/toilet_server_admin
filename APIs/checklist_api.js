const express = require('express');
const router = express.Router();
const checkListModel = require('../model/checklist');

// Create new checklist
router.post('/create', async (req, res) => {
    try {
      const { title, body, username, username_en, is_finish, createAt, updateAt } = req.body;
      // Check if a checklist with the same title and username already exists
      const existingChecklist = await checkListModel.findOne({title, body, username, username_en, is_finish, createAt, updateAt});
      if (existingChecklist) {
        return res.status(409).json({ error: 'Checklist with the same title and username already exists' });
      }
  
      // Create and save the new checklist
      const newChecklist = new checkListModel({ title, body, username, username_en, is_finish, createAt, updateAt });
      await newChecklist.save();
  
      res.status(201).json({status:true, message: 'CheckList created successfully',data:newChecklist });
    } catch (error) {
      res.status(500).json({ error: 'Checklist creation failed' });
    }
  });
//List CheckList
router.get('/list', async (req, res) => {
    try {
        checkListModel.find({})
        .sort({ createdAt: -1 }) // Sort by createdAt in descending order
        // .limit(15) // Limit the results to 15 records
        .exec(function (err, data) {
          if (err) {
            console.log(err);
            res.status(500).send({ "status": false, "message": "An error occurred" });
          } else {
            if (data == null || data.length == 0) {
              res.status(200).json({ "status": false, "message": "find list checklist fail", "totalResult": null, "data": data });
            } else {
              res.json({ "status": true, "message": "find checklist user success", "totalResult": data.length, "data": data });
            }
          }
        });
    } catch (error) {
    res.status(500).json({ error: 'get list checklist failed' });
    }
});
// List CheckList with Pagination
router.get('/list/paging', async (req, res) => {
  try {
      const { start = 0, limit = 10 } = req.query;

      checkListModel.find({})
          .sort({ createdAt: -1 }) // Sort by createdAt in descending order
          .skip(parseInt(start))    // Skip records based on the 'start' parameter
          .limit(parseInt(limit))   // Limit the results to the 'limit' parameter
          .exec(function (err, data) {
              if (err) {
                  console.log(err);
                  res.status(500).send({ "status": false, "message": "An error occurred" });
              } else {
                  if (data == null || data.length == 0) {
                      res.status(200).json({ "status": false, "message": "find list checklist fail", "totalResult": null, "data": data });
                  } else {
                      res.json({ "status": true, "message": "find checklist user success", "totalResult": data.length, "data": data });
                  }
              }
          });
  } catch (error) {
      res.status(500).json({ error: 'get list checklist failed' });
  }
});    
router.get('/list_simple/paging', async (req, res) => {
  try {
      const { start = 0, limit = 10 } = req.query;
      checkListModel.find({})
          .sort({ createdAt: -1 }) // Sort by createdAt in descending order
          .skip(parseInt(start))    // Skip records based on the 'start' parameter
          .limit(parseInt(limit))   // Limit the results to the 'limit' parameter
          .exec(function (err, data) {
              if (err) {
                  console.log(err);
                  res.status(500).send({ "status": false, "message": "An error occurred" });
              } else {
                  if (data == null || data.length == 0) {
                      res.status(200).json([]);
                  } else {
                      res.json( data );
                  }
              }
          });
  } catch (error) {
      res.status(500).json({ error: 'get list checklist failed' });
  }
});
    
    
//UPDATE user by _id
router.put('/update/:id', async (req, res) => {
        try {
          const checklistId = req.params.id;
          const { title,body,username, username_en,is_finish,updateAt } = req.body;
      
          // Check if the user exists
          const existingUser = await checkListModel.findById(checklistId);
          if (!existingUser) {
            return res.status(404).json({ error: 'Checklist not found' });
          }
      
          // Update user fields
          existingUser.username = username || existingUser.username;
          existingUser.username_en = username_en || existingUser.username_en;
          existingUser.title = title || existingUser.title;
          existingUser.body = body || existingUser.body;
          existingUser.title = is_finish || existingUser.is_finish;
          existingUser.updateAt = updateAt || existingUser.updateAt;
      
          // Save the updated user
          await existingUser.save();
      
          res.status(200).json({ status: true, message: 'Checklist updated successfully',data:existingUser });
        } catch (error) {
          res.status(500).json({ error: 'Update failed' });
        }
});



// User delete by _id
router.delete('/delete/:id', async (req, res) => {
    try {
      const checklistId = req.params.id;
  
      // Check if the user exists
      const existingUser = await checkListModel.findById(checklistId);
      if (!existingUser) {
        return res.status(404).json({ error: 'Checklist not found' });
      }
  
      // Delete the user
      await existingUser.remove();
  
      res.status(200).json({ status: true, message: 'Checklist deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Delete checklist failed' });
    }
});

module.exports = router;