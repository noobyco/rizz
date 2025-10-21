// Global functions for HTML onclick handlers
let noteApp;

function createNewNote() {
    if (noteApp) {
        noteApp.createNewNote();
    }
}

function saveNote() {
    if (noteApp) {
        noteApp.saveNote();
    }
}

function cancelEdit() {
    if (noteApp) {
        noteApp.cancelEdit();
    }
}

function startEdit() {
    if (noteApp) {
        noteApp.startEdit();
    }
}

function deleteNote() {
    if (noteApp) {
        noteApp.deleteNote();
    }
}

// Note Management Application
class NoteApp {
    constructor() {
        this.notes = [];
        this.currentNote = null;
        this.isEditing = false;
        this.searchTimeout = null;
        
        this.init();
    }

    async init() {
        console.log('Initializing NoteApp...');
        await this.loadNotes();
        this.setupEventListeners();
        this.renderNotesList();
        console.log('NoteApp initialized successfully');
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.searchNotes(e.target.value);
            }, 300);
        });

        // Global click handler for note selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.note-item')) {
                const noteId = parseInt(e.target.closest('.note-item').dataset.noteId);
                this.selectNote(noteId);
            }
        });
    }

    async loadNotes() {
        try {
            console.log('Loading notes...');
            const response = await fetch('/api/notes');
            console.log('Response status:', response.status);
            if (!response.ok) throw new Error('Failed to load notes');
            
            this.notes = await response.json();
            console.log('Loaded notes:', this.notes);
        } catch (error) {
            console.error('Error loading notes:', error);
            this.showError('Failed to load notes');
        }
    }

    async searchNotes(query) {
        if (!query.trim()) {
            this.renderNotesList();
            return;
        }

        try {
            const response = await fetch(`/api/notes/search/${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Search failed');
            
            const searchResults = await response.json();
            this.renderNotesList(searchResults);
        } catch (error) {
            console.error('Error searching notes:', error);
            this.showError('Search failed');
        }
    }

    renderNotesList(notesToRender = this.notes) {
        console.log('Rendering notes list:', notesToRender);
        const notesList = document.getElementById('notesList');
        
        if (notesToRender.length === 0) {
            notesList.innerHTML = '<div class="loading">No notes found</div>';
            return;
        }

        notesList.innerHTML = notesToRender.map(note => `
            <div class="note-item ${this.currentNote?.id === note.id ? 'active' : ''}" 
                 data-note-id="${note.id}">
                <div class="note-title">${this.escapeHtml(note.title)}</div>
                <div class="note-preview">${this.escapeHtml(note.content.substring(0, 100))}${note.content.length > 100 ? '...' : ''}</div>
                <div class="note-date">${this.formatDate(note.updated_at)}</div>
            </div>
        `).join('');
    }

    selectNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;

        this.currentNote = note;
        this.isEditing = false;
        this.renderEditor();
        this.renderNotesList();
    }

    createNewNote() {
        this.currentNote = {
            id: null,
            title: '',
            content: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        this.isEditing = true;
        this.renderEditor();
        this.renderNotesList();
    }

    renderEditor() {
        const editor = document.getElementById('editor');
        
        if (!this.currentNote) {
            editor.innerHTML = `
                <div class="empty-state">
                    <h3>Welcome to your note-taking app!</h3>
                    <p>Create a new note to get started, or select an existing note from the sidebar.</p>
                </div>
            `;
            return;
        }

        if (this.isEditing) {
            editor.innerHTML = `
                <div class="editor-header">
                    <div class="editor-title">${this.currentNote.id ? 'Edit Note' : 'New Note'}</div>
                    <div class="editor-actions">
                        <button class="btn btn-save" onclick="saveNote()">Save</button>
                        <button class="btn btn-cancel" onclick="cancelEdit()">Cancel</button>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="noteTitle">Title</label>
                    <input type="text" id="noteTitle" value="${this.escapeHtml(this.currentNote.title)}" 
                           placeholder="Enter note title...">
                </div>
                
                <div class="form-group">
                    <label for="noteContent">Content</label>
                    <textarea id="noteContent" placeholder="Write your note here...">${this.escapeHtml(this.currentNote.content)}</textarea>
                </div>
            `;
        } else {
            editor.innerHTML = `
                <div class="editor-header">
                    <div class="editor-title">${this.escapeHtml(this.currentNote.title)}</div>
                    <div class="editor-actions">
                        <button class="btn btn-save" onclick="startEdit()">Edit</button>
                        <button class="btn btn-delete" onclick="deleteNote()">Delete</button>
                    </div>
                </div>
                
                <div style="white-space: pre-wrap; line-height: 1.6; color: #374151;">
                    ${this.escapeHtml(this.currentNote.content)}
                </div>
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
                    Created: ${this.formatDate(this.currentNote.created_at)}
                    ${this.currentNote.updated_at !== this.currentNote.created_at ? 
                        `<br>Updated: ${this.formatDate(this.currentNote.updated_at)}` : ''}
                </div>
            `;
        }
    }

    startEdit() {
        this.isEditing = true;
        this.renderEditor();
    }

    cancelEdit() {
        if (this.currentNote.id) {
            this.isEditing = false;
            this.renderEditor();
        } else {
            this.currentNote = null;
            this.renderEditor();
        }
    }

    async saveNote() {
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContent').value.trim();

        if (!title || !content) {
            this.showError('Title and content are required');
            return;
        }

        try {
            let savedNote;
            
            if (this.currentNote.id) {
                // Update existing note
                const response = await fetch(`/api/notes/${this.currentNote.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, content })
                });
                
                if (!response.ok) throw new Error('Failed to update note');
                savedNote = await response.json();
            } else {
                // Create new note
                const response = await fetch('/api/notes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, content })
                });
                
                if (!response.ok) throw new Error('Failed to create note');
                savedNote = await response.json();
            }

            // Update local notes array
            if (this.currentNote.id) {
                const index = this.notes.findIndex(n => n.id === this.currentNote.id);
                this.notes[index] = savedNote;
            } else {
                this.notes.unshift(savedNote);
            }

            this.currentNote = savedNote;
            this.isEditing = false;
            this.renderEditor();
            this.renderNotesList();
            this.showSuccess(this.currentNote.id ? 'Note updated successfully!' : 'Note created successfully!');
            
        } catch (error) {
            console.error('Error saving note:', error);
            this.showError('Failed to save note');
        }
    }

    async deleteNote() {
        if (!this.currentNote.id) return;

        if (!confirm('Are you sure you want to delete this note?')) return;

        try {
            const response = await fetch(`/api/notes/${this.currentNote.id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete note');

            // Remove from local notes array
            this.notes = this.notes.filter(n => n.id !== this.currentNote.id);
            
            this.currentNote = null;
            this.isEditing = false;
            this.renderEditor();
            this.renderNotesList();
            this.showSuccess('Note deleted successfully!');
            
        } catch (error) {
            console.error('Error deleting note:', error);
            this.showError('Failed to delete note');
        }
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.error, .success');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = type;
        messageDiv.textContent = message;
        
        // Insert at the top of the editor
        const editor = document.getElementById('editor');
        editor.insertBefore(messageDiv, editor.firstChild);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
}

// Initialize the app
noteApp = new NoteApp();
