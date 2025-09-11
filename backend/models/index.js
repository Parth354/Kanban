import User from './User.js';
import Team from './Team.js';
import Project from './Project.js';
import Board from './Board.js';
import BoardMember from './BoardMember.js';
import Column from './Column.js';
import Card from './Card.js';
import Label from './Label.js';
import CardLabel from './CardLabel.js';
import Attachment from './Attachment.js';
import Comment from './Comment.js';
import Notification from './Notification.js';
import AuditLog from './AuditLog.js';
import RefreshToken from './RefreshToken.js';

// User -> Team (Many-to-Many)
User.belongsToMany(Team, { through: 'teamMember' });
Team.belongsToMany(User, { through: 'teamMember' });

// Team -> Project (One-to-Many)
Team.hasMany(Project, { foreignKey: 'teamId' });
Project.belongsTo(Team, { foreignKey: 'teamId' });

// Project -> Board (One-to-Many)
Project.hasMany(Board, { foreignKey: 'projectId' });
Board.belongsTo(Project, { foreignKey: 'projectId' });

// User -> Board (Many-to-Many through BoardMember)
User.hasMany(BoardMember, { foreignKey: 'userId' });
BoardMember.belongsTo(User, { foreignKey: 'userId' });
Board.hasMany(BoardMember, { foreignKey: 'boardId' });
BoardMember.belongsTo(Board, { foreignKey: 'boardId' });

// Board -> Column (One-to-Many)
Board.hasMany(Column, { foreignKey: 'boardId' });
Column.belongsTo(Board, { foreignKey: 'boardId' });

// Column -> Card (One-to-Many)
Column.hasMany(Card, { foreignKey: 'columnId', onDelete: 'CASCADE' });
Card.belongsTo(Column, { foreignKey: 'columnId' });

// Board -> Card (One-to-Many, for easy querying)
Board.hasMany(Card, { foreignKey: 'boardId', onDelete: 'CASCADE' });
Card.belongsTo(Board, { foreignKey: 'boardId' });

// User (Assignee) -> Card (One-to-Many)
User.hasMany(Card, { as: 'assignedCards', foreignKey: 'assigneeId' });
Card.belongsTo(User, { as: 'assignee', foreignKey: 'assigneeId' });

// Card -> Label (Many-to-Many through CardLabel)
Card.belongsToMany(Label, { through: CardLabel });
Label.belongsToMany(Card, { through: CardLabel });

// Card -> Attachment (One-to-Many)
Card.hasMany(Attachment, { foreignKey: 'cardId' });
Attachment.belongsTo(Card, { foreignKey: 'cardId' });

// User -> Attachment (One-to-Many, who uploaded)
User.hasMany(Attachment, { foreignKey: 'uploaderId' });
Attachment.belongsTo(User, { foreignKey: 'uploaderId' });

// Card -> Comment (One-to-Many)
Card.hasMany(Comment, { foreignKey: 'cardId' });
Comment.belongsTo(Card, { foreignKey: 'cardId' });

// User -> Comment (One-to-Many, who commented)
User.hasMany(Comment, { foreignKey: 'authorId' });
Comment.belongsTo(User, { foreignKey: 'authorId' });

// User -> Notification (One-to-Many)
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// Board -> AuditLog (One-to-Many)
Board.hasMany(AuditLog, { foreignKey: 'boardId' });
AuditLog.belongsTo(Board, { foreignKey: 'boardId' });

// User -> AuditLog (One-to-Many)
User.hasMany(AuditLog, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });

// User -> RefreshToken (One-to-Many)
User.hasMany(RefreshToken, { foreignKey: 'userId' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

// ... export all models
export {
  User, Team, Project, Board, BoardMember, Column, Card,
  Label, CardLabel, Attachment, Comment, Notification,
  AuditLog, RefreshToken
};