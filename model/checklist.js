var mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const CheckListSchema = new mongoose.Schema({
    
    title:{
        required:true,type:String
    },
    body:{
        required:true,type:String,
    },
    username:{
        required:true,type:String,
    },
    username_en:{
        required:true,type:String
    },
    is_finish:{
        required:true,default:false,type:Boolean
    },
    createdAt: {
        default: Date.now(),
        type: Date,
    },
    updateAt:{
        default: Date.now(),
        type: Date,
    }


})

const CheckList = mongoose.model("checklists", CheckListSchema);
module.exports = CheckList;
