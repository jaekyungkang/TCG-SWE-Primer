
import { Router } from "express";
import * as projectsController from "../controllers/projects";

const router = Router();

// Check section 1-2 in the README for more details on how to create these routes.
// Get all projects
router.get("/all", projectsController.getAllProjects);

// Get project by ID
router.get("/:id", projectsController.getProjectById);

// Create project
router.post("/", projectsController.createProject);

// Update project
router.put("/:id", projectsController.updateProject);

// Delete project
router.delete("/:id", projectsController.deleteProject);

export default router;
