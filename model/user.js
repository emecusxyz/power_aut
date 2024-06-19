const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "Please provide a name"],
      unique: [false],
    },
    last_name: {
      type: String,
      required: [true, "Please provide a name"],
      unique: [false],
    },
    email: {
      type: String,
      required: [true, "Please provide an Email!"],
      // unique: [true, "Email Exist"],
    },

    password: {
      type: String,
      required: [true, "Please provide a password!"],
      unique: false,
    },
    group: Array,
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model.Users || mongoose.model("Users", UserSchema);
