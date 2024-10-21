import express from "express";
const router = express.Router();

import { addUser } from "../controllers/users/user.controller";

router.post("/users", addUser);

module.exports = router;
