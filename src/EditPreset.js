import React, { useState, useEffect } from 'react';

function EditPreset({ preset, onSave, onCancel }) {
  const [oldName] = useState(preset?.name || '');
  const [newName, setNewName] = useState(preset?.name || '');
  const [description, setDescription] = useState(preset?.description || '');
  const [icon, setIcon] = useState(preset?.icon || '');
  const [items, setItems] = useState(preset?.items || []);

  useEffect(() => {
    if (!preset) {
      alert("No preset to edit.");
      onCancel();
    }
  }, [preset, onCancel]);

  // Helper: Validate URL
  function isValidUrl(value) {
    try {
      new URL(value);
      return true;
    } catch (err) {
      return false;
    }
  }

  // For "Browse" button when item.type === 'app'
  const handleBrowseExe = (index) => {
    window.electronAPI.browseForExe().then((filePath) => {
      if (filePath) {
        updateItem(index, 'target', filePath);
      }
    });
  };

  // Add a new item row
  const addItem = () => {
    setItems([...items, { type: 'url', target: '' }]);
  };

  // Update an item (type or target)
  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  // Remove an item
  const removeItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  // Validate and save changes
  const handleSave = () => {
    if (!newName.trim()) {
      alert("Preset name is required.");
      return;
    }

    // Check for empty items
    const hasEmptyItem = items.some(item => !item.target.trim());
    if (hasEmptyItem) {
      alert("One or more items are empty. Please fill them or remove them.");
      return;
    }

    // Check if there's at least one item
    if (items.length === 0) {
      alert("Please add at least one valid item.");
      return;
    }

    // Validate URLs
    const hasInvalidUrl = items.some(item => {
      if (item.type === 'url') {
        return !isValidUrl(item.target.trim());
      }
      return false;
    });
    if (hasInvalidUrl) {
      alert("One or more URLs are invalid. Please check them.");
      return;
    }

    // Build updated preset
    const updatedPreset = {
      oldName,
      newName: newName.trim(),
      description: description.trim(),
      icon: icon.trim(),
      items
    };

    // Send the updated preset to main process
    window.electronAPI.updatePreset(updatedPreset).then((res) => {
      if (!res.success) {
        alert(`Failed to update preset: ${res.message}`);
      } else {
        alert("Preset updated successfully!");
        onSave();
      }
    });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Edit Preset</h2>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>
          Preset Name <span style={styles.required}>(required)</span>
        </label>
        <input
          style={styles.input}
          type="text"
          placeholder="e.g., Study Mode"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>
          Description <span style={styles.optional}>(optional)</span>
        </label>
        <input
          style={styles.input}
          type="text"
          placeholder="e.g., Opens Canvas, Notion..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>
          Icon <span style={styles.optional}>(optional)</span>
        </label>
        <input
          style={styles.input}
          type="text"
          placeholder="e.g., 📚 or https://example.com/icon.png"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
        />
      </div>

      <h3 style={styles.subheader}>Items to Launch</h3>
      {items.map((item, index) => (
        <div key={index} style={styles.itemRow}>
          <select
            style={styles.select}
            value={item.type}
            onChange={(e) => updateItem(index, 'type', e.target.value)}
          >
            <option value="url">URL</option>
            <option value="app">App</option>
          </select>
          <input
            style={styles.inputItem}
            type="text"
            placeholder={item.type === 'url' ? 'https://example.com' : 'AppName or path'}
            value={item.target}
            onChange={(e) => updateItem(index, 'target', e.target.value)}
          />
          {item.type === 'app' && (
            <button style={styles.browseBtn} onClick={() => handleBrowseExe(index)}>
              Browse
            </button>
          )}
          <button style={styles.removeBtn} onClick={() => removeItem(index)}>
            ✕
          </button>
        </div>
      ))}

      <button style={styles.addBtn} onClick={addItem}>
        + Add Another Item
      </button>

      <div style={styles.buttonRow}>
        <button style={styles.primaryBtn} onClick={handleSave}>
          Save Changes
        </button>
        <button style={styles.secondaryBtn} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// --- STYLES ---
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    background: '#fff',
    borderRadius: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxWidth: '400px',
    margin: '0 auto'
  },
  header: {
    fontSize: '1.8rem',
    marginBottom: '20px',
    color: '#333'
  },
  fieldGroup: {
    width: '100%',
    marginBottom: '15px'
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    boxSizing: 'border-box'
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '10px'
  },
  select: {
    padding: '6px 10px',
    width: '80px',
    borderRadius: '6px',
    border: '1px solid #ccc'
  },
  inputItem: {
    flex: 1,
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #ccc'
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '15px'
  },
  primaryBtn: {
    padding: '6px 12px',
    margin: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    background: '#4a4a4a',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.2s, background 0.2s'
  },
  secondaryBtn: {
    padding: '6px 12px',
    margin: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    background: '#f4f4f9',
    color: '#333',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, background 0.2s'
  },
  addBtn: {
    padding: '6px 12px',
    margin: '10px 0',
    cursor: 'pointer',
    fontSize: '0.85rem',
    background: '#e0e0e0',
    color: '#333',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, background 0.2s'
  }
};

export default EditPreset;
