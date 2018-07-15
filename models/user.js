const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');

const UserSchema = mongoose.Schema({
    local: {
        username: {type: String},
        email: {type: String},
        password: {type: String},
    },
    facebook: {
        id: {type: String},
        token: {type: String},
        email: {type: String},
        name: {type: String}
    },
    google: {
        id: {type: String},
        token: {type: String},
        email: {type: String},
        name: {type: String}
    }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.insertUser = function(newUser, callback){
    bcrypt.genSalt(10, (err, salt)=>{
        if(err) throw err;
        bcrypt.hash(newUser.local.password, salt, (err, hash)=>{
            if(err) throw err;
            newUser.local.password = hash;
            newUser.save(callback);
        });
    });
}

module.exports.getAllUsers = function(callback){
    User.find({}, callback);
}

module.exports.getUserById = function(id, callback){
    User.findOne({_id: mongoose.Types.ObjectId(id)}, callback);
}

module.exports.getUserByUsername = function(username, callback){
    User.findOne({'local.username': username}, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, (err, isMatch)=>{
        if(err) throw err;
        callback(null, isMatch);
    });
}

// OAuth
module.exports.getUserByFacebookId = function(id, callback){
    User.findOne({ 'facebook.id': id }, callback);
}

module.exports.getUserByGoogleId = function(id, callback){
    User.findOne({ 'google.id': id }, callback);
}