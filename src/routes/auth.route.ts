import express, { Request, Response } from "express";
const router = express.Router();

import {
  register,
  login,
  logout,
  refreshToken,
} from "../controllers/auth.controller";

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.post("/refresh", refreshToken);

export default router;
