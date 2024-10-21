const jwt = require("jsonwebtoken");
import { CustomError, asyncErrorHandler } from "./utils";

const customCheck = (object) => {
  if (object.isActive !== true)
    return {
      cfMessage:
        "Your account has been suspended. Please contact the administrator",
      cfCode: 403,
      cfStatus: false,
    };
};

// ACCESS TOKEN
export const generateAccessToken = async (user, tokenExpire) => {
  try {
    return jwt.sign(
      {
        id: user,
      },
      process.env.JWT_ACCESS_TOKEN_SECRET,
      {
        expiresIn: tokenExpire,
      }
    );
  } catch (err) {
    console.log("FAILED TO GENERATE ACCESS TOKEN", err.message);
  }
};

// REFRESH TOKEN
export const generateRefreshToken = async (user) => {
  return jwt.sign(
    {
      id: user,
    },
    process.env.JWT_REFRESH_TOKEN_SECRET
  );
};

// Verify Access Token
export const authenticateToken = (req, res, next) => {
  console.log("AUTHENTICATE TOKEN", req.headers["authorization"]);

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // TOKEN NOT FOUND
  if (!token) {
    req.verifyAccessToken = null;
    req.verifyAccessTokenMessage =
      "Access denied. Please include an access token";
    req.verifyAccessTokenCode = 401;
    next();
    return;
  }

  // TOKEN FOUND
  jwt.verify(
    token,
    process.env.JWT_ACCESS_TOKEN_SECRET,
    (err, verifiedToken) => {
      // TOKEN HAS EXPIRED
      if (err && err.message != "jwt expired") {
        console.log("TOKEN AUTHENTICATION FAILED", err.message);

        req.verifyAccessToken = null;
        req.verifyAccessTokenMessage =
          "Access denied. Please re-authorize token";
        req.verifyAccessTokenCode = 401;

        const decoded = jwt.decode(token);
        console.log("FAILED TOKEN", decoded, token);
        req.userId = decoded && decoded.id;
        req.token = token;
        next();
        return;
      } else {
        // TOKEN IS VALID BUT EXPIRED
        let decoded;
        if (err && err.message == "jwt expired") {
          decoded = jwt.decode(token);
          console.log("ACCESS TOKEN RE-AUTHENTICATED", decoded.id);
          req.verifyAccessToken = "failed";
          req.verifyAccessTokenCode = 200;
          req.userId = decoded.id;
          req.token = token;
        } else {
          // TOKEN IS VALID & NOT EXPIRED
          console.log("ACCESS TOKEN AUTHENTICATED", verifiedToken.id);
          req.verifyAccessToken = "success";
          req.verifyAccessTokenCode = 200;
          req.userId = verifiedToken.id;
          req.token = token;
        }

        next();
        return;
      }
    }
  );
};

// Verify Refresh Token
export const verifyRefreshToken = async (refreshtoken, sessions) => {
  console.log("VERIFY TOKEN", refreshtoken, sessions);

  if (!refreshtoken)
    return {
      status: "failed",
      message: "Access denied. Please submit refresh token",
    };

  if (!sessions.includes(refreshtoken)) {
    console.log("SESSION TOKENS NOT IN REFRESH");
    return {
      status: "failed",
      message: "Token expired. Please re-authorize",
    };
  }

  const jwtVerify = jwt.verify(
    refreshtoken,
    process.env.JWT_REFRESH_TOKEN_SECRET,
    async (err, token) => {
      if (err) {
        console.log("REFRESH TOKEN FAILED");
        return {
          status: "failed",
          message: "Access denied. Please re-authorize token",
        };
      } else {
        console.log("ACCESS TOKEN ID", token.id);
        const accessToken = await generateAccessToken(token.id, "mins");
        console.log("REFRESH ACCESS TOKEN GENERATED", accessToken);
        return {
          status: "success",
          newToken: accessToken,
        };
      }
    }
  );
  return jwtVerify;
};

export const reIssueToken = asyncErrorHandler(async (req, res, next) => {
  console.log("REACHED RE_ISSUE TOKEN");

  if (req.verifyAccessToken == null)
    throw new CustomError(
      req.verifyAccessTokenMessage,
      req.verifyAccessTokenCode
    );
  if (!req.headers.refreshtoken) {
    console.log("REFRESH TOKEN HEADERS", req.headers.refreshtoken);
    throw new CustomError("Access denied. Please include a refresh token", 401);
  }

  let user = await req.userModel
    .findOne({
      _id: req.userId,
    })
    .exec();

  if (!user) throw new CustomError("Authorization failed", 401);

  let { cfMessage, cfCode, cfStatus } = customCheck(user);
  if (!cfStatus) throw new CustomError(cfMessage, cfCode);
});
