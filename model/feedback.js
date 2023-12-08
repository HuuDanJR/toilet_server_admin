var mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const FeedBackSchema = new mongoose.Schema({
    id: {
        required: true,
        type: String,
    },
    driver:{
        required:true,type:String
    },
    
    star: {
        required: true,
        type: Number,
    },
    //content:'i so happy when i had that ride'
    content: {
        required: true,
        type: String,
    },
    //experience:[good,friendly,ok,happy]
    experience:{
        required:true,
        type: [String],
        // type:String,
    },
    // trip:{
    //     type: ObjectId, // Reference the Driver schema by ObjectId
    //     ref: 'Trip', // Set the reference to the 'Driver' model
    // },
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trips', // Make sure it matches the model name 'trips' defined in mongoose.model
    },
    
    createdAt: {
        default: Date.now(),
        type: Date,
    },
})

const FeedBacks = mongoose.model("feedbacks", FeedBackSchema);
module.exports = FeedBacks;
