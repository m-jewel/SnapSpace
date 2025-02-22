import React, { useState } from 'react';

function CreatePreset({ onDone, onCancel }) {
  // Step 1: gather input
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState(''); // <-- NEW: icon field
  const [items, setItems] = useState([{ type: 'url', target: '' }]);
  const [step, setStep] = useState(1); // 1 = form, 2 = summary

  // --- Helper: Validate a URL
  function isValidUrl(value) {
    try {
      new URL(value);
      return true;
    } catch (err) {
      return false;
    }
  }

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

  // For "Browse" button when item.type === 'app'
  const handleBrowseExe = (index) => {
    window.electronAPI.browseForExe().then((filePath) => {
      if (filePath) {
        updateItem(index, 'target', filePath);
      }
    });
  };

  // Step 1: Validate before moving to summary
  const handleNext = () => {
    // Check required name
    if (!name.trim()) {
      alert("Please provide a preset name.");
      return;
    }

    // Check if any item is partially filled
    const hasEmptyItem = items.some(item => !item.target.trim());
    // Also check if user ended up with no valid items
    const hasAtLeastOneNonEmpty = items.some(item => item.target.trim());

    if (hasEmptyItem) {
      alert("One or more items are empty. Please fill them or remove them.");
      return;
    }
    if (!hasAtLeastOneNonEmpty) {
      alert("Please add at least one valid item (URL or App).");
      return;
    }

    // Check for invalid URLs
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

    setStep(2);
  };

  // Step 2: show summary (only non-empty items)
  const handleConfirm = (action) => {
    const filteredItems = items.filter(item => item.target.trim());

    const newPreset = {
      name: name.trim(),
      description: description.trim(),
      icon: icon.trim(),           // <-- NEW: store the icon
      items: filteredItems
    };

    window.electronAPI.createPreset(newPreset).then((res) => {
      if (!res.success) {
        alert(`Failed to create preset: ${res.message}`);
      } else {
        alert('Preset created successfully!');
        onDone({ newPresetName: newPreset.name, action });
      }
    });
  };

  // --- RENDER ---

  // STEP 1: FORM
  if (step === 1) {
    return (
      <div style={styles.container}>
        <h2 style={styles.header}>Create a New Preset</h2>

        {/* Preset Name */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Preset Name <span style={styles.required}>(required)</span>
          </label>
          <input
            style={styles.input}
            type="text"
            placeholder="e.g., Study Mode"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Description */}
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

        {/* Icon Field */}
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
          <button style={styles.primaryBtn} onClick={handleNext}>
            Next
          </button>
          <button style={styles.secondaryBtn} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // STEP 2: SUMMARY
  const displayItems = items.filter(item => item.target.trim());

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Review Your Preset</h2>
      <div style={styles.summaryBox}>
        <p style={styles.summaryText}>
          <strong>Name:</strong> {name}
        </p>
        {description.trim() && (
          <p style={styles.summaryText}>
            <strong>Description:</strong> {description}
          </p>
        )}
        {icon.trim() && (
          <p style={styles.summaryText}>
            <strong>Icon:</strong> {icon}
          </p>
        )}

        {displayItems.length > 0 && (
          <>
            <h3 style={styles.subheader}>Items:</h3>
            <ul style={styles.itemList}>
              {displayItems.map((item, i) => (
                <li key={i} style={styles.listItem}>
                  <strong>{item.type.toUpperCase()}</strong> - {item.target}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <p style={styles.question}>Would you like to confirm and save this preset?</p>

      <div style={styles.buttonRow}>
        <button style={styles.primaryBtn} onClick={() => handleConfirm('confirm')}>
          Confirm
        </button>
        <button style={styles.primaryBtn} onClick={() => handleConfirm('launch')}>
          Confirm &amp; Launch
        </button>
        <button style={styles.secondaryBtn} onClick={() => setStep(1)}>
          Back
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
    marginBottom: '10px',
    lineHeight: '1.2'
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
  },
  summaryBox: {
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '15px',
    marginBottom: '10px'
  },
  summaryText: {
    margin: '6px 0'
  },
  itemList: {
    listStyleType: 'none',
    padding: 0,
    marginLeft: '0'
  },
  listItem: {
    backgroundColor: '#ecf0f1',
    marginBottom: '5px',
    padding: '5px 8px',
    borderRadius: '4px'
  },
  question: {
    margin: '10px 0'
  }
};

export default CreatePreset;
