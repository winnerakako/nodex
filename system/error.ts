import { Request, Response, NextFunction } from "express";
import { responseHandler, CustomError } from "./utils";

// Global Error Handler with TypeScript typings
export const globalErrorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode: number = err.statusCode || 500;
  let message: string = err.message || "Internal Server Error";
  let status: string = err.status || "error";
  let data: any = err.data || {};

  console.log("Global Error Handler:", message);

  // DATABASE: Handle MongoDB Validation Errors
  if (message.includes("validation failed")) {
    const errorParts = message.split(":").slice(-1)[0].trim(); // Extract validation error part
    const errors = errorParts
      .split(",")
      .map((error) => error.trim())
      .filter(Boolean); // Split and clean errors

    // Format validation errors
    const formattedErrors = errors
      .map((error) => {
        const pathMatch = error.match(/Path `(.+)` is required/); // Use regex to find the field name
        if (pathMatch) {
          const field = pathMatch[1].split(".").pop(); // Get the last part of the path (e.g., password from userDetails.password)
          if (field) {
            return `${
              field.charAt(0).toUpperCase() + field.slice(1)
            } is required`;
          }
        }
        return null;
      })
      .filter(Boolean); // Filter out null values

    message = formattedErrors.join(", ");
    statusCode = 400; // Set status code to 400 for validation errors
  }

  // Handle MongoDB Duplicate Key Errors
  if (message.includes("duplicate key")) {
    const regex = /{([^}]*)}/;
    const match = message.match(regex);
    if (match && match[1]) {
      message = match[1].trim().replace(/"/g, "") + " already exists";
      statusCode = 400; // Set status code to 400 for duplicate key errors
    }
  }

  // Handle MongoDB Cast to ObjectId Errors
  if (message.includes("Cast to ObjectId failed")) {
    const regex = /model "([^"]+)"/;
    const match = message.match(regex);
    if (match && match[1]) {
      message = `The submitted ${match[1].trim()} ID cannot be found`;
      statusCode = 400; // Set status code to 400 for invalid ObjectId
    }
  }

  // Handle Invalid ID Format Errors
  if (
    message.includes(
      "Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer"
    )
  ) {
    message = "You entered an invalid ID";
    statusCode = 400; // Set status code to 400 for invalid ID format
  }

  // Default Error Handling for Non-Operational Errors
  if (!err.isOperational) {
    console.error("Unexpected Error:", err);
    status = "error"; // Set status to error for unexpected errors
  }

  // Send the error response
  responseHandler(res, statusCode, { message, data });
};

// Not Found Handler for unknown routes
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const err = new CustomError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );
  next(err);
};
