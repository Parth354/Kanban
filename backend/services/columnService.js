// File: backend/services/columnService.js
import { Column } from '../models/index.js';
import { checkBoardMembership } from './boardService.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';
export const getColumnsByBoard = async (boardId, userId) => {
  await checkBoardMembership(boardId, userId);
  return await Column.findAll({
    where: { boardId },
    order: [['position', 'ASC']],
  });
};

export const createColumnForBoard = async (columnData, userId) => {
  await checkBoardMembership(columnData.boardId, userId);
  const maxPosition = await Column.max('position', { where: { boardId: columnData.boardId } });
  const position = (maxPosition === null) ? 0 : maxPosition + 1;
  return await Column.create({ ...columnData, position });
};

export const updateColumn = async (columnId, updateData, userId) => {
  const column = await Column.findByPk(columnId);
  if (!column) throw new Error('Column not found.');
  await checkBoardMembership(column.boardId, userId);
  await column.update(updateData);
  return column;
};

export const deleteColumn = async (columnId, userId) => {
  const column = await Column.findByPk(columnId);
  if (!column) throw new Error('Column not found.');
  await checkBoardMembership(column.boardId, userId);
  await column.destroy();
  return { message: 'Column deleted successfully.' };
};

export const moveColumn = async (columnId, newPosition, userId) => {
  if (newPosition === undefined || newPosition < 0) {
    const error = new Error('Invalid newPosition provided.');
    error.statusCode = 400;
    throw error;
  }

  const t = await sequelize.transaction();
  try {
    const columnToMove = await Column.findByPk(columnId, { transaction: t });
    if (!columnToMove) {
        const error = new Error('Column not found.');
        error.statusCode = 404;
        throw error;
    }
    await checkBoardMembership(columnToMove.boardId, userId);

    const oldPosition = columnToMove.position;
    if (oldPosition === newPosition) return columnToMove;

    if (oldPosition < newPosition) {
      await Column.update(
        { position: sequelize.literal('position - 1') },
        { where: { boardId: columnToMove.boardId, position: { [Op.gt]: oldPosition, [Op.lte]: newPosition } }, transaction: t }
      );
    } else {
      await Column.update(
        { position: sequelize.literal('position + 1') },
        { where: { boardId: columnToMove.boardId, position: { [Op.gte]: newPosition, [Op.lt]: oldPosition } }, transaction: t }
      );
    }

    columnToMove.position = newPosition;
    await columnToMove.save({ transaction: t });

    await t.commit();
    return columnToMove;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};