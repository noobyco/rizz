# 📝 Note Taking App

A beautiful, modern note-taking application built with Bun, TypeScript, and SQLite. Features a responsive design with real-time search, CRUD operations, and a clean, intuitive interface.

## ✨ Features

- **Modern UI**: Beautiful, responsive design with gradient backgrounds and smooth animations
- **Real-time Search**: Search through your notes instantly
- **CRUD Operations**: Create, read, update, and delete notes
- **SQLite Database**: Persistent storage with automatic timestamps
- **TypeScript**: Full type safety and better development experience
- **Bun Runtime**: Fast, modern JavaScript runtime

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed on your system

### Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   bun install
   ```

### Running the Application

Start the development server:
```bash
bun run dev
```

Or start the production server:
```bash
bun start
```

The application will be available at `http://localhost:3001`

## 🏗️ Project Structure

```
├── index.ts          # Main server file with API routes
├── database.ts       # SQLite database management
├── index.html        # Frontend HTML with modern styling
├── app.js           # Frontend JavaScript for note management
├── package.json     # Project dependencies and scripts
└── notes.db         # SQLite database (created automatically)
```

## 🔧 API Endpoints

- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get a specific note
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note
- `GET /api/notes/search/:query` - Search notes

## 💾 Database Schema

The application uses SQLite with the following schema:

```sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🎨 Features

- **Responsive Design**: Works on desktop and mobile devices
- **Search Functionality**: Real-time search through note titles and content
- **Auto-save**: Notes are automatically saved when you click save
- **Timestamps**: Automatic creation and update timestamps
- **Modern UI**: Clean, professional interface with smooth animations
- **Error Handling**: User-friendly error messages and success notifications

## 🛠️ Development

The application uses:
- **Bun** for the runtime and package management
- **TypeScript** for type safety
- **SQLite** for data persistence
- **Vanilla JavaScript** for the frontend (no frameworks needed)
- **CSS Grid** and **Flexbox** for responsive layout

## 📱 Usage

1. **Create a Note**: Click the "➕ New Note" button
2. **Edit a Note**: Click on any note in the sidebar to view it, then click "Edit"
3. **Search Notes**: Use the search box to find specific notes
4. **Delete a Note**: Click "Delete" when viewing a note
5. **Save Changes**: Click "Save" after editing a note

Enjoy your new note-taking application! 🎉

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.0. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
