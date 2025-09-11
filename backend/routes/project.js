import { Router } from "express";
import { protect } from "../middleware/auth.js";

// Import CONTROLLERS
import {
    getProjects,
    createProject,
    getProjectById,
    updateProject,
    deleteProject
} from "../controllers/projectController.js";

// Import VALIDATORS
import { createProjectValidator, updateProjectValidator } from "../validators/projectValidators.js";

const router = Router();
router.use(protect);

router.route("/")
    .get(getProjects)
    .post(createProjectValidator, createProject);

router.route("/:id")
    .get(getProjectById)
    .put(updateProjectValidator, updateProject)
    .delete(deleteProject);

export default router;