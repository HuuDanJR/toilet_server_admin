var express = require('express')
var morgan = require('morgan');
var app = express();
var path = require('path')
const mongoose = require('mongoose');
var cors = require('cors');
var router = express.Router();
var crypto = require('crypto')
app.use(express.json());
const fs = require('fs');
app.use(express.urlencoded({ extended: true }));
const logStream = fs.createWriteStream('log.txt', { flags: 'a' });
app.use(morgan('tiny'));
app.use(morgan(':method :url :status :response-time ms - :res[content-length]', { stream: logStream }));
app.use(cors({
  origin: '*'
}));

app.use('/', router);

var port = process.env.PORT || 8080;
app.listen(port);
console.log('app running at port toilet server: ' + port);


const path = require('path');
const indexPath = path.join(__dirname, 'src', 'index.js');
const indexModule = require(indexPath);




//connect mongoDB
var config = require('./config')
config.connectDB()


app.get('/', function (req, res) {
  res.end('index page - toilet server');
})

app.use(express.static('web/web'));
app.use(express.static('web/web/assets'));


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