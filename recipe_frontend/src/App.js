import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * ThemeToggle: Visually rich skeuomorphic theme switch (accessible).
 * Shows a faux-material toggle resembling a sliding sun/moon nubbin with tactile feedback.
 */
// PUBLIC_INTERFACE
function ThemeToggle({ theme, toggleTheme }) {
  // Simple SVGs for "Sun" and "Moon" icons
  const sunIcon =
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" focusable="false" style={{display:'block'}}><circle cx="11" cy="11" r="5.5" fill="#ffe066" stroke="#bc9800" strokeWidth="1.5"/><g stroke="#bc9800" strokeWidth="1.2"><line x1="11" y1="1.5" x2="11" y2="4"/><line x1="11" y1="18" x2="11" y2="20.5"/><line x1="4" y1="11" x2="1.5" y2="11"/><line x1="18" y1="11" x2="20.5" y2="11"/><line x1="5.17" y1="5.17" x2="3.46" y2="3.46"/><line x1="16.83" y1="5.17" x2="18.54" y2="3.46"/><line x1="5.17" y1="16.83" x2="3.46" y2="18.54"/><line x1="16.83" y1="16.83" x2="18.54" y2="18.54"/></g></svg>;
  const moonIcon =
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" focusable="false" style={{display:'block'}}><path d="M18 14.7A7.02 7.02 0 0 1 7.3 4a6 6 0 1 0 10.7 10.7Z" fill="#ffeab6" stroke="#aa821f" strokeWidth="1.32"/></svg>;

  // Skeuomorphic switch: big, tactile, faux-shadow, sliding thumb
  return (
    <button
      className="skeuo-theme-toggle"
      aria-pressed={theme === 'dark'}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      title="Toggle light/dark mode"
      type="button"
      onClick={toggleTheme}
      tabIndex={0}
      style={{
        minWidth:48, height:38, display:'inline-flex', alignItems:'center', gap:10,
        border:'none', background:'none', padding:0, margin:0, cursor:'pointer'
      }}
    >
      <span className="skeuo-toggle-track" data-theme={theme}>
        <span className="skeuo-toggle-thumb" data-theme={theme} style={{
          left: theme === 'dark' ? 'calc(55% - 4px)' : '4px',
          boxShadow: theme === 'dark'
            ? '0 4px 14px #14121855, 0 0.5px 2px #ffeab630 inset'
            : '0 4.5px 14px #e1bd5855, 0 0.5px 2.2px #fffefd50 inset',
          background: theme === 'dark'
            ? 'linear-gradient(140deg,#291d10 95%,#564119 130%)'
            : 'linear-gradient(120deg,#fff9c6 65%,#ffeab6 120%)'
        }}>
          {theme === 'dark' ? moonIcon : sunIcon}
        </span>
        {/* track sun/moon shadows */}
        <span className="skeuo-toggle-icon skeuo-toggle-sun" aria-hidden="true">{sunIcon}</span>
        <span className="skeuo-toggle-icon skeuo-toggle-moon" aria-hidden="true">{moonIcon}</span>
      </span>
      <span className="skeuo-toggle-label" style={{
        fontWeight: 600, fontSize:'1.01rem', color:'#b5872f', fontFamily:'Segoe UI,Comic Sans MS,cursive',
        letterSpacing:'.07em', textShadow:'0 2px 6px #fff9c644'
      }}>
        {theme === 'dark' ? 'Dark' : 'Light'}
      </span>
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          minWidth: 'fit-content'
        }}>
          <button className="skeuo-btn add-note-btn" onClick={handleAddClick}>+ Add Note</button>
          {/* The new switch sits flush inline, matching tactile style */}
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
