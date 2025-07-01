import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * ThemeToggle toggles light/dark skeuomorphic theme.
 * @param {object} props
 * @param {string} props.theme - current theme
 * @param {function} props.toggleTheme - fn to change theme
 */
function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button
      className="theme-toggle"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      onClick={toggleTheme}
      title="Toggle theme"
      type="button"
    >
      {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </button>
  );
}

/**
 * NoteCard component for displaying individual notes with skeuomorphic design.
 * @param {object} props
 * @param {object} props.note
 * @param {Function} props.onEdit
 * @param {Function} props.onDelete
 */
function NoteCard({ note, onEdit, onDelete }) {
  return (
    <div className="note-card" role="region" aria-label="Note">
      <div className="note-content">
        <div className="note-title">{note.title}</div>
        <div className="note-text">{note.content}</div>
      </div>
      <div className="note-actions">
        <button className="note-btn edit" onClick={() => onEdit(note)} aria-label="Edit note">✏️</button>
        <button className="note-btn delete" onClick={() => onDelete(note.id)} aria-label="Delete note">🗑️</button>
      </div>
    </div>
  );
}

/**
 * NoteForm allows creating or editing a note.
 * @param {object} props
 * @param {object|null} props.initial
 * @param {Function} props.onSubmit
 * @param {Function} props.onCancel
 */
function NoteForm({ initial, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [content, setContent] = useState(initial?.content || '');

  // PUBLIC_INTERFACE
  function handleSubmit(e) {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSubmit({ ...initial, title: title.trim(), content: content.trim() });
      setTitle('');
      setContent('');
    }
  }

  return (
    <form className="note-form paper" onSubmit={handleSubmit} role="form">
      <h2>{initial ? 'Edit Note' : 'Add Note'}</h2>
      <label>
        Title
        <input
          className="skeuo-input"
          value={title}
          maxLength={30}
          placeholder="Note Title"
          onChange={e => setTitle(e.target.value)}
          required
          aria-label="Note title"
        />
      </label>
      <label>
        Content
        <textarea
          className="skeuo-textarea"
          value={content}
          maxLength={500}
          placeholder="Write your note here..."
          rows={5}
          onChange={e => setContent(e.target.value)}
          required
          aria-label="Note content"
        />
      </label>
      <div className="form-actions">
        <button className="skeuo-btn" type="submit">{initial ? 'Save' : 'Add'}</button>
        <button className="skeuo-btn secondary" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

/**
 * NotesApp is the main notes UI: list, add, edit, delete.
 * @param {object} props
 * @param {string} props.theme - current theme
 * @param {function} props.toggleTheme - fn to change theme
 */
// PUBLIC_INTERFACE
function NotesApp({ theme, toggleTheme }) {
  // Array of {id, title, content}
  const [notes, setNotes] = useState(() => {
    try {
      const local = localStorage.getItem('notes');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });
  const [editing, setEditing] = useState(null); // note being edited if any
  const [showForm, setShowForm] = useState(false);

  // Sync notes to localStorage to persist between reloads
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  // PUBLIC_INTERFACE
  function handleAddClick() {
    setEditing(null);
    setShowForm(true);
  }
  // PUBLIC_INTERFACE
  function handleEdit(note) {
    setEditing(note);
    setShowForm(true);
  }
  // PUBLIC_INTERFACE
  function handleDelete(id) {
    if (window.confirm('Delete this note?')) {
      setNotes(notes => notes.filter(n => n.id !== id));
      if (editing && editing.id === id) {
        setEditing(null);
        setShowForm(false);
      }
    }
  }
  // PUBLIC_INTERFACE
  function handleFormSubmit(note) {
    if (editing) {
      setNotes(notes => notes.map(n => n.id === note.id ? note : n));
    } else {
      setNotes(notes => [
        ...notes, { ...note, id: Date.now().toString() }
      ]);
    }
    setEditing(null);
    setShowForm(false);
  }
  // PUBLIC_INTERFACE
  function handleCancelForm() {
    setEditing(null);
    setShowForm(false);
  }

  return (
    <main className="skeuo-notes-wrapper">
      <header className="skeuo-header">
        <h1 className="skeuo-title">📝 My Notes</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="skeuo-btn add-note-btn" onClick={handleAddClick}>+ Add Note</button>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </header>
      {showForm && (
        <NoteForm
          key={editing ? editing.id : 'new'}
          initial={editing}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
        />
      )}
      {!showForm && notes.length === 0 && (
        <div className="empty-state paper">
          <p>No notes yet! Click "+ Add Note" to create your first note.</p>
        </div>
      )}
      {!showForm && notes.length > 0 &&
        <section className="notes-grid" aria-label="Notes List">
          {notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </section>
      }
    </main>
  );
}

/**
 * The entry point for the Notes App with skeuomorphic UI and theme toggle.
 */
// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState(() => {
    // Prefer localStorage, then prefers-color-scheme, then light
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('theme');
      if (local && (local === 'light' || local === 'dark')) return local;
      // auto-detect
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  // Apply theme to document root
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  // PUBLIC_INTERFACE
  function toggleTheme() {
    setTheme(theme => theme === 'light' ? 'dark' : 'light');
  }

  return <NotesApp theme={theme} toggleTheme={toggleTheme} />;
}

export default App;
