import { Router } from "express";
import fs from "fs";
import path from "path";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./authRoutes.js";
import masterDataRoutes from "./masterDataRoutes.js";
import farmRoutes from "./farmRoutes.js";
import livestockRoutes from "./livestockRoutes.js";
import farmPhotoRoutes from "./farmPhotoRoutes.js";
import validationRoutes from "./validationRoutes.js";
import spatialRoutes from "./spatialRoutes.js";
import statisticsRoutes from "./statisticsRoutes.js";
import sdssRoutes from "./sdssRoutes.js";
import userRoutes from "./userRoutes.js";

const apiRouter = Router();

// Load OpenAPI Specification
const swaggerDocument = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), "src/docs/openapi.json"), "utf8")
);

// Swagger Documentation UI (TASK-065)
apiRouter.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Modular Route Registrations
apiRouter.use("/auth", authRoutes);
apiRouter.use("/", masterDataRoutes);
apiRouter.use("/", farmRoutes);
apiRouter.use("/", livestockRoutes);
apiRouter.use("/", farmPhotoRoutes);
apiRouter.use("/", validationRoutes);
apiRouter.use("/", spatialRoutes);
apiRouter.use("/", statisticsRoutes);
apiRouter.use("/", sdssRoutes);
apiRouter.use("/", userRoutes);

export default apiRouter;
