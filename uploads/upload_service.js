//IMAGE UPLOAD
const upload = require('./upload')
const config = require('./config')
const MongoClient = require("mongodb").MongoClient;
const url = config.URL;
const mongoClient = new MongoClient(url);
const Image = require('../model/image');
const GridFSBucket = require("mongodb").GridFSBucket;
const mongoose = require('mongoose');
const path = require('path'); // Import the path module



//   // Create a mongoose model for the GridFS collection
// const GridFile = mongoose.model('GridFile',  mongoose.Schema({}, { strict: true }), 'photos.files');
// const GridFileChunk = mongoose.model('GridFileChunk',  mongoose.Schema({}, { strict: true }), 'photos.chunks');

// // Define a function to remove a file from GridFS
// function removeFile(filename) {
//   return GridFile.findOne({ filename: filename }).then(file => {
//     if (!file) {
//       return false; // File does not exist
//     }else{console.log('have files');}
//     return GridFile.deleteOne({ _id: file._id }).then(() => {
//       return GridFileChunk.deleteMany({ files_id: file._id }).then(() => {
//         return true; // File deleted successfully
//       });
//     });
//   });
// }

// // Define a function to check if a file with the given filename exists in GridFS
// function checkFileExists(filename) {
//   return GridFile.findOne({ filename: filename }).then(file => {
//     return !!file;
//   });
// }



async function uploadFiles  (req, res)  {
  let url,url2;
  try {
    await upload(req, res);
    // console.log(req.file);
    if (req.file == undefined) {
      return res.send({
        message: "You must select a file.",
      });
    }
    url = `${config.baseUrl+req.file.filename}`;
    //remove duplicate item here
    const body =({
    "message":"File has been uploaded",
    "data":{
      url
    }
    //update mongo data uer here
  })
    return res.send(body);
  } catch (error) {
    console.log(error);
    return res.send({
      message: "Error when trying upload image: ${error}",
    });
  }

};

const uploadFilesBody = async (req, res) => {
  try {
   await Image.findOne({ caption: req.body.caption })
      .then((image) => {
        if (image) {
          return res.status(200).json({
            success: false,
            message: 'Image already exists',
          });
        }
        let imagebody = new Image({
          caption: req.body.caption,
          filename: req.file.filename,
          fileId: req.file.id,
        });
        imagebody.save()
          .then((image) => {
            return res.status(200).json({
              success: true,
              image,
            });
          }).catch(err => res.status(500).json(err));
      })
      .catch(err => res.status(500).json(`${err}`));
  } catch (error) {
    console.log(`error:${error}`);
  }
}

const getListFiles = async (req, res) => {
  try {
    await mongoClient.connect();
    const database = mongoClient.db(config.database);
    const images = database.collection(config.imgBucket + ".files");
    const cursor = images.find({

    });
    if ((await cursor.count()) === 0) {
      return res.status(500).send({
        message: "No files found!",
      });
    }
    let fileInfos = [];
    await cursor.forEach((doc) => {
      fileInfos.push({
        name: doc.filename,
        url: config.baseUrl + doc.filename,
      });
    });
    return res.status(200).send(fileInfos);
  
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

const download = async (req, res) => {
  try {
    await mongoClient.connect();
    const database = mongoClient.db(config.database);
    const bucket = new GridFSBucket(database, {
      bucketName: config.imgBucket,
    });
    
    let downloadStream = bucket.openDownloadStreamByName(req.params.name);
    // Set response headers
    const fileExtension = path.extname(req.params.name).toLowerCase();
    let contentType = 'image/jpeg'; // Default content type
    if (fileExtension === '.png') {
      contentType = 'image/png';
    }
    res.set('Content-Type', contentType);
    // res.set('Content-Type', 'image/jpeg'); // Adjust content type as per your image format
    
    downloadStream.on("data", function (data) {
      return res.status(200).write(data);
    });
    downloadStream.on("error", function (err) {
      return res.status(404).send({ message: "Cannot download the Image!" });
    });
    downloadStream.on("end", () => {
      return res.end();
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

// const download = async (req, res) => {
//     try {
//       await mongoClient.connect();
//       const database = mongoClient.db(config.database);
//       const bucket = new GridFSBucket(database, {
//         bucketName: config.imgBucket,
//       });
      
//       let downloadStream = bucket.openDownloadStreamByName(req.params.name);
  
//       // Determine content type based on file extension
//       const fileExtension = path.extname(req.params.name).toLowerCase();
//       let contentType = 'application/octet-stream'; // Default content type
//       switch (fileExtension) {
//         case '.jpg':
//         case '.jpeg':
//           contentType = 'image/jpeg';
//           break;
//         case '.png':
//           contentType = 'image/png';
//           break;
//         // Add more cases for other image formats if needed
//       }
//       res.set('Content-Type', contentType);
  
//       let fileData = Buffer.alloc(0); // Accumulate file data
  
//       downloadStream.on("data", function (data) {
//         fileData = Buffer.concat([fileData, data]); // Append data to buffer
//       });
//       downloadStream.on("error", function (err) {
//         return res.status(404).send({ message: "Cannot download the Image!" });
//       });
//       downloadStream.on("end", () => {
//         res.write(fileData); // Write accumulated file data to response
//         return res.end();
//       });
//     } catch (error) {
//       return res.status(500).send({
//         message: error.message,
//       });
//     }
//   };


module.exports = {
  uploadFiles: uploadFiles,
  getListFiles: getListFiles,
  download: download,
  uploadFilesBody: uploadFilesBody,
  // checkFileExists:checkFileExists,
  // removeFile:removeFile,
}