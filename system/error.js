import { responseHandler, CustomError } from "./utils";

export const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let status = err.status || "error";
  let data = err.data || {};

  console.log("Global Error Handler:", message);

  // DATABASE
  // Handle MongoDB Validation Errors
  if (message.includes("validation failed")) {
    // Extract specific validation error messages
    const errorParts = message.split(":").slice(-1)[0].trim(); // Get the validation error part
    const errors = errorParts
      .split(",")
      .map((error) => error.trim())
      .filter(Boolean); // Split and clean errors

    // Format each error message to show the field and message in a clean format
    const formattedErrors = errors
      .map((error) => {
        const pathMatch = error.match(/Path `(.+)` is required/); // Use regex to find the field name
        if (pathMatch) {
          const field = pathMatch[1].split(".").pop(); // Get the last part of the path (e.g., password from userDetails.password)
          return `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } is required`;
        }
        return null; // Return null if no match found
      })
      .filter(Boolean); // Filter out null values

    // Join formatted errors into a single message
    message = formattedErrors.join(", ");

    // Set status code to 400 for client-side validation errors
    statusCode = 400;
  }

  if (message.includes("duplicate key")) {
    // Extract specific duplicate key error message
    const regex = /{([^}]*)}/;
    const match = message.match(regex);
    if (match && match[1]) {
      message = match[1].trim().replace(/"/g, "") + " already exists";
      statusCode = 400; // Set status code to 400 for duplicate key errors
    }
  }

  if (message.includes("Cast to ObjectId failed")) {
    // Extract model name from the error message
    const regex = /model "([^"]+)"/;
    const match = message.match(regex);
    if (match && match[1]) {
      message = "The submitted " + match[1].trim() + " ID cannot be found";
      statusCode = 400; // Set status code to 400 for invalid ObjectId
    }
  }

  if (
    message.includes(
      "Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer"
    )
  ) {
    message = "You entered an invalid ID";
    statusCode = 400; // Set status code to 400 for invalid ID format
  }

  // Default values for any other errors
  statusCode = statusCode || 500;
  status = status || "error";

  // Handle Operational Errors
  if (err.isOperational) {
    status = err.status || "failed";
  } else {
    console.error("Unexpected Error:", err);
    status = "error";
  }

  // Send Error Response
  responseHandler(res, statusCode, { message, data });
};

// Handle Not Found Errors
export const notFoundHandler = (req, res, next) => {
  const err = new CustomError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );
  next(err);
};
