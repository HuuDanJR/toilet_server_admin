var express = require('express')
var morgan = require('morgan');
var app = express();
var path = require('path')
const mongoose = require('mongoose');
var cors = require('cors');
var router = express.Router();
app.use(express.json());
var crypto = require('crypto')
const fs = require('fs');
const bodyparser = require('body-parser');

app.use(express.urlencoded({ extended: true }));
app.use(bodyparser.json())
const logStream = fs.createWriteStream('log.txt', { flags: 'a' });
app.use(morgan('tiny'));
app.use(morgan(':method :url :status :response-time ms - :res[content-length]', { stream: logStream }));
app.use(cors({
  origin: '*'
}));
const axios = require('axios');


app.use('/', router);
var port = process.env.PORT || 8080;
app.listen(port);
console.log('app running at port toilet server: ' + port);

//connect mongoDB
var config = require('./config')
config.connectDB()

//APIs home
app.get('/', function (req, res) {
  res.end('index page - toilet server');
})

//WEB RESOURCE
app.use(express.static('web/web'));
app.use(express.static('web/web/assets'));


//FIREBASE 
var admin = require('./firebase_config');
const notification_options = {
  priority: "high",
  timeToLive: 60 * 60 * 24
};
const { getMessaging } =require("firebase-admin/messaging");
const serverKey = 'AAAA4zxFWx4:APA91bHtA8m3hXdBsBGHSkHnpzI4aFSFmplU_PP3MCFPs24NFeP-aFaED0cxtTvWZ6NyGW1K6qYlIpNEo_8nrA4y693wFCYM86zQ4EiNzPvwo0C46BJSpGsJZDlrMVMBLw6Wh_CiQ1T7'; // Replace with your FCM server key
const { formatDatetime, getCurrentDatetime } = require('./datetimeUtils');
const tokenModel = require('./model/token')


app.post('/firebase/notification/all', async (req, res) => {
  try {
    const tokens = await tokenModel.find({}).exec();

    if (!tokens || tokens.length === 0) {
      return res.send({ "status": false, "message": "No tokens found" });
    }

    const message = req.body.message;
    const title = req.body.title || 'Default Title';
    const body = req.body.body || 'Default Body';
    const data = req.body.data || {};
    const datetime = getCurrentDatetime();
    const options = notification_options;
    const star = req.body.star;
    const feedback = req.body.feedback;

    const payload = {
      data: {
        message: message,
        datetime: datetime,
        star: star,
        feedback: JSON.stringify(feedback),
      },
      notification: {
        title: title,
        body: body,
        sound: "iphone_notification.aiff"
      },
    };

    if (!payload.data && !payload.notification) {
      return res.status(400).send("Invalid payload. Must have 'data' or 'notification'.");
    }

    const sendNotifications = tokens.map(async (token) => {
      try {
        await admin.admin_role.messaging().sendToDevice(token.value, payload, options);
        console.log(`Notification sent successfully to ${token.value}`);
      } catch (error) {
        console.error(`Error sending notification to ${token.value}:`, error);
      }
    });

    await Promise.all(sendNotifications);

    res.status(200).send("Notifications sent successfully to all tokens");
  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(500).send("Error fetching tokens");
  }
});





app.post('/firebase/notification', (req, res) => {
  const registrationToken = req.body.registrationToken;
  const message = req.body.message;
  const title = req.body.title || 'Default Title'; // Default title if not provided
  const body = req.body.body || 'Default Body'; // Default body if not provided
  const data = req.body.data || {}; // Default empty object for data
  const datetime =  getCurrentDatetime(); // Format or use current datetime if not provided
  const options = notification_options;
  const star = req.body.star;
  const feedback = req.body.feedback;

  const payload = {
    data: {
      message: message,
      datetime: datetime, // Include datetime in data
      star:star,
      feedback:JSON.stringify(feedback),
    },
    notification: {
      title: title,
      body: body,
    },
  };

  // Check if the payload has either "data" or "notification" property
  if (!payload.data && !payload.notification) {
    return res.status(400).send("Invalid payload. Must have 'data' or 'notification'.");
  }

  admin.admin_role.messaging().sendToDevice(registrationToken, payload, options)
    .then(response => {
      console.log('Notification sent successfully:', response);
      res.status(200).send("Notification sent successfully");
    })
    .catch(error => {
      console.error('Error sending notification:', error);
      res.status(500).send("Error sending notification");
    });
});




