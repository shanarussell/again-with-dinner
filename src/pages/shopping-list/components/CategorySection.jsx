import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const CategorySection = ({ 
  title, 
  icon, 
  items, 
  onItemCheck, 
  onDeleteItem, 
  onUpdateNotes 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingNotes, setEditingNotes] = useState(null);
  const [notesValue, setNotesValue] = useState('');

  const completedItems = items?.filter(item => item.checked).length || 0;
  const totalItems = items?.length || 0;

  const handleNotesEdit = (item) => {
    setEditingNotes(item.id);
    setNotesValue(item.notes || '');
  };

  const handleNotesSave = (itemId) => {
    onUpdateNotes(itemId, notesValue);
    setEditingNotes(null);
    setNotesValue('');
  };

  const handleNotesCancel = () => {
    setEditingNotes(null);
    setNotesValue('');
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Icon name={icon} size={20} color="#6B7280" />
          <div className="text-left">
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">
              {completedItems} of {totalItems} completed
            </p>
          </div>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={20} 
          color="#6B7280" 
        />
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200">
          {items.map((item) => (
            <div
              key={item.id}
              className={`px-4 py-3 border-b border-gray-100 last:border-b-0 ${
                item.checked ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => onItemCheck(item.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    item.checked
                      ? 'bg-green-500 border-green-500 text-white' :'border-gray-300 hover:border-green-500'
                  }`}
                >
                  {item.checked && <Icon name="Check" size={12} />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        item.checked 
                          ? 'text-gray-500 line-through' :'text-gray-900'
                      }`}>
                        {item.name}
                      </h4>
                      <p className={`text-sm ${
                        item.checked 
                          ? 'text-gray-400 line-through' :'text-gray-600'
                      }`}>
                        {item.amount}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleNotesEdit(item)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Add notes"
                      >
                        <Icon name="Edit3" size={16} />
                      </button>
                      
                      {item.customItem && (
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete item"
                        >
                          <Icon name="Trash2" size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {editingNotes === item.id ? (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={notesValue}
                        onChange={(e) => setNotesValue(e.target.value)}
                        placeholder="Add notes (brand, substitutions, etc.)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        autoFocus
                      />
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => handleNotesSave(item.id)}
                          className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleNotesCancel}
                          className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : item.notes && (
                    <p className="text-sm text-gray-500 mt-1 italic">
                      Note: {item.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategorySection;