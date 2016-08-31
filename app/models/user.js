// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
        name:String,
        yearsIn:String,
        bio:String,
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role:{type:String,default:'member'},
        resetPasswordToken: String,
        resetPasswordExpires: Date

});

// methods ======================
// generating a hash

//has&salt on save
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};
//has&salt on save
userSchema.statics.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};
// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};



// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);