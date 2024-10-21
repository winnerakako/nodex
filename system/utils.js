const bcrypt = require("bcrypt");

export class CustomError extends Error {
  constructor(message, statusCode, data) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "failed" : "error";
    if (data) this.data = data;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const asyncErrorHandler = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch((err) => {
      if (err instanceof CustomError) {
        //NOTE: logged out so that certain errors can reach our interceptore
        // const error = new CustomError(err.message, err.statusCode, err.data);
        next(err);
      } else {
        //NOTE: logged out so that certain errors can reach our interceptore
        // const error = new CustomError(err.message, 500);
        next(err);
      }
    });
  };
};

export const responseHandler = (res, statusCode, data) => {
  console.log("RESPONSE HANDLER:", statusCode, data);

  const currentTime = new Date();
  const { message, token, ...newData } = data;

  const status = statusCode >= 200 && statusCode < 300 ? "success" : "failed";

  const modifiedData = {
    statusCode: statusCode,
    status: status,
    message: message,
    data: newData,
    meta: {
      timestamp: currentTime,
      version: process.env.version,
    },
  };

  return res.status(statusCode).json(modifiedData);
};

export function wait(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

// format phone number to country specific code
export const formatPhoneNumber = (phoneNumber, countryCode) => {
  let formattedNumber = phoneNumber;

  // NIGERIA
  if (phoneNumber && (countryCode == "234" || countryCode == "+234")) {
    // remove +234, remove first 0, and add 234 back
    if (phoneNumber.startsWith("+234")) {
      formattedNumber = phoneNumber.replace("+234", "");
    } else if (phoneNumber.startsWith("234")) {
      formattedNumber = phoneNumber.replace("234", "");
    }

    if (phoneNumber.startsWith("0") && formattedNumber.length >= 11) {
      formattedNumber = formattedNumber.replace("0", "");
    }
    formattedNumber = "234" + formattedNumber;
  }

  return formattedNumber;
};

export const generateOtp = (type, length) => {
  // numeric
  if (type === "numeric") {
    let digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < length; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }
  // alpha numeric
  else if (type === "alphanumeric") {
    // let string =
    //   "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let string = "0123456789abcdefghijklmnopqrstuvwxyz";
    let OTP = "";
    let len = string.length;
    for (let i = 0; i < length; i++) {
      OTP += string[Math.floor(Math.random() * len)];
    }
    return OTP;
  } else if (type === "alpha") {
    // let string =
    //   "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let string = "abcdefghkmnprstuvwxyz";
    let OTP = "";
    let len = string.length;
    for (let i = 0; i < length; i++) {
      OTP += string[Math.floor(Math.random() * len)];
    }
    return OTP;
  }
  // nothing selected
  else {
    return "0000";
  }
};

export const hashPassword = async (password) => {
  try {
    password = password.toString();
    const salt = await bcrypt.genSalt(8);
    let hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
  } catch (err) {
    throw new Error(err, 500);
  }
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    plainPassword = plainPassword.toString();

    console.log(plainPassword);

    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (err) {
    throw new Error(err, 500);
  }
};

export const formatLocalDate = (date, type = "full") => {
  const newDate = new Date(date);

  let options = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    day: "numeric",
    month: "short",
    year: "numeric",
  };

  if (type === "time") {
    options = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
  }

  if (type === "day") {
    options = {
      month: "long",
      day: "numeric",
    };
  }

  if (type === "dayshort") {
    options = {
      month: "short",
      day: "numeric",
    };
  }

  if (type === "dayandtime") {
    options = {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
  }

  if (type === "fulldayandtime") {
    options = {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      year: "numeric",
    };
  }

  return newDate?.toLocaleString("en-GB", options);
};
