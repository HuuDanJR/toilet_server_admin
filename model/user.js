var mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const UserSchema = new mongoose.Schema({
    id_user: {
        required: true,
        type: Number,
    },
    username_en:{
        required:true,type:String,unique: true,
    },
    username:{
        required:true,type:String,unique: true,
    },
    image_url:{
        required:false,type:String,unique:true,
        default:"https://i.pinimg.com/564x/7f/c4/c6/7fc4c6ecc7738247aac61a60958429d4.jpg"
    },
    password:{
        type:String,
    },
    createdAt: {
        default: Date.now(),
        type: Date,
    },
})

const User = mongoose.model("users", UserSchema);
module.exports = User;
