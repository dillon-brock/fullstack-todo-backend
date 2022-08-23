const pool = require('../utils/pool');

module.exports = class Todo {
  id;
  task;
  completed;
  user_id;

  constructor(row) {
    this.id = row.id;
    this.task = row.task;
    this.completed = row.completed;
    this.user_id = row.user_id;
  }

  static async insert({ task, user_id }) {
    const { rows } = await pool.query(
      `INSERT INTO todos (task, user_id)
      VALUES ($1, $2)
      RETURNING *`,
      [task, user_id]
    );
    return new Todo(rows[0]);
  }
};
