import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { TicketService } from "./src/server/services/TicketService.js";
import db from "./src/server/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Mock Auth for Demo (RBAC)
  app.post("/api/auth/login", (req, res) => {
    const { role } = req.body;
    const userId = role === 'agent' ? 'u2' : 'u4';
    
    // Fetch actual user data from DB to get availability
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    
    res.json({ 
      user: { 
        id: user.id, 
        name: user.name, 
        role: role || "employee",
        department: role === 'agent' ? 'IT' : 'Sales',
        departmentId: role === 'agent' ? 'd1' : 'd2',
        isAvailable: !!user.is_available
      } 
    });
  });

  app.patch("/api/users/:id/availability", (req, res) => {
    const { id } = req.params;
    const { isAvailable } = req.body;
    try {
      db.prepare('UPDATE users SET is_available = ? WHERE id = ?')
        .run(isAvailable ? 1 : 0, id);
      res.json({ success: true, isAvailable });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/tickets", (req, res) => {
    const { userId, agentId } = req.query;
    const tickets = TicketService.getAllTickets({ userId, agentId });
    res.json(tickets);
  });

  app.post("/api/tickets", async (req, res) => {
    try {
      const ticket = await TicketService.createTicket(req.body);
      res.status(201).json(ticket);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/tickets/:id/status", (req, res) => {
    const { id } = req.params;
    const { status, userId } = req.body;
    try {
      const ticket = TicketService.updateStatus(id, userId, status);
      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/metrics", (req, res) => {
    // Basic metrics for dashboard
    const tickets = TicketService.getAllTickets();
    const metrics = {
      total: tickets.length,
      byStatus: tickets.reduce((acc: any, t: any) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {}),
      byPriority: tickets.reduce((acc: any, t: any) => {
        acc[t.priority] = (acc[t.priority] || 0) + 1;
        return acc;
      }, {})
    };
    res.json(metrics);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
