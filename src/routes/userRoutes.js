import { Router } from "express";
import UserController from "../controllers/userController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { createUserSchema, updateUserSchema } from "../validators/userValidator.js";

const router = Router();

// Admin Dashboard Summary (TASK-053)
router.get("/admin/dashboard/summary", authenticate, authorize("Admin"), UserController.getDashboardSummary);

// Admin User Management CRUD (TASK-052)
router.get("/admin/users", authenticate, authorize("Admin"), UserController.getUsers);
router.get("/admin/users/:id", authenticate, authorize("Admin"), UserController.getUserById);
router.post(
  "/admin/users",
  authenticate,
  authorize("Admin"),
  validate(createUserSchema),
  UserController.createUser
);
router.patch(
  "/admin/users/:id",
  authenticate,
  authorize("Admin"),
  validate(updateUserSchema),
  UserController.updateUser
);
router.delete("/admin/users/:id", authenticate, authorize("Admin"), UserController.deleteUser);

export default router;
