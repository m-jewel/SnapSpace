import React, { useState } from 'react';

function CreatePreset({ onDone, onCancel }) {
  // Step 1: gather input
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState([{ type: 'url', target: '' }]);
  const [step, setStep] = useState(1); // 1 = form, 2 = summary

  // Add an item row
  const addItem = () => {
    setItems([...items, { type: 'url', target: '' }]);
  };

  // Update an item
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

  const handleNext = () => {
    if (!name) {
      alert("Please provide a preset name.");
      return;
    }
    setStep(2);
  };

  // Step 2: show summary
  const handleConfirm = (action) => {
    // action = 'confirm' or 'launch'
    const newPreset = {
      name,
      description,
      items
    };

    window.electronAPI.createPreset(newPreset).then((res) => {
      if (!res.success) {
        alert(`Failed to create preset: ${res.message}`);
      } else {
        alert('Preset created successfully!');
        onDone({ newPresetName: name, action });
      }
    });
  };

  if (step === 1) {
    // Show form
    return (
      <div style={styles.container}>
        <h2>Create a New Preset</h2>

        <label style={styles.label}>
          Preset Name (required):
          <input 
            style={styles.input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label style={styles.label}>
          Description (optional):
          <input 
            style={styles.input}
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <h3>Items to Launch:</h3>
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
          <button style={styles.saveBtn} onClick={handleNext}>
            Next
          </button>
          <button style={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Summary
  return (
    <div style={styles.container}>
      <h2>Review Your Preset</h2>
      <p><strong>Name:</strong> {name}</p>
      <p><strong>Description:</strong> {description}</p>
      <h3>Items:</h3>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item.type.toUpperCase()} - {item.target}</li>
        ))}
      </ul>
      <p>Would you like to confirm and save this preset?</p>
      <div style={{ marginTop: '20px' }}>
        <button style={styles.saveBtn} onClick={() => handleConfirm('confirm')}>
          Confirm
        </button>
        <button style={styles.saveBtn} onClick={() => handleConfirm('launch')}>
          Confirm & Launch
        </button>
        <button style={styles.cancelBtn} onClick={() => setStep(1)}>
          Back
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

export default CreatePreset;
