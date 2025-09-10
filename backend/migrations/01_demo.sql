-- Sample user
INSERT INTO users (email, name) VALUES ('alice@example.com', 'Alice');

-- Sample board
INSERT INTO boards (title, owner_id) VALUES ('Demo Board', (SELECT id FROM users WHERE email='alice@example.com'));

-- Sample columns
INSERT INTO columns (board_id, title, position)
VALUES
  ((SELECT id FROM boards WHERE title='Demo Board'), 'To Do', 1),
  ((SELECT id FROM boards WHERE title='Demo Board'), 'In Progress', 2),
  ((SELECT id FROM boards WHERE title='Demo Board'), 'Done', 3);

-- Sample cards
INSERT INTO cards (column_id, title, description, position)
VALUES
  ((SELECT id FROM columns WHERE title='To Do' LIMIT 1), 'Setup project', 'Initialize repo and basic files', 1),
  ((SELECT id FROM columns WHERE title='To Do' LIMIT 1), 'Design DB schema', 'Plan entities for Kanban board', 2),
  ((SELECT id FROM columns WHERE title='In Progress' LIMIT 1), 'Implement backend', 'Setup Express + Sequelize', 1);

-- Sample audit log
INSERT INTO audit_logs (user_id, board_id, action, payload)
VALUES (
  (SELECT id FROM users WHERE email='alice@example.com'),
  (SELECT id FROM boards WHERE title='Demo Board'),
  'CREATE_CARD',
  '{"cardTitle": "Setup project"}'
);
