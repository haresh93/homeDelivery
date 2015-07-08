var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt-nodejs'),
    SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
    USR_MOBILE_NUM: { type: String, required: true, index: { unique: true } },
    USR_EMAIL: {type: String },
    USR_PASSWORD: { type: String, required: true },
    USR_NAME: {type: String }
},{collection:'USERS_MASTER'});

UserSchema.pre('save', function(next) {
    var user = this;
    console.log(user);

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);
        console.log("Entered into genSalt");
        // hash the password using our new salt
        bcrypt.hash(user.USR_PASSWORD, salt, null, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.USR_PASSWORD = hash;
            console.log(user.USR_PASSWORD);
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.USR_PASSWORD, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);
