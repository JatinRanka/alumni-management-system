const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// var {trimmedString} = require('./../utils/util.js');

var trimmedString = {type:String, trim:true}

const AlumniSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    collegeName: {
        type: String,
        trim: true,
        required: true
    },
    collegeId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
        required: true
    },
    adminId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    startYear:{
        type: Number,
        required: true
    },
    endYear: {
        type: Number,
        required: true
    },
    degree: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    rollNumber: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
    },

    verified: {
        type: Boolean,
        default: false
    },

    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required:true
        }
    }],

    education: [
        {
            startYear: {
                type: String,
                trim: true
            },
            endYear: {
                type: String,
                trim: true
            },
            course: {
                type: String,
                trim: true
            },
            school: {
                type: String,
                trim: true
            }
        }
    ],

    workExperiences: [
        {
            startYear: {
                type: String
            },
            endYear: {
                type: String
            },
            company: {
                type: String,
                trim: true
            },
            workTitle: {
                type: String,
                trim: true
            },
            industry: {
                type: String,
                trim: true
            }
        }
    ],

    mobileNumber: {
        type: Number
    },

    location: {
        city: {
            type: String,
            trim: true
        },
        state: {
            type: String,
            trim: true
        },
        country: {
            type: String,
            trim: true
        },
        coordinates:{
            langitude: {
                type: String
            },
            latitude:{
                type: String
            }
        }
    },
    socialProfiles: {
        facebook: {
            type: String
        },
        linkedin: {
            type: String
        }
    },
    imageUrl: {
        type: String
    },
    skills: [{
        type: String,
        trim: true
    }]
});


AlumniSchema.methods.generateAuthToken = function(){
    var alumni = this;
    var access = 'auth';

    var payload = {
        _id: alumni._id.toHexString(), 
        access, 
        type: 'alumni'
    }

    var token = jwt.sign(payload, 'secretKey').toString();

    alumni.tokens.push({access, token});

    return alumni.save()
        .then(() =>{
            return token;
        });
}

AlumniSchema.statics.findByToken = function(token){
    var Alumni = this;
    var decoded;

    try {
        decoded = jwt.verify(token, 'secretKey');
    } catch(err) {
        return Promise.reject();
    }


    return Alumni.findOne({
        '_id' : decoded._id,
        'tokens.token' : token,
        'tokens.access' : 'auth'
    });
}

AlumniSchema.methods.removeToken = function(token){
    var alumni = this;

    return alumni.update({
        $pull : {
            tokens : {
                token : token
            } 
        }
    });
}


const Alumni = mongoose.model('Alumni', AlumniSchema);
module.exports = {Alumni};