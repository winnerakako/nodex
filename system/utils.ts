import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";

// Custom Error Class
export class CustomError extends Error {
  public statusCode: number;
  public status: string;
  public data: any;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, data: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "failed" : "error";
    this.data = data;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Async Error Handler Middleware
export const asyncErrorHandler = (
  func: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    func(req, res, next).catch((err: any) => {
      if (err instanceof CustomError) {
        next(err);
      } else {
        next(new CustomError(err.message, 500));
      }
    });
  };
};

// Response Handler
export const responseHandler = (
  res: Response,
  statusCode: number,
  data: any
): Response => {
  console.log("RESPONSE HANDLER:", statusCode, data);

  const currentTime = new Date();
  const { message, token, ...newData } = data;

  const status = statusCode >= 200 && statusCode < 300 ? "success" : "failed";

  const modifiedData = {
    statusCode,
    status,
    message,
    data: newData,
    meta: {
      timestamp: currentTime,
      version: process.env.VERSION,
    },
  };

  return res.status(statusCode).json(modifiedData);
};

// Wait function
export function wait(timeout: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

// Format phone number based on country code (e.g., Nigeria)
export const formatPhoneNumber = (
  phoneNumber: string,
  countryCode: string
): string => {
  let formattedNumber = phoneNumber;

  if (phoneNumber && (countryCode === "234" || countryCode === "+234")) {
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

// Generate OTP function
export const generateOtp = (
  type: "numeric" | "alphanumeric" | "alpha",
  length: number
): string => {
  let OTP = "";

  switch (type) {
    case "numeric":
      const digits = "0123456789";
      for (let i = 0; i < length; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
      }
      break;

    case "alphanumeric":
      const alphaNumeric = "0123456789abcdefghijklmnopqrstuvwxyz";
      for (let i = 0; i < length; i++) {
        OTP += alphaNumeric[Math.floor(Math.random() * alphaNumeric.length)];
      }
      break;

    case "alpha":
      const alpha = "abcdefghkmnprstuvwxyz";
      for (let i = 0; i < length; i++) {
        OTP += alpha[Math.floor(Math.random() * alpha.length)];
      }
      break;

    default:
      OTP = "0000";
  }

  return OTP;
};

// Hash Password
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(password.toString(), salt);
    return hashedPassword;
  } catch (err: any) {
    throw new CustomError(err.message, 500);
  }
};

// Compare Password
export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(plainPassword.toString(), hashedPassword);
  } catch (err: any) {
    throw new CustomError(err.message, 500);
  }
};

// Format Local Date
export const formatLocalDate = (
  date: Date | string,
  type:
    | "full"
    | "time"
    | "day"
    | "dayshort"
    | "dayandtime"
    | "fulldayandtime" = "full"
): string => {
  const newDate = new Date(date);

  let options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    day: "numeric",
    month: "short",
    year: "numeric",
  };

  switch (type) {
    case "time":
      options = { hour: "numeric", minute: "2-digit", hour12: true };
      break;

    case "day":
      options = { month: "long", day: "numeric" };
      break;

    case "dayshort":
      options = { month: "short", day: "numeric" };
      break;

    case "dayandtime":
      options = {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      };
      break;

    case "fulldayandtime":
      options = {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        year: "numeric",
      };
      break;
  }

  return newDate?.toLocaleString("en-GB", options);
};
