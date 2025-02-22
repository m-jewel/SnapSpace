import React, { useState, useEffect } from 'react';

function EditPreset({ preset, onSave, onCancel }) {
  // We'll store the original name, and track any changes in newName
  const [oldName] = useState(preset?.name || '');
  const [newName, setNewName] = useState(preset?.name || '');
  const [description, setDescription] = useState(preset?.description || '');
  const [icon, setIcon] = useState(preset?.icon || ''); // <-- NEW: icon field
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
      icon: icon.trim(),          // <-- Include updated icon
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

  // If for some reason we have no preset, return null to avoid errors
  if (!preset) return null;

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

      {/* NEW: Icon Field */}
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
        <p style={styles.hint}>
          Enter an emoji or an image URL (will display in presets list).
        </p>
      </div>

      <h3 style={styles.subheader}>Items:</h3>
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
          {/* Only show "Browse" if it's an app */}
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
    alignSelf: 'center',
    justifyContent: 'flex-start',
    width: '70%',
    maxWidth: '600px',
    margin: '0 auto',
    marginTop: '30px'
  },
  header: {
    fontSize: '1.5rem',
    marginBottom: '10px'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '10px'
  },
  label: {
    fontSize: '0.9rem',
    marginBottom: '4px',
    fontWeight: 'bold'
  },
  required: {
    color: '#f00',
    fontSize: '0.8rem'
  },
  optional: {
    color: '#999',
    fontSize: '0.8rem'
  },
  input: {
    padding: '8px',
    fontSize: '0.9rem',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  hint: {
    margin: '4px 0',
    fontSize: '0.8rem',
    color: '#666'
  },
  subheader: {
    fontSize: '1.1rem',
    margin: '15px 0 8px 0'
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px'
  },
  select: {
    padding: '6px',
    fontSize: '0.9rem',
    marginRight: '6px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  inputItem: {
    flex: 1,
    padding: '8px',
    fontSize: '0.9rem',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  browseBtn: {
    marginLeft: '6px',
    backgroundColor: '#34495e',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 10px',
    cursor: 'pointer'
  },
  removeBtn: {
    marginLeft: '6px',
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 10px',
    cursor: 'pointer'
  },
  addBtn: {
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 12px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    alignSelf: 'flex-start'
  },
  buttonRow: {
    display: 'flex',
    marginTop: '20px',
    gap: '10px'
  },
  primaryBtn: {
    backgroundColor: '#2ecc71',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 16px',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  secondaryBtn: {
    backgroundColor: '#bdc3c7',
    color: '#2c3e50',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 16px',
    fontSize: '0.9rem',
    cursor: 'pointer'
  }
};

export default EditPreset;
