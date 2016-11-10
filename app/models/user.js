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
        address: String,
        phone: String,
        active:{type:Boolean, default:true},
        role:{type:String, default:'member'},
        inDirectory: {type: Boolean, default: false},
        profileImage:{type:String, default:'/images/default.jpg'},
        freelance:{type:Boolean,default:false},
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
userSchema.statics.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};
// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.pre('save', function(next) {
    var user = this;
  if (!user.isModified('password')) return next();

      user.password = user.generateHash( user.password);
      next();
});



// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
