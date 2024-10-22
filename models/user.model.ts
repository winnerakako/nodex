import mongoose, { Schema, Document, Query, Types } from "mongoose";
import { isEmail } from "validator";

// Define the interface for User details
interface UserDetails {
  name: string;
  state?: string;
  city?: string;
  address?: string;
  about?: string;
  picture?: string;
  phoneNumber: string;
  email: string;
  password: string;
}

// Define the interface for Auth details
interface AuthDetails {
  ipAddress?: string;
  userAgent?: string;
  signUpDate?: Date;
  isSignedUp?: boolean;
  lastSeen?: Date;
  sessions?: Array<Record<string, any>>; // Sessions can have mixed data
  emailVerified?: boolean;
  emailCode?: string;
  failedAuthAttempts?: number;
  nextSignInDate?: Date;
  passwordResetCode?: string;
  nextPasswordResetDate?: Date;
}

// Define the interface for Permission details
interface PermissionDetails {
  isApproved?: boolean;
  roles?: string[];
}

// Define the interface for User document
export interface IUser extends Document {
  _id: Types.ObjectId; // Explicitly define _id as ObjectId
  userDetails: UserDetails;
  authDetails: AuthDetails;
  permissionDetails: PermissionDetails;
  isActive?: boolean;
  actions?: Array<any>;
  deleted?: boolean;
}

// Define the User schema
const userSchema: Schema = new Schema(
  {
    userDetails: {
      name: {
        type: String,
        trim: true,
        required: [true, "Name is required"],
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
        required: [true, "Phone number is required"],
      },
      email: {
        type: String,
        lowercase: true,
        validate: [isEmail, "Please enter a valid email"],
        required: [true, "Email is required"],
      },
      password: {
        type: String,
        select: false,
        required: [true, "Password is required"],
      },
    },
    authDetails: {
      ipAddress: {
        type: String,
      },
      userAgent: {
        type: String,
      },
      signUpDate: {
        type: Date,
        default: Date.now,
      },
      isSignedUp: {
        type: Boolean,
        default: false,
      },
      lastSeen: {
        type: Date,
        default: Date.now,
      },
      sessions: [
        {
          type: Schema.Types.Mixed,
        },
      ],
      emailVerified: {
        type: Boolean,
        default: false,
      },
      emailCode: {
        type: String,
      },
      failedAuthAttempts: {
        type: Number,
        default: 0,
      },
      nextSignInDate: {
        type: Date,
      },
      passwordResetCode: {
        type: String,
      },
      nextPasswordResetDate: {
        type: Date,
      },
    },
    permissionDetails: {
      isApproved: {
        type: Boolean,
        default: false,
      },

      roles: {
        type: [String],
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    actions: {
      type: Array,
      default: [],
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Pre-find hook to filter out deleted users
userSchema.pre(/^find/, function (next) {
  console.log("PRE FIND HOOK");

  // Tell TypeScript that `this` is a Mongoose query object
  const query = this as Query<any, Document>;
  query.where({ deleted: false });

  next();
});

// Export the User model
const User = mongoose.model<IUser>("User", userSchema);
export default User;
