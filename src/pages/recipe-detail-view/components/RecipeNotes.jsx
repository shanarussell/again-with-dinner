import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const RecipeNotes = ({ notes: initialNotes = [] }) => {
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const addNote = () => {
    if (newNote.trim()) {
      const note = {
        id: Date.now(),
        text: newNote.trim(),
        date: new Date().toLocaleDateString()
      };
      setNotes([...notes, note]);
      setNewNote('');
      setIsAddingNote(false);
    }
  };

  const deleteNote = (noteId) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-heading font-semibold text-text-primary">
          Personal Notes
        </h4>
        {!isAddingNote && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setIsAddingNote(true)}
            iconName="Plus"
            iconPosition="left"
          >
            Add Note
          </Button>
        )}
      </div>

      {isAddingNote && (
        <div className="bg-surface-50 rounded-lg p-3 space-y-3">
          <Input
            type="text"
            placeholder="Add your cooking notes, modifications, or tips..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="w-full"
          />
          <div className="flex space-x-2">
            <Button
              variant="primary"
              size="xs"
              onClick={addNote}
              disabled={!newNote.trim()}
            >
              Save Note
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                setIsAddingNote(false);
                setNewNote('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-surface-50 rounded-lg p-3 border border-border"
            >
              <div className="flex justify-between items-start">
                <p className="text-sm text-text-primary flex-1 mr-2">
                  {note.text}
                </p>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => deleteNote(note.id)}
                  iconName="X"
                  className="text-text-secondary hover:text-error p-1"
                />
              </div>
              <p className="text-xs text-text-secondary mt-2">
                Added on {note.date}
              </p>
            </div>
          ))}
        </div>
      )}

      {notes.length === 0 && !isAddingNote && (
        <div className="text-center py-6 text-text-secondary">
          <Icon name="FileText" size={32} color="var(--color-text-muted)" className="mx-auto mb-2" />
          <p className="text-sm">No notes yet</p>
          <p className="text-xs">Add cooking tips and modifications</p>
        </div>
      )}
    </div>
  );
};

export default RecipeNotes;