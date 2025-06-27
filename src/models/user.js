const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    fatherName: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    cnic: {
      type: mongoose.Schema.Types.String,
      required: true,
      unique: true,
    },
    fatherCnic: {
      type: mongoose.Schema.Types.String,
    },
    country: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    city: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    gender: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    email: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    computerProficiency: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    phone: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    dob: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    qualification: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    laptop: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    image: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    id: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
  },
  { timestamps: true }
);

const user = mongoose.model("user", userSchema);

module.exports = user;
