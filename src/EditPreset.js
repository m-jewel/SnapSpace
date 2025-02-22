import React, { useState, useEffect } from 'react';

function EditPreset({ preset, onSave, onCancel }) {
  // preset is the object with name, description, items
  const [oldName] = useState(preset?.name || '');
  const [newName, setNewName] = useState(preset?.name || '');
  const [description, setDescription] = useState(preset?.description || '');
  const [items, setItems] = useState(preset?.items || []);

  useEffect(() => {
    if (!preset) {
      alert("No preset to edit.");
      onCancel();
    }
  }, [preset, onCancel]);

  const addItem = () => {
    setItems([...items, { type: 'url', target: '' }]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const removeItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleSave = () => {
    if (!newName) {
      alert("Preset name is required.");
      return;
    }
    const updatedPreset = {
      oldName,
      newName,
      description,
      items
    };
    window.electronAPI.updatePreset(updatedPreset).then((res) => {
      if (!res.success) {
        alert(`Failed to update preset: ${res.message}`);
      } else {
        alert("Preset updated successfully!");
        onSave();
      }
    });
  };

  if (!preset) return null; // safety

  return (
    <div style={styles.container}>
      <h2>Edit Preset</h2>

      <label style={styles.label}>
        Preset Name:
        <input
          style={styles.input}
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
      </label>

      <label style={styles.label}>
        Description:
        <input
          style={styles.input}
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <h3>Items:</h3>
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
            style={styles.input}
            type="text"
            placeholder={item.type === 'url' ? 'https://example.com' : 'AppName'}
            value={item.target}
            onChange={(e) => updateItem(index, 'target', e.target.value)}
          />
          <button style={styles.removeBtn} onClick={() => removeItem(index)}>
            Remove
          </button>
        </div>
      ))}
      <button style={styles.addBtn} onClick={addItem}>
        + Add Another Item
      </button>

      <div style={{ marginTop: '20px' }}>
        <button style={styles.saveBtn} onClick={handleSave}>
          Save Changes
        </button>
        <button style={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    alignItems: 'flex-start'
  },
  label: {
    margin: '10px 0'
  },
  input: {
    marginLeft: '10px',
    padding: '5px'
  },
  itemRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '10px'
  },
  select: {
    marginRight: '10px',
    padding: '5px'
  },
  addBtn: {
    marginTop: '10px',
    padding: '5px 10px'
  },
  removeBtn: {
    marginLeft: '10px',
    padding: '5px 10px'
  },
  saveBtn: {
    padding: '10px 20px',
    marginRight: '10px'
  },
  cancelBtn: {
    padding: '10px 20px'
  }
};

export default EditPreset;
