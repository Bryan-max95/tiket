export type Role = 'admin' | 'supervisor' | 'agent' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  departmentId: string;
  isAvailable?: boolean;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  user_id: string;
  user_name: string;
  department_id: string;
  category_id: string;
  category_name: string;
  impact: 'Baja' | 'Media' | 'Alta';
  urgency: 'Baja' | 'Media' | 'Alta';
  priority: 'Baja' | 'Media' | 'Alta' | 'Crítico';
  status: string;
  assigned_agent_id?: string;
  agent_name?: string;
  created_at: string;
  updated_at: string;
  sla_deadline: string;
}

export interface Metrics {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}
