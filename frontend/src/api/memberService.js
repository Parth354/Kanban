// File: src/api/memberService.js
import axiosClient from './axiosClient';

export const getBoardMembers = async (boardId) => {
  const response = await axiosClient.get(`/boards/${boardId}/members`);
  return response.data;
};

export const addBoardMember = async (boardId, email) => {
  // The backend will need to find the user by email
  const response = await axiosClient.post(`/boards/${boardId}/members`, { email });
  return response.data;
};

export const removeBoardMember = async (boardId, userId) => {
  await axiosClient.delete(`/boards/${boardId}/members/${userId}`);
};