var mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const TokenSchema = new mongoose.Schema({
    value:{
        required:true,type:String
    },
    name:{
        required:true,type:String
    },
})

const Token = mongoose.model("token", TokenSchema);
module.exports = Token;
