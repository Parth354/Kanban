import axiosClient from './axiosClient';

/**
 * Assigns a user to a specific card.
 * @param {string} cardId - The ID of the card.
 * @param {string|null} assigneeId - The ID of the user to assign, or null to unassign.
 * @returns {Promise<object>} The updated card object.
 */
export const assignUserToCard = async (cardId, assigneeId) => {
  try {
    const response = await axiosClient.post(`/cards/${cardId}/assign`, { assigneeId });
    return response.data;
  } catch (error) {
    console.error("Failed to assign user to card:", error);
    throw error;
  }
};

/**
 * Deletes a specific card.
 * @param {string} cardId - The ID of the card to delete.
 * @returns {Promise<void>}
 */
export const deleteCard = async (cardId) => {
  try {
    await axiosClient.delete(`/cards/${cardId}`);
  } catch (error) {
    console.error("Failed to delete card:", error);
    throw error;
  }
};