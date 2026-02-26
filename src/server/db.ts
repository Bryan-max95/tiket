import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('tickets.db');

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role_id TEXT,
    department_id TEXT,
    max_active_tickets INTEGER DEFAULT 5,
    is_active INTEGER DEFAULT 1,
    is_available INTEGER DEFAULT 1,
    FOREIGN KEY(role_id) REFERENCES roles(id),
    FOREIGN KEY(department_id) REFERENCES departments(id)
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sla_hours INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    user_id TEXT NOT NULL,
    department_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    impact TEXT NOT NULL,
    urgency TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Nuevo',
    assigned_agent_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    closed_at DATETIME,
    sla_deadline DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(assigned_agent_id) REFERENCES users(id),
    FOREIGN KEY(category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS ticket_history (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    previous_state TEXT,
    new_state TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(ticket_id) REFERENCES tickets(id)
  );
`);

// Seed initial data if empty
const rowCount = db.prepare('SELECT COUNT(*) as count FROM departments').get() as { count: number };
if (rowCount.count === 0) {
  db.exec(`
    INSERT INTO departments (id, name) VALUES ('d1', 'IT'), ('d2', 'Sales'), ('d3', 'HR');
    INSERT INTO roles (id, name) VALUES ('admin', 'Admin'), ('supervisor', 'Supervisor'), ('agent', 'Agent'), ('employee', 'Employee');
    INSERT INTO categories (id, name, sla_hours) VALUES ('c1', 'Hardware', 8), ('c2', 'Software', 4), ('c3', 'Network', 2);
    INSERT INTO users (id, name, email, role_id, department_id) VALUES 
      ('u1', 'Admin User', 'admin@company.com', 'admin', 'd1'),
      ('u2', 'IT Agent 1', 'agent1@company.com', 'agent', 'd1'),
      ('u3', 'IT Agent 2', 'agent2@company.com', 'agent', 'd1'),
      ('u4', 'Employee User', 'emp@company.com', 'employee', 'd2');
  `);
}

export default db;
