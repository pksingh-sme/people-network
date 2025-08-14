import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import { z } from "zod";

const app = express();
app.use(cors());
app.use(express.json());

/** DB init **/
const db = new Database("./network.db");
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  dob TEXT,
  phone TEXT,
  email TEXT,
  notes TEXT,
  group_tag TEXT DEFAULT 'friend' -- e.g. 'family','friend','colleague'
);

CREATE TABLE IF NOT EXISTS relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id INTEGER NOT NULL,
  related_person_id INTEGER NOT NULL,
  relationship_type TEXT NOT NULL,
  UNIQUE(person_id, related_person_id, relationship_type),
  FOREIGN KEY(person_id) REFERENCES people(id) ON DELETE CASCADE,
  FOREIGN KEY(related_person_id) REFERENCES people(id) ON DELETE CASCADE
);
`);

const personSchema = z.object({
  name: z.string().min(1),
  dob: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  notes: z.string().optional().nullable(),
  group_tag: z.string().optional().nullable()
});

const relationshipSchema = z.object({
  person_id: z.number().int().positive(),
  related_person_id: z.number().int().positive(),
  relationship_type: z.string().min(1)
});

/** People CRUD **/
app.get("/people", (req, res) => {
  const rows = db.prepare("SELECT * FROM people").all();
  res.json(rows);
});

app.get("/people/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM people WHERE id=?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

app.post("/people", (req, res) => {
  const parse = personSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);
  const { name, dob, phone, email, notes, group_tag } = parse.data;
  const stmt = db.prepare(`
    INSERT INTO people (name, dob, phone, email, notes, group_tag)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(name, dob ?? null, phone ?? null, email ?? null, notes ?? null, group_tag ?? "friend");
  const created = db.prepare("SELECT * FROM people WHERE id=?").get(info.lastInsertRowid);
  res.status(201).json(created);
});

app.put("/people/:id", (req, res) => {
  const parse = personSchema.partial().safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);
  const existing = db.prepare("SELECT * FROM people WHERE id=?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Not found" });

  const merged = { ...existing, ...parse.data };
  const stmt = db.prepare(`
    UPDATE people SET name=?, dob=?, phone=?, email=?, notes=?, group_tag=? WHERE id=?
  `);
  stmt.run(
    merged.name,
    merged.dob ?? null,
    merged.phone ?? null,
    merged.email ?? null,
    merged.notes ?? null,
    merged.group_tag ?? "friend",
    req.params.id
  );
  res.json(db.prepare("SELECT * FROM people WHERE id=?").get(req.params.id));
});

app.delete("/people/:id", (req, res) => {
  db.prepare("DELETE FROM people WHERE id=?").run(req.params.id);
  // Also clean relationships via ON DELETE CASCADE (if using pragma foreign_keys=ON)
  res.status(204).send();
});

/** Relationships **/
app.get("/relationships", (req, res) => {
  const rows = db.prepare("SELECT * FROM relationships").all();
  res.json(rows);
});

app.post("/relationships", (req, res) => {
  const parse = relationshipSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);
  const { person_id, related_person_id, relationship_type } = parse.data;
  if (person_id === related_person_id) {
    return res.status(400).json({ error: "Cannot relate a person to themselves" });
  }
  const p1 = db.prepare("SELECT id FROM people WHERE id=?").get(person_id);
  const p2 = db.prepare("SELECT id FROM people WHERE id=?").get(related_person_id);
  if (!p1 || !p2) return res.status(400).json({ error: "Invalid person ids" });

  try {
    const info = db.prepare(`
      INSERT INTO relationships (person_id, related_person_id, relationship_type)
      VALUES (?, ?, ?)
    `).run(person_id, related_person_id, relationship_type);
    const created = db.prepare("SELECT * FROM relationships WHERE id=?").get(info.lastInsertRowid);
    res.status(201).json(created);
  } catch (e) {
    return res.status(409).json({ error: "Relationship already exists or invalid" });
  }
});

app.delete("/relationships/:id", (req, res) => {
  db.prepare("DELETE FROM relationships WHERE id=?").run(req.params.id);
  res.status(204).send();
});

/** Graph: /network/:id -> Vis.js {nodes, edges} **/
app.get("/network/:id", (req, res) => {
  const id = Number(req.params.id);
  const center = db.prepare("SELECT * FROM people WHERE id=?").get(id);
  if (!center) return res.status(404).json({ error: "Person not found" });

  const rels = db.prepare(`
    SELECT r.*, p2.name as related_name, p2.group_tag as related_group
    FROM relationships r
    JOIN people p2 ON p2.id = r.related_person_id
    WHERE r.person_id=?
  `).all(id);

  const reciprocal = db.prepare(`
    SELECT r.*, p1.name as related_name, p1.group_tag as related_group
    FROM relationships r
    JOIN people p1 ON p1.id = r.person_id
    WHERE r.related_person_id=?
  `).all(id);

  const neighborSet = new Map();
  const edges = [];

  for (const r of rels) {
    neighborSet.set(r.related_person_id, { id: r.related_person_id, label: r.related_name, group: r.related_group || "friend" });
    edges.push({ from: id, to: r.related_person_id, label: r.relationship_type });
  }
  for (const r of reciprocal) {
    neighborSet.set(r.person_id, { id: r.person_id, label: r.related_name, group: r.related_group || "friend" });
    edges.push({ from: r.person_id, to: id, label: r.relationship_type });
  }

  const nodes = [
    { id, label: center.name, group: center.group_tag || "friend", shape: "dot" },
    ...Array.from(neighborSet.values())
  ];

  res.json({ nodes, edges });
});

/** Seed (optional) **/
app.post("/seed", (req, res) => {
  const clear = req.query.clear === "true";
  if (clear) {
    db.exec("DELETE FROM relationships; DELETE FROM people;");
  }
  const pStmt = db.prepare("INSERT INTO people (name, group_tag, email) VALUES (?,?,?)");
  const ids = {};
  ids.pramod = pStmt.run("Pramod", "family", "pramod@example.com").lastInsertRowid;
  ids.amit = pStmt.run("Amit", "friend", "amit@example.com").lastInsertRowid;
  ids.ravi = pStmt.run("Ravi", "colleague", "ravi@work.com").lastInsertRowid;
  ids.isha = pStmt.run("Isha", "family", "isha@example.com").lastInsertRowid;

  const rStmt = db.prepare("INSERT INTO relationships (person_id, related_person_id, relationship_type) VALUES (?,?,?)");
  rStmt.run(ids.pramod, ids.amit, "Brother");
  rStmt.run(ids.pramod, ids.ravi, "Friend");
  rStmt.run(ids.isha, ids.pramod, "Sister");

  res.json({ ok: true, ids });
});

/** Start **/
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
