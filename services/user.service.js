import User from "../models/user.model";
import { CustomError } from "../system/utils";
import { generateOtp, hashPassword } from "../system/utils";
import { generateAccessToken, generateRefreshToken } from "../system/auth";

import { sendVerifyEmailCode } from "./email.service";

export const findUserByEmail = async (email) => {
  try {
    return await User.findOne({ email: email }, "email");
  } catch (error) {
    throw new CustomError(`Error checking if user exist: ${error.message}`);
  }
};

// Define your reusable helper functions here
export const createUser = async (userData, req) => {
  try {
    const clientIpAddress = req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];

    let hashedPassword = await hashPassword(userData.password);
    const emailCode = generateOtp("numeric", 8);

    // SEND WELCOME EMAIL
    await sendVerifyEmailCode(userData.email, emailCode);

    const userSchema = {
      userDetails: {
        name: userData.name,
        roles: userData.roles,
        phoneNumber: userData.phoneNumber,
        email: userData.email,
        password: hashedPassword,
      },

      authDetails: {
        ipAddress: clientIpAddress,
        userAgent: userAgent,
        signUpDate: new Date(Date.now()),
        isSignedUp: true,
        lastSeen: new Date(Date.now()),
        sessions: [],
        emailCode: emailCode,
      },

      permissionDetails: {
        roles: [userData.roles],
      },
    };

    const user = new User(userSchema);

    console.log("NEW USER", user);

    // GENERATE TOKEN
    const token = await generateAccessToken(
      user?._id.toString(),
      process.env.JWT_EXPIRES_TEN_MINS
    );
    // GENERATE REFRESH TOKEN
    const refreshtoken = await generateRefreshToken(user._id.toString());

    // SESSION
    let authSession = {
      ipAddress: clientIpAddress,
      userAgent: userAgent,
      date: new Date(Date.now()),
      refreshtoken,
      active: true,
    };
    user.authDetails.sessions = authSession;
    const savedUser = await user.save();

    return {
      savedUser,
      token,
      refreshtoken,
    };
  } catch (error) {
    throw new CustomError(`Error creating user: ${error.message}`);
  }
};
