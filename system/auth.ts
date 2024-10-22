import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { CustomError, asyncErrorHandler } from "./utils";
import { Model } from "mongoose";

// Common error messages for reusability
const ERRORS = {
  accessDenied: "Access denied. Please include an access token",
  reAuthRequired: "Access denied. Please re-authorize token",
  tokenExpired: "Token expired. Please re-authorize",
  suspendedAccount:
    "Your account has been suspended. Please contact the administrator",
};

interface User {
  id: string;
  isActive: boolean;
}

// Custom check for user status
const customCheck = (
  user: User
): { message: string; code: number; status: boolean } => {
  if (!user?.isActive) {
    return {
      message: ERRORS.suspendedAccount,
      code: 403,
      status: false,
    };
  }
  return { status: true, message: "", code: 200 };
};

// Helper function for token generation
const generateToken = (
  payload: object,
  secret: string,
  options: SignOptions = {}
): string => {
  return jwt.sign(payload, secret, options);
};

// Generate Access Token
export const generateAccessToken = async (
  user: User["id"],
  expiresIn: string | number
): Promise<string> => {
  try {
    return generateToken(
      { id: user },
      process.env.JWT_ACCESS_TOKEN_SECRET as string,
      {
        expiresIn,
      }
    );
  } catch (err: any) {
    console.error("Failed to generate access token:", err.message);
    throw new CustomError("Token generation failed", 500); // Ensure throwing an error here for consistency
  }
};

// Generate Refresh Token
export const generateRefreshToken = async (userId: string): Promise<string> => {
  return generateToken(
    { id: userId },
    process.env.JWT_REFRESH_TOKEN_SECRET as string
  );
};

// Token verification helper
const verifyToken = (
  token: string,
  secret: string
): Promise<JwtPayload | string> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded as JwtPayload | string);
    });
  });
};

// Extend the Request interface within this file
interface CustomRequest extends Request {
  verifyAccessToken?: string | null;
  verifyAccessTokenMessage?: string;
  verifyAccessTokenCode?: number;
  userId?: string;
  token?: string;
  userModel?: any; // Assuming you're using Mongoose for user models
}

// Authenticate Access Token Middleware
export const authenticateToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      req.verifyAccessToken = null;
      req.verifyAccessTokenMessage = ERRORS.accessDenied;
      req.verifyAccessTokenCode = 401;
      return next();
    }

    try {
      const verifiedToken = await verifyToken(
        token,
        process.env.JWT_ACCESS_TOKEN_SECRET as string
      );
      req.verifyAccessToken = "success";
      req.verifyAccessTokenCode = 200;
      req.userId = (verifiedToken as JwtPayload).id;
      req.token = token;
    } catch (err: any) {
      // Handle expired or invalid tokens
      if (err.message === "jwt expired") {
        const decoded = jwt.decode(token) as JwtPayload;
        req.verifyAccessToken = "failed";
        req.verifyAccessTokenCode = 200;
        req.userId = decoded.id;
        req.token = token;
      } else {
        req.verifyAccessToken = null;
        req.verifyAccessTokenMessage = ERRORS.reAuthRequired;
        req.verifyAccessTokenCode = 401;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};

// Verify Refresh Token and Re-issue Access Token
export const verifyRefreshToken = async (
  refreshToken: string,
  sessions: string[]
): Promise<{ status: string; message?: string; newToken?: string }> => {
  if (!refreshToken) {
    return { status: "failed", message: ERRORS.accessDenied };
  }

  if (!sessions.includes(refreshToken)) {
    return { status: "failed", message: ERRORS.tokenExpired };
  }

  try {
    const tokenData = await verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET as string
    );
    const newAccessToken = await generateAccessToken(
      (tokenData as JwtPayload).id,
      process.env.JWT_EXPIRES_TEN_MINS as string
    );
    return { status: "success", newToken: newAccessToken };
  } catch (err) {
    return { status: "failed", message: ERRORS.reAuthRequired };
  }
};

// Re-issue Access Token with injected UserModel
export const reIssueToken = (UserModel: Model<any>) =>
  asyncErrorHandler(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      if (!req.verifyAccessToken) {
        throw new CustomError(
          req.verifyAccessTokenMessage as string,
          req.verifyAccessTokenCode as number
        );
      }

      if (!req.headers.refreshtoken) {
        throw new CustomError(ERRORS.accessDenied, 401);
      }

      const user = await UserModel.findById(req.userId).exec();
      if (!user) throw new CustomError("Authorization failed", 401);

      const { message, code, status } = customCheck(user);
      if (!status) throw new CustomError(message, code);

      next();
    }
  );
