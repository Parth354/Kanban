import asyncHandler from '../middleware/asyncHandler.js';
import projectService from '../services/projectService.js';

// @desc    Get all projects for the user
// @route   GET /api/projects
export const getProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getProjects(req.user.id);
  res.status(200).json(projects);
});

// @desc    Get a single project by ID
// @route   GET /api/projects/:id
export const getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id, req.user.id);
  res.status(200).json(project);
});

// @desc    Create a new project
// @route   POST /api/projects
export const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.body, req.user.id);
  res.status(201).json(project);
});

// @desc    Update a project
// @route   PUT /api/projects/:id
export const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.params.id, req.body, req.user.id);
  res.status(200).json(project);
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
export const deleteProject = asyncHandler(async (req, res) => {
  const result = await projectService.deleteProject(req.params.id, req.user.id);
  res.status(200).json(result);
});