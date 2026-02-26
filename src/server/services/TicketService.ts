import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';

export enum TicketStatus {
  NEW = 'Nuevo',
  ASSIGNED = 'Asignado',
  IN_PROGRESS = 'En Proceso',
  WAITING = 'En Espera',
  RESOLVED = 'Resuelto',
  CLOSED = 'Cerrado'
}

export class TicketService {
  static calculatePriority(impact: string, urgency: string): string {
    if (impact === 'Alta' && urgency === 'Alta') return 'Crítico';
    if (impact === 'Alta' || urgency === 'Alta') return 'Alta';
    if (impact === 'Media' && urgency === 'Media') return 'Media';
    return 'Baja';
  }

  static async createTicket(data: {
    title: string;
    description: string;
    userId: string;
    departmentId: string;
    categoryId: string;
    impact: string;
    urgency: string;
  }) {
    const id = uuidv4();
    const priority = this.calculatePriority(data.impact, data.urgency);
    
    // Get SLA
    const category = db.prepare('SELECT sla_hours FROM categories WHERE id = ?').get(data.categoryId) as { sla_hours: number };
    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + (category?.sla_hours || 24));

    const stmt = db.prepare(`
      INSERT INTO tickets (id, title, description, user_id, department_id, category_id, impact, urgency, priority, sla_deadline)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, data.title, data.description, data.userId, data.departmentId, data.categoryId, data.impact, data.urgency, priority, slaDeadline.toISOString());

    // Auto-assignment logic
    this.autoAssign(id);

    return this.getTicketById(id);
  }

  static autoAssign(ticketId: string) {
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId) as any;
    
    // Simple assignment: find agent with least active tickets
    const agent = db.prepare(`
      SELECT u.id, COUNT(t.id) as active_count
      FROM users u
      LEFT JOIN tickets t ON u.id = t.assigned_agent_id AND t.status NOT IN ('Resuelto', 'Cerrado')
      WHERE u.role_id = 'agent' AND u.is_active = 1 AND u.is_available = 1
      GROUP BY u.id
      ORDER BY active_count ASC
      LIMIT 1
    `).get() as { id: string };

    if (agent) {
      db.prepare('UPDATE tickets SET assigned_agent_id = ?, status = ? WHERE id = ?')
        .run(agent.id, TicketStatus.ASSIGNED, ticketId);
      
      this.logHistory(ticketId, 'system', 'Auto-assigned to agent', ticket.status, TicketStatus.ASSIGNED);
    }
  }

  static logHistory(ticketId: string, userId: string, action: string, prev: string, next: string) {
    db.prepare('INSERT INTO ticket_history (id, ticket_id, user_id, action, previous_state, new_state) VALUES (?, ?, ?, ?, ?, ?)')
      .run(uuidv4(), ticketId, userId, action, prev, next);
  }

  static getTicketById(id: string) {
    return db.prepare(`
      SELECT t.*, u.name as user_name, a.name as agent_name, c.name as category_name
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN users a ON t.assigned_agent_id = a.id
      JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `).get(id);
  }

  static getAllTickets(filters: any = {}) {
    let query = `
      SELECT t.*, u.name as user_name, a.name as agent_name, c.name as category_name
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN users a ON t.assigned_agent_id = a.id
      JOIN categories c ON t.category_id = c.id
    `;
    const params: any[] = [];

    if (filters.userId) {
      query += ' WHERE t.user_id = ?';
      params.push(filters.userId);
    } else if (filters.agentId) {
      query += ' WHERE t.assigned_agent_id = ?';
      params.push(filters.agentId);
    }

    query += ' ORDER BY t.created_at DESC';
    return db.prepare(query).all(...params);
  }

  static updateStatus(ticketId: string, userId: string, newStatus: string) {
    const ticket = db.prepare('SELECT status FROM tickets WHERE id = ?').get(ticketId) as { status: string };
    if (!ticket) throw new Error('Ticket not found');

    db.prepare('UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newStatus, ticketId);

    this.logHistory(ticketId, userId, `Status changed to ${newStatus}`, ticket.status, newStatus);
    return this.getTicketById(ticketId);
  }

  static logTime(ticketId: string, userId: string, durationMinutes: number, description: string) {
    const id = uuidv4();
    db.prepare(`
      INSERT INTO ticket_time_logs (id, ticket_id, user_id, duration_minutes, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, ticketId, userId, durationMinutes, description);
    
    this.logHistory(ticketId, userId, `Logged ${durationMinutes} minutes: ${description}`, null, null);
    return id;
  }

  static getTimeLogs(ticketId: string) {
    return db.prepare(`
      SELECT l.*, u.name as user_name
      FROM ticket_time_logs l
      JOIN users u ON l.user_id = u.id
      WHERE l.ticket_id = ?
      ORDER BY l.created_at DESC
    `).all(ticketId);
  }

  static getTotalTime(ticketId: string) {
    const result = db.prepare('SELECT SUM(duration_minutes) as total FROM ticket_time_logs WHERE ticket_id = ?').get(ticketId) as { total: number };
    return result?.total || 0;
  }
}
