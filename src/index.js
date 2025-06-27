const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const cors = require("cors");
const mongoose = require("./db/config");
const user = require("./models/user");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();

mongoose.connection.on("open", () => {
  console.log(`MongoDB Database Connected`);
});

const upload = multer({
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
  storage: storage,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImageInCloudinary = (buffer, filename) => {
  return new Promise((res, rej) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "image",
          public_id: `${Date.now()}_${filename}`,
          folder: "student_dp",
        },
        (error, result) => {
          if (error) {
            rej(error);
          } else {
            res(result);
          }
        }
      )
      .end(buffer);
  });
};

app.post("/student/register", upload.single("image"), async (req, res) => {
  try {
    const requiredFields = [
      "country",
      "city",
      "course",
      "computerProficiency",
      "fullName",
      "fatherName",
      "email",
      "phone",
      "cnic",
      "dob",
      "gender",
      "address",
      "qualification",
      "laptop",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.send({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    if (!req.file) {
      return res.send({
        success: false,
        message: "Picture is required",
      });
    }

    const uploadImage = await uploadImageInCloudinary(
      req.file.buffer,
      req.file.originalname
    );

    const studentCount = await user.countDocuments({ course: req.body.course });

    const courseIdMap = {
      "web-development": "WMA",
      "graphic-design": "GD",
      "vidio-animatin": "AI",
    };
    const coursePrefix = courseIdMap[req.body.course];
    const id = `${coursePrefix}-${studentCount + 1}`;

    const newStudent = new user({
      fullName: req.body.fullName,
      fatherName: req.body.fatherName,
      cnic: req.body.cnic,
      country: req.body.country,
      city: req.body.city,
      course: req.body.course,
      phone: req.body.phone,
      email: req.body.email,
      gender: req.body.gender,
      address: req.body.address,
      qualification: req.body.qualification,
      laptop: req.body.laptop,
      computerProficiency: req.body.computerProficiency,
      dob: req.body.dob,
      image: uploadImage.secure_url,
      id: id,
    });
    await newStudent.save();

    return res.send({
      message: "Student Registered Successfully!",
      success: true,
      user: newStudent,
    });
  } catch (error) {
    console.log(error);
    if (error?.errorResponse?.errmsg.includes("duplicate key error")) {
      return res.send({ message: "CNIC already registered" });
    }
  }
});

app.get("/all-students", async (req, res) => {
  const allUsers = await user.find();
  res.send({
    users: allUsers,
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is Running on Port ${process.env.PORT}`);
});
