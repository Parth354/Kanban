import axiosClient from './axiosClient';

/**
 * Fetches all boards that the currently authenticated user is a member of.
 * @returns {Promise<Array>} A promise that resolves to an array of board objects.
 */
export const getBoards = async () => {
  try {
    const response = await axiosClient.get('/boards');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch boards:", error);
    // Re-throw the error so the component can handle it
    throw error;
  }
};

/**
 * Creates a new board (project).
 * @param {object} boardData - The data for the new board.
 * @param {string} boardData.title - The title of the board.
 * @param {string} [boardData.description] - The optional description.
 * @returns {Promise<object>} A promise that resolves to the newly created board object.
 */
export const createBoard = async (boardData) => {
  try {
    const response = await axiosClient.post('/boards', boardData);
    return response.data;
  } catch (error) {
    console.error("Failed to create board:", error);
    throw error;
  }
};