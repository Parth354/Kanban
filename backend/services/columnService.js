import { Column } from '../models/index.js';
import { checkBoardMembership } from './boardService.js';
import sequelize from '../config/database.js';

const getColumnsByBoard = async (boardId, userId) => {
  await checkBoardMembership(boardId, userId);
  return await Column.findAll({
    where: { boardId },
    order: [['position', 'ASC']],
  });
};

const createColumnForBoard = async (columnData, userId) => {
  await checkBoardMembership(columnData.boardId, userId);
  const maxPosition = await Column.max('position', { where: { boardId: columnData.boardId } });
  const position = (maxPosition === null) ? 0 : maxPosition + 1;
  return await Column.create({ ...columnData, position });
};

const updateColumn = async (columnId, updateData, userId) => {
  const column = await Column.findByPk(columnId);
  if (!column) throw new Error('Column not found.');
  await checkBoardMembership(column.boardId, userId);
  await column.update(updateData);
  return column;
};

const deleteColumn = async (columnId, userId) => {
  const column = await Column.findByPk(columnId);
  if (!column) throw new Error('Column not found.');
  await checkBoardMembership(column.boardId, userId);
  await column.destroy();
  return { message: 'Column deleted successfully.' };
};

const moveColumn = async (columnId, newPosition, userId) => {
  const t = await sequelize.transaction();
  try {
    const columnToMove = await Column.findByPk(columnId, { transaction: t });
    if (!columnToMove) throw new Error('Column not found.');
    await checkBoardMembership(columnToMove.boardId, userId);

    const oldPosition = columnToMove.position;
    if (oldPosition === newPosition) return columnToMove;

    // Shift other columns
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

export {
  getColumnsByBoard,
  createColumnForBoard,
  updateColumn,
  deleteColumn,
  moveColumn
};