import axiosClient from './axiosClient';

/**
 * Creates a new column on a specific board.
 * @param {object} columnData - The data for the new column.
 * @param {string} columnData.boardId - The ID of the board.
 * @param {string} columnData.title - The title of the new column.
 * @returns {Promise<object>} The newly created column object.
 */
export const createColumn = async (columnData) => {
  try {
    const response = await axiosClient.post(`/boards/${columnData.boardId}/columns`, columnData);
    return response.data;
  } catch (error) {
    console.error("Failed to create column:", error);
    throw error;
  }
};

/**
 * Moves a column to a new position on the board.
 * @param {string} columnId - The ID of the column to move.
 * @param {number} newPosition - The new zero-based index for the column.
 * @returns {Promise<object>} The updated column object.
 */
export const moveColumn = async (columnId, newPosition) => {
    try {
        const response = await axiosClient.post(`/columns/${columnId}/move`, { newPosition });
        return response.data;
    } catch (error) {
        console.error("Failed to move column:", error);
        throw error;
    }
};

/**
 * Deletes a specific column from the board.
 * @param {string} columnId - The ID of the column to delete.
 * @returns {Promise<void>}
 */
export const deleteColumn = async (columnId) => {
  try {
    // This calls the backend endpoint DELETE /api/columns/:id
    await axiosClient.delete(`/columns/${columnId}`);
  } catch (error) {
    console.error("Failed to delete column:", error);
    throw error;
  }
};