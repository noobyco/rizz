import { Database } from "bun:sqlite";

export interface Note {
  id?: number;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

class DatabaseManager {
  private db: Database;

  constructor() {
    this.db = new Database("notes.db");
    this.initializeDatabase();
  }

  private initializeDatabase() {
    // Create notes table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create trigger to update updated_at timestamp
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_notes_timestamp 
      AFTER UPDATE ON notes
      BEGIN
        UPDATE notes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);
  }

  // Get all notes
  getAllNotes(): Note[] {
    const query = this.db.prepare("SELECT * FROM notes ORDER BY updated_at DESC");
    return query.all() as Note[];
  }

  // Get note by ID
  getNoteById(id: number): Note | null {
    const query = this.db.prepare("SELECT * FROM notes WHERE id = ?");
    return query.get(id) as Note | null;
  }

  // Create new note
  createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Note {
    const query = this.db.prepare(`
      INSERT INTO notes (title, content) 
      VALUES (?, ?)
    `);
    const result = query.run(note.title, note.content);
    
    const newNote = this.getNoteById(result.lastInsertRowid as number);
    return newNote!;
  }

  // Update note
  updateNote(id: number, note: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at'>>): Note | null {
    const existingNote = this.getNoteById(id);
    if (!existingNote) return null;

    const query = this.db.prepare(`
      UPDATE notes 
      SET title = COALESCE(?, title), 
          content = COALESCE(?, content)
      WHERE id = ?
    `);
    query.run(note.title, note.content, id);
    
    return this.getNoteById(id);
  }

  // Delete note
  deleteNote(id: number): boolean {
    const query = this.db.prepare("DELETE FROM notes WHERE id = ?");
    const result = query.run(id);
    return result.changes > 0;
  }

  // Search notes
  searchNotes(searchTerm: string): Note[] {
    const query = this.db.prepare(`
      SELECT * FROM notes 
      WHERE title LIKE ? OR content LIKE ? 
      ORDER BY updated_at DESC
    `);
    const searchPattern = `%${searchTerm}%`;
    return query.all(searchPattern, searchPattern) as Note[];
  }

  close() {
    this.db.close();
  }
}

export const db = new DatabaseManager();
