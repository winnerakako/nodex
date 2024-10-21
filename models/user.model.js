import mongoose from "mongoose";
const { Schema } = mongoose;

const { isEmail } = require("validator");

const userSchema = new Schema(
  {
    userDetails: {
      name: {
        type: String,
        trim: true,
        required: true,
      },
      state: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },

      about: {
        type: String,
        trim: true,
      },

      picture: {
        type: String,
        trim: true,
      },
      phoneNumber: {
        type: String,
        trim: true,
        required: true,
      },
      email: {
        type: String,
        lowercase: true,
        validate: [isEmail, "Please enter a valid email."],
        required: true,
      },
      password: {
        type: String,
        select: false,
        required: true,
      },
    },

    authDetails: {
      ipAddress: String,
      userAgent: String,

      signUpDate: Date,
      isSignedUp: {
        type: Boolean,
        default: false,
      },
      lastSeen: Date,
      sessions: [{ type: mongoose.Schema.Types.Mixed }],

      emailVerified: {
        type: Boolean,
        default: false,
      },
      emailCode: String,

      failedAuthAttempts: {
        type: Number,
        default: 0,
      },
      nextSignInDate: Date,

      passwordResetCode: String,
      nextPasswordResetDate: Date,
    },

    permissionDetails: {
      isApproved: {
        type: Boolean,
        default: false,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      roles: {
        type: Array,
      },
    },

    actions: [],
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre(/^find/, function (next) {
  console.log("PRE FIND HOOK");
  this.where({ deleted: false });
  next();
});

export default mongoose.model("User", userSchema);
