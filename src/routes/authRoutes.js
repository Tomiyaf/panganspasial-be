import { Router } from "express";
import AuthController from "../controllers/authController.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema } from "../validators/authValidator.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.post("/login", authLimiter, validate(loginSchema), AuthController.login);
router.get("/me", authenticate, AuthController.getMe);

export default router;
