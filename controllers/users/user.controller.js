const validator = require("validator");

import {
  CustomError,
  asyncErrorHandler,
  responseHandler,
  formatPhoneNumber,
} from "../../system/utils";

import { userRoles } from "../data";

import { createUser, findUserByEmail } from "../../services/user.service";

export const addUser = asyncErrorHandler(async (req, res, next) => {
  console.log("REACHED ADD USER", req.body);

  let { name, email, password, roles } = req.body;

  if (phoneNumber) phoneNumber = formatPhoneNumber(phoneNumber, "234");

  // DATA VALIDATIONS
  let validate = true;

  if (validate) {
    if (phoneNumber) phoneNumber = formatPhoneNumber(phoneNumber, "234");

    if (!name) throw new CustomError("Name is required", 400);
    if (name?.length < 5)
      throw new CustomError("Please enter your full name", 400);
    if (!phoneNumber) throw new CustomError("Phone number is required", 400);
    if (phoneNumber?.toString().length != 13)
      throw new CustomError(
        "The phone number you entered is not correct. Please follow this format: 08012345678",
        400
      );
    if (!roles || !Array.isArray(roles) || roles?.length < 1)
      throw new CustomError(
        `Please select the roles you want to perform on ${process.env.SITE_NAME} `,
        400
      );
    if (!roles.every((item) => userRoles.includes(item)))
      throw new CustomError("Invalid role selected", 400);

    if (!email) throw new CustomError("Email is required", 400);
    if (!validator.isEmail(email))
      throw new CustomError("Please enter a valid email address", 400);

    if (!password) throw new CustomError("Password is required", 400);
    if (password?.toString().length < 6)
      throw new CustomError("Password must be greater than 5 characters", 400);
  }

  const userExist = await findUserByEmail(email);
  console.log("USER EXIST", userExist);
  if (userExist)
    throw new CustomError(`This email has already been registered.`, 400);

  const userData = { ...req.body, phoneNumber };

  const newUser = await createUser(userData, req);

  console.log("New User", newUser);

  return responseHandler(res, 200, {
    message: "User added successfully",
  });
});
