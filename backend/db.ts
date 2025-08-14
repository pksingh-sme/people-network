import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const initDB = async () => {
  const db = await open({
    filename: "./network.db",
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS people (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      group_type TEXT
    );

    CREATE TABLE IF NOT EXISTS relationships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_id INTEGER NOT NULL,
      to_id INTEGER NOT NULL,
      label TEXT,
      FOREIGN KEY(from_id) REFERENCES people(id),
      FOREIGN KEY(to_id) REFERENCES people(id)
    );
  `);

  return db;
};
