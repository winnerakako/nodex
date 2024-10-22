import User, { IUser } from "../models/user.model";
import { CustomError } from "../system/utils";
import { generateOtp, hashPassword } from "../system/utils";
import { generateAccessToken, generateRefreshToken } from "../system/auth";
import { sendVerifyEmailCode } from "./email.service";
import { Request } from "express";
import { Document } from "mongoose";

// Define an interface for the input data to create a user
interface CreateUserInput {
  name: string;
  roles: string[];
  phoneNumber: string;
  email: string;
  password: string;
}

// Find a user by email with proper TypeScript types
export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  try {
    // Search for the user by email and only return the email field
    return await User.findOne(
      { "userDetails.email": email },
      "userDetails.email"
    ).exec();
  } catch (error: any) {
    throw new CustomError(
      `Error checking if user exists: ${error.message}`,
      500
    );
  }
};

// Create a user with proper TypeScript types for request and user data
export const createUser = async (
  userData: CreateUserInput,
  req: Request
): Promise<{
  savedUser: IUser;
  token: string;
  refreshtoken: string;
}> => {
  try {
    // Retrieve IP address and user agent from the request
    const clientIpAddress =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"] || "Unknown Agent";

    // Hash the password
    const hashedPassword = await hashPassword(userData.password);

    // Generate a numeric OTP for email verification
    const emailCode = generateOtp("numeric", 8);

    // Send verification email to the user
    await sendVerifyEmailCode(userData.email, emailCode);

    // Create a new user object based on the input data
    const userSchema: Partial<IUser> = {
      userDetails: {
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        email: userData.email,
        password: hashedPassword,
      },
      authDetails: {
        ipAddress: clientIpAddress as string,
        userAgent: userAgent as string,
        signUpDate: new Date(),
        isSignedUp: true,
        lastSeen: new Date(),
        sessions: [],
        emailCode: emailCode,
      },
      permissionDetails: {
        roles: userData.roles,
      },
    };

    // Create a new User instance using the Mongoose model
    const user: IUser = new User(userSchema);

    console.log("NEW USER", user);

    // Generate the access token and refresh token
    const token = await generateAccessToken(
      user._id.toString(),
      process.env.JWT_EXPIRES_TEN_MINS as string
    );
    const refreshtoken = await generateRefreshToken(user._id.toString());

    // Create the session object
    const authSession = {
      ipAddress: clientIpAddress as string,
      userAgent: userAgent as string,
      date: new Date(),
      refreshtoken,
      active: true,
    };

    // Add the session to the user’s authDetails.sessions array
    user.authDetails.sessions = [authSession];

    // Save the new user to the database
    const savedUser = await user.save();

    // Return the saved user and tokens
    return {
      savedUser,
      token,
      refreshtoken,
    };
  } catch (error: any) {
    throw new CustomError(`Error creating user: ${error.message}`, 500);
  }
};
