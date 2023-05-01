const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

// Define the schema for a user
const userSchema = new Schema({
  firstName: { type: String, required: [true, 'first name is required'] },
  lastName: { type: String, required: [true, 'last name is required'] },
  email: { type: String, required: [true, 'email address is required'], unique: [true, 'this email address has been used'] },
  password: { type: String, required: [true, 'password is required'] },
  watchlist: [{ type: Schema.Types.ObjectId, ref: 'Trade' }]
});

// Pre-save hook to hash the password before saving the user
userSchema.pre('save', function (next) {
  let user = this;
  if (!user.isModified('password')) return next();
  bcrypt.hash(user.password, 10)
    .then(hash => {
      user.password = hash;
      next();
    })
    .catch(err => next(error));
});

// Method to compare input password with hashed password in the database
userSchema.methods.comparePassword = function (inputPassword) {
  let user = this;
  return bcrypt.compare(inputPassword, user.password);
}

// Export the user model based on the schema
module.exports = mongoose.model('User', userSchema);