//NOT WORK
app.post('/firebase/notification2', async (req, res) => {
  const deviceToken = req.body.registrationToken;
  const message = req.body.message;

  const notificationData = {
    to: deviceToken,
    notification: {
      title: 'Notification Title',
      body: 'Notification Body',
    },
    data: {
      message: message,
    },
  };

  try {
    const response = await axios.post('https://fcm.googleapis.com/fcm/send', notificationData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${serverKey}`,
      },
    });

    console.log('Notification sent successfully:', response.data);
    res.status(200).json({ success: true, message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error.message);
    res.status(500).json({ success: false, message: 'Error sending notification' });
  }
});













app.post("/send", function (req, res) {
  const receivedToken = req.body.fcmToken;
  
  const message = {
    notification: {
      title: "Notif",
      body: 'This is a Test Notification'
    },
    token: "YOUR FCM TOKEN HERE",
  };
  
  getMessaging()
    .send(message)
    .then((response) => {
      res.status(200).json({
        message: "Successfully sent message",
        token: receivedToken,
      });
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      res.status(400);
      res.send(error);
      console.log("Error sending message:", error);
    });
});







































const feedbackModel = require('./model/feedback')
// //create feedback
app.post('/create_feedback', async (req, res) => {
  const id_string = generateId(4);
  try {
    let feedback = new feedbackModel({
      "id": id_string,
      "driver": req.body.driver,
      "star": req.body.star,
      "content": req.body.content,
      "experience": req.body.experience,
      "createdAt": req.body.createdAt,
    });
    feedbackModel.findOne({ id: feedback.id }, async function (err, data) {
      if (err) {
        console.log(err);
      }
      else {
        if (data != null) {
          res.send({ "status": false, "message": "fail create feedback", "data": null });
        } else {
          feedback.save(function (err, data) {
            if (err) {
              console.log(err)
            } else {
              console.log(err)
            }
          });
          res.send({ "status": true, "message": 'Created feedback, Thank You! ', "data": feedback });
        }
      }
    });
  } catch (error) {
    res.status(500).send({ message: `error ${message} ${error}` });
  }
});

app.put('/update_feedback', async (req, res) => {
  try {
    const feedbackID = req.body.id; // Assuming you have a field to specify the feedback ID in the request body
    // Create a new tripData object with the updated values
    const updatedTripData = tripModel({
      "driver": req.body.driver,
      "customer_name": req.body.customer_name,
      "customer_number": req.body.customer_number,
      "from": req.body.from,
      "to": req.body.to,
      "feedback_id": feedbackID,
      "createdAt": req.body.createdAt,
    });

    // Find the feedback document by its ID
    feedbackModel.findOne({ id: feedbackID }, async function (err, feedback) {
      if (err) {
        console.log(err);
        res.status(500).send({ message: `Error finding feedback: ${err}` });
      } else {
        if (!feedback) {
          res.send({ "status": false, "message": "No feedback found with the specified ID", "data": null });
          return;
        }

        // Update the feedback's trip information
        feedback.trip = updatedTripData;

        // Create a new tripModel instance with the updatedTripData
        const updatedTripModel = new tripModel(updatedTripData);

        // Save the updated tripModel
        updatedTripModel.save(async (err, savedTripModel) => {
          if (err) {
            console.log(err);
            res.status(500).send({ message: `Error updating trip: ${err}` });
          } else {
            // Save the updated feedback
            feedback.save((err, updatedFeedback) => {
              if (err) {
                console.log(err);
                res.status(500).send({ message: `Error updating feedback: ${err}` });
              } else {
                res.send({ "status": true, "message": 'Updated trip information successfully', "data": updatedFeedback });
              }
            });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: `Error: ${error}` });
  }
});

app.get('/list_feedback', async (req, res) => {
  feedbackModel.find({})
    .sort({ createdAt: -1 }) // Sort by createdAt in descending order
    .limit(15) // Limit the results to 15 records
    .exec(function (err, data) {
      if (err) {
        console.log(err);
        res.status(500).send({ "status": false, "message": "An error occurred" });
      } else {
        if (data == null || data.length == 0) {
          res.send({ "status": false, "message": "find list feedback fail", "totalResult": null, "data": data });
        } else {
          res.send({ "status": true, "message": "find list feedback success", "totalResult": data.length, "data": data });
        }
      }
    });
});








function generateId(length) {
  const id = crypto.randomBytes(length).toString('hex');
  return typeof id === 'string' ? id : '';
}





















app.post('/get_trip_by_id', async (req, res) => {
  try {
    const objectIdString = req.body.objectId; // Get the ObjectId string from the request body

    // Use mongoose.Types.ObjectId to convert the string into an ObjectId
    const objectId = mongoose.Types.ObjectId(objectIdString);

    // Find the tripData by its ObjectId
    tripModel.findById(objectId, (err, tripData) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: `Error finding tripData: ${err}` });
      } else {
        if (!tripData) {
          res.status(404).json({ message: 'No tripData found with the specified ObjectId' });
        } else {
          res.status(200).json({ message: 'Found tripData', data: tripData });
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: `Error: ${error}` });
  }
});






function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


function getFormattedTimestamp() {
  const timestamp = new Date().getTime(); // Get current timestamp
  // Format the timestamp
  const dateObj = new Date(timestamp);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(4, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  // Create formatted timestamp string
  const formattedTimestamp = `${day}-${month}-${year}_${hours}-${minutes}`;
  return formattedTimestamp;
}


function removeEmptyStringsFromArray(arr) {
  if (!Array.isArray(arr)) {
    throw new Error('Input is not an array.');
  }

  return arr.filter(item => typeof item === 'string' && item !== "" && item !== null);
}
function replaceEmptyStrings(arr, replacement) {
  if (!Array.isArray(arr)) {
    throw new Error('Input is not an array.');
  }

  return arr.map(item => {
    if (typeof item === 'string' && item.trim() === "") {
      return replacement;
    }
    return item;
  });
}


app.get('/list_token', async (req, res) => {
  tokenModel.find({})
    .sort({ createdAt: -1 }) // Sort by createdAt in descending order
    .limit(15) // Limit the results to 15 records
    .exec(function (err, data) {
      if (err) {
        console.log(err);
        res.status(500).send({ "status": false, "message": "An error occurred" });
      } else {
        if (data == null || data.length == 0) {
          res.send({ "status": false, "message": "find list tokens fail", "totalResult": null, "data": data });
        } else {
          res.send({ "status": true, "message": "find list tokens success", "totalResult": data.length, "data": data });
        }
      }
    });
});


// POST API to add a new token
app.post('/add_token', async (req, res) => {
  const { value, name } = req.body;

  if (!value || !name) {
    return res.status(400).json({ "status": false, "message": "Both 'value' and 'name' are required fields." });
  }

  // Check for duplicate token
  const existingToken = await tokenModel.findOne({ value });
  if (existingToken) {
    return res.status(409).json({ "status": false, "message": "Token with the provided 'value' already exists." });
  }

  const newToken = new tokenModel({ value, name });

  try {
    const savedToken = await newToken.save();
    res.status(201).json({ "status": true, "message": "Token added successfully", "data": savedToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ "status": false, "message": "Failed to add token", "error": error.message });
  }
});