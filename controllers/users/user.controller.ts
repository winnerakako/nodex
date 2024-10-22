import { Request, Response, NextFunction } from "express";
import validator from "validator";
import {
  CustomError,
  asyncErrorHandler,
  responseHandler,
  formatPhoneNumber,
} from "../../system/utils";
import { userRoles } from "../data";
import { createUser, findUserByEmail } from "../../services/user.service";

// Typing for user creation request body
interface AddUserRequest extends Request {
  body: {
    name: string;
    email: string;
    password: string;
    phoneNumber?: string;
    roles: string[];
  };
}

// Controller for adding a new user
export const addUser = asyncErrorHandler(
  async (req: AddUserRequest, res: Response, next: NextFunction) => {
    console.log("REACHED ADD USER", req.body);

    let { name, email, password, roles, phoneNumber } = req.body;

    // Format the phone number if present
    if (phoneNumber) phoneNumber = formatPhoneNumber(phoneNumber, "234");

    // DATA VALIDATIONS
    if (!name) throw new CustomError("Name is required", 400);
    if (name.length < 5)
      throw new CustomError("Please enter your full name", 400);

    if (!phoneNumber) throw new CustomError("Phone number is required", 400);
    if (phoneNumber.toString().length !== 13)
      throw new CustomError(
        "The phone number you entered is incorrect. Please use the format: 08012345678",
        400
      );

    if (!roles || !Array.isArray(roles) || roles.length < 1)
      throw new CustomError(
        `Please select the roles you want to perform on ${process.env.SITE_NAME}`,
        400
      );

    if (!roles.every((item) => userRoles.includes(item)))
      throw new CustomError("Invalid role selected", 400);

    if (!email) throw new CustomError("Email is required", 400);
    if (!validator.isEmail(email))
      throw new CustomError("Please enter a valid email address", 400);

    if (!password) throw new CustomError("Password is required", 400);
    if (password.length < 6)
      throw new CustomError("Password must be greater than 5 characters", 400);

    // Check if the user already exists
    const userExist = await findUserByEmail(email);
    console.log("USER EXIST", userExist);
    if (userExist)
      throw new CustomError("This email has already been registered.", 400);

    // Prepare user data for creation
    const userData = { ...req.body, phoneNumber };

    // Create a new user
    const newUser = await createUser(userData, req);

    console.log("New User", newUser);

    // Send success response
    return responseHandler(res, 200, {
      message: "User added successfully",
    });
  }
);
