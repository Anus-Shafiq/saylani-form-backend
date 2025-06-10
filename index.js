const express = require("express");
const Multer = require("multer");
const cors = require("cors");
const { buffer } = require("stream/consumers");
const { error } = require("console");
const cloudinary = require("cloudinary").v2;
const fs = require("fs").promises;
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const storage = Multer.memoryStorage();

const upload = Multer({
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

const readDataFromFile = async () => {
  try {
    const data = await fs.readFile("data.json", "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.log(error);
    return [];
  }
};

const writeDataToFile = async (data) => {
  try {
    await fs.writeFile("data.json", JSON.stringify(data, null, 2));
    console.log("Data insert into the file");
  } catch (error) {
    console.log("Something went wrong while writing Data");
    console.log(error);
  }
};

app.post("/student/register", upload.single("image"), async (req, res) => {
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

  let count = 1;
  const courseIdMap = {
    "web-development": "WMA",
    "graphic-design": "GD",
    "vidio-animatin": "AI",
  };
  const coursePrefix = courseIdMap[req.body.course];
  const id = `${coursePrefix}-${count}`;
  count++;

  const newStudent = {
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
  };

  const existingData = await readDataFromFile();

  console.log(existingData);

  existingData.push(newStudent);

  await writeDataToFile(existingData);

  return res.send({
    message: "User Created Succesfully",
    success: true,
    user: newStudent,
  });
});

app.get("/all-users", async (req, res) => {
  const allUsers = await readDataFromFile();
  res.send({
    users: allUsers,
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is Running on Port ${process.env.PORT}`);
});
