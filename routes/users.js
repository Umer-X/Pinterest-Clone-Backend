const mongoose = require('mongoose');
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/Pinterrst");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String,  unique: true },
  profileImage: { type: String },
  boards: {
    type: Array,
    default: [],
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post", // Updated model name to 'Post'
    }
  ],
  // Add other user-related fields as needed
});

userSchema.plugin(plm);

const User = mongoose.model('User', userSchema);

module.exports = User;
