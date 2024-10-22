import express, { Router } from "express";
import { addUser } from "../controllers/users/user.controller"; // Ensure this is properly typed

// Initialize the router
const router: Router = express.Router();

// Define the route with proper typing for the request
router.post("/users", addUser);

// Use ES module export for TypeScript compatibility
export default router;
