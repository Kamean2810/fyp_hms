import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import {User} from "../models/userSchema.js";
import {generateToken} from "../utils/jwtToken.js";
import cloudinary from "cloudinary";


export const patientRegister = catchAsyncErrors(async (req, res, next) => {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      nic, 
      dob, 
      gender, 
      password,
      role,
    } = req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !nic ||
      !dob ||
      !gender ||
      !password ||
      !role
    ) {
      return next(new ErrorHandler("Please Fill Full Form!", 400));
    }
  
    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
      return next(new ErrorHandler("User already Registered!", 400));
    }
  
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      nic,
      dob,
      gender,
      password,
      role: "Patient",
    });
    generateToken(user, "User Registered!", 200, res);
  });

  export const login = catchAsyncErrors(async(req,res,next) =>{
    const { email, password, confirmPassword, role } = req.body;
    if(!email || !password || !confirmPassword || !role){
      return next(new ErrorHandler("Provide All Details First!..",400));
    }
    if(password !== confirmPassword){
      return next(new ErrorHandler("Authentication Faild!..",400));
    }
    const user = await User.findOne({email}).select("+password");
    if(!user){
      return next(new ErrorHandler("User Not Found!...",400));
    }
    const isPasswordMatch = await user.comparePassword(password);
    if(!isPasswordMatch){
      return next(new ErrorHandler("User Not Found!...",400));
    }
    if(role !== user.role){
      return next(new ErrorHandler("User Of This Role Not Found!..",400));
    }
    generateToken(user,"Login Successfull!..", 201, res);

  });

  export const addNewAdmin = catchAsyncErrors(async(req,res,next) =>{
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      gender,
      dob,
      nic,
    } = req.body;
    if(
      !firstName ||
      !lastName  ||
      !email     ||
      !phone     ||
      !password  ||
      !gender    ||
      !dob       ||
      !nic      
    ) {
      return next(new ErrorHandler("Fill Full Form First!...", 400));
    }
    const isRegistered = await User.findOne({ email });
    if(isRegistered){
      return next(new ErrorHandler(`${isRegistered.role} With This Email Exists Already!..`, 400));
    }
    const admin = await User.create({
      firstName, 
      lastName, 
      email, 
      phone, 
      password, 
      gender, 
      dob, 
      nic, 
      role: "Admin",
    });
    res.status(200).json({
      success: true,
      message: "New Admin Registered!..",
      admin,
    });
    
  });

  export const getAllDoctors = catchAsyncErrors(async(req, res, next) =>{
    const doctors = await User.find({role: "Doctor"});
    res.status(200).json({
      success: true,
      doctors,
    });
  });

  export const getUserDetails = catchAsyncErrors(async(req, res, next) =>{
    const user = req.user;
    res.status(200).json({
      success: true,
      user,
    });
  });

  export const logoutAdmin = catchAsyncErrors(async(req, res, next) =>{
    res
    .status(200)
    .cookie("adminToken", null, {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Admin Log Out Successfully!..",
    });
  });
  export const logoutPatient = catchAsyncErrors(async(req, res, next) =>{
    res
    .status(200)
    .cookie("patientToken", null, {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Patient Log Out Successfully!..",
    });
  });

export const addNewDoctor = catchAsyncErrors(async(req, res, next) => {
  if(!req.files || Object.keys(req.files).length === 0){
    return next(new ErrorHandler("Doctor Avatar Is Required!...", 400));
  }
   const {docAvatar} = req.files;
   const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
   if(!allowedFormats.includes(docAvatar.mimetype)){
     return next(new ErrorHandler("Format Does Not Supported!..", 400));
  }
  const {
    firstName, 
    lastName, 
    email, 
    phone, 
    nic, 
    dob, 
    gender, 
    password,
    doctorDepartment,
  
  } = req.body
  if(
    !firstName || 
    !lastName  || 
    !email     || 
    !phone     || 
    !nic       ||
    !dob       ||
    !gender    || 
    !password  ||
    !doctorDepartment
  ){
    return next(new ErrorHandler("Provide Full Details First!...", 400));
  }
  const isRegistered = await User.findOne({email});
  if(isRegistered){
    return next(new ErrorHandler(`${isRegistered.role} already Exist With This email`, 400));

  }
  const cloudinaryResponse = await cloudinary.Uploader.upload(
    docAvatar.tempFilePath
  );
  if(!cloudinaryResponse || cloudinaryResponse.error){
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unexpected Cloudinary Error"
    );
  }
  const doctor = await User.create({
    firstName, 
    lastName, 
    email, 
    phone, 
    nic, 
    dob, 
    gender, 
    password,
    doctorDepartment,
    role: "Doctor",
    docAvatar:{
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },

  });
  res.status(200).json({
    success: true,
    message: "New Doctor Registered!!..",
    doctor,
    docAvatar
  });

});