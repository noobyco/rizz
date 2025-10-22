import { db } from "./database";

// API Routes
const apiRoutes = {
  // Get all notes
  "GET /api/notes": async () => {
    try {
      const notes = db.getAllNotes();
      return new Response(JSON.stringify(notes), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to fetch notes" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },

  // Get note by ID
  "GET /api/notes/:id": async (req: Request) => {
    try {
      const url = new URL(req.url);
      const id = parseInt(url.pathname.split('/').pop() || '0');
      
      if (isNaN(id)) {
        return new Response(JSON.stringify({ error: "Invalid note ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const note = db.getNoteById(id);
      if (!note) {
        return new Response(JSON.stringify({ error: "Note not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify(note), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to fetch note" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },

  // Create new note
  "POST /api/notes": async (req: Request) => {
    try {
      const body = await req.json() as { title: string; content: string };
      const { title, content } = body;

      if (!title || !content) {
        return new Response(JSON.stringify({ error: "Title and content are required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const note = db.createNote({ title, content });
      return new Response(JSON.stringify(note), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to create note" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },

  // Update note
  "PUT /api/notes/:id": async (req: Request) => {
    try {
      const url = new URL(req.url);
      const id = parseInt(url.pathname.split('/').pop() || '0');
      
      if (isNaN(id)) {
        return new Response(JSON.stringify({ error: "Invalid note ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const body = await req.json() as { title: string; content: string };
      const { title, content } = body;

      const updatedNote = db.updateNote(id, { title, content });
      if (!updatedNote) {
        return new Response(JSON.stringify({ error: "Note not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify(updatedNote), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to update note" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },

  // Delete note
  "DELETE /api/notes/:id": async (req: Request) => {
    try {
      const url = new URL(req.url);
      const id = parseInt(url.pathname.split('/').pop() || '0');
      
      if (isNaN(id)) {
        return new Response(JSON.stringify({ error: "Invalid note ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const deleted = db.deleteNote(id);
      if (!deleted) {
        return new Response(JSON.stringify({ error: "Note not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ message: "Note deleted successfully" }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to delete note" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },

  // Search notes
  "GET /api/notes/search/:query": async (req: Request) => {
    try {
      const url = new URL(req.url);
      const query = decodeURIComponent(url.pathname.split('/').pop() || '');
      
      const notes = db.searchNotes(query);
      return new Response(JSON.stringify(notes), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to search notes" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};

// Start the server
const port = Number(Bun.env.PORT || 3000);
Bun.serve({
  port,
  fetch: async (req: Request) => {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // Handle root route
    if (path === "/") {
      const html = await Bun.file("./index.html").text();
      return new Response(html, {
        headers: { "Content-Type": "text/html" }
      });
    }

    // Handle static files
    if (path === "/app.js") {
      const js = await Bun.file("./app.js").text();
      return new Response(js, {
        headers: { "Content-Type": "application/javascript" }
      });
    }


    // Handle API routes
    const routeKey = `${method} ${path}`;
    
    // Check for exact matches first
    if (apiRoutes[routeKey as keyof typeof apiRoutes]) {
      return apiRoutes[routeKey as keyof typeof apiRoutes](req);
    }

    // Check for parameterized routes
    if (method === "GET" && path.startsWith("/api/notes/")) {
      const id = path.split("/").pop();
      if (id && !isNaN(parseInt(id))) {
        return apiRoutes["GET /api/notes/:id"](req);
      }
    }

    if (method === "PUT" && path.startsWith("/api/notes/")) {
      const id = path.split("/").pop();
      if (id && !isNaN(parseInt(id))) {
        return apiRoutes["PUT /api/notes/:id"](req);
      }
    }

    if (method === "DELETE" && path.startsWith("/api/notes/")) {
      const id = path.split("/").pop();
      if (id && !isNaN(parseInt(id))) {
        return apiRoutes["DELETE /api/notes/:id"](req);
      }
    }

    if (method === "GET" && path.startsWith("/api/notes/search/")) {
      return apiRoutes["GET /api/notes/search/:query"](req);
    }

    return new Response("Not Found", { status: 404 });
  },
  development: {
    hmr: true,
    console: true,
  }
});

console.log(`🚀 Note-taking app running on http://localhost:${port}`);