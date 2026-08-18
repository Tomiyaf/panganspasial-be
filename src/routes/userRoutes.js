import { Router } from "express";
import UserController from "../controllers/userController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

// Admin Dashboard Summary (TASK-053)
router.get("/admin/dashboard/summary", authenticate, authorize("Admin"), UserController.getDashboardSummary);

// Admin User Management CRUD (TASK-052)
router.get("/admin/users", authenticate, authorize("Admin"), UserController.getUsers);
router.get("/admin/users/:id", authenticate, authorize("Admin"), UserController.getUserById);
router.post("/admin/users", authenticate, authorize("Admin"), UserController.createUser);
router.patch("/admin/users/:id", authenticate, authorize("Admin"), UserController.updateUser);
router.delete("/admin/users/:id", authenticate, authorize("Admin"), UserController.deleteUser);

export default router;
