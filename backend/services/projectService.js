import { Project } from '../models/index.js';

// NOTE: A full implementation would check team membership for permissions.
// This version assumes any logged-in user can manage projects.

const getProjects = async (userId) => {
  // This should eventually be scoped to the user's teams.
  return await Project.findAll({ order: [['name', 'ASC']] });
};

const getProjectById = async (projectId, userId) => {
  const project = await Project.findByPk(projectId);
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }
  return project;
};

const createProject = async (projectData, userId) => {
  // Associate with the user or their default team.
  return await Project.create({ ...projectData, createdBy: userId });
};

const updateProject = async (projectId, updateData, userId) => {
  const project = await Project.findByPk(projectId);
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }
  await project.update(updateData);
  return project;
};

const deleteProject = async (projectId, userId) => {
  const deletedCount = await Project.destroy({ where: { id: projectId } });
  if (deletedCount === 0) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }
  return { message: 'Project deleted successfully.' };
};

export default {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};